import { NextResponse } from 'next/server';
import { adminDb, adminStorage, adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  let bookingId: string | null = null;
  let adminId: string | null = null;

  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    bookingId = body.bookingId;
    adminId = body.adminId;

    if (!bookingId || !adminId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Verify Admin
    console.log("Purge initiated by:", adminId, "for booking:", bookingId);
    
    let userDoc;
    try {
        userDoc = await adminDb.collection('users').doc(adminId).get();
    } catch(e) {
        console.error("DEBUG: Failed to get userDoc:", e);
        throw e;
    }
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      console.warn('Unauthorized: Admin access required');
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const bookingRef = adminDb.collection('bookings').doc(bookingId);
    let bookingDoc;
    try {
        bookingDoc = await bookingRef.get();
    } catch (e) {
        console.error("DEBUG: Failed to get bookingDoc:", e);
        throw e;
    }
    if (!bookingDoc.exists) {
      console.warn('Booking not found:', bookingId);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bucket = adminStorage.bucket();
    console.log("DEBUG: Got bucket name:", bucket.name);
    const prefix = `bookings/${bookingId}/`;
    
    // 2. List all files in the booking folder
    console.log("Listing files, prefix:", prefix);
    let files: any[] = [];
    try {
        [files] = await bucket.getFiles({ prefix });
    } catch (e) {
        console.error("DEBUG: Failed to list files:", e);
        throw e;
    }
    console.log("Files listed, count:", files.length);

    const deletedFiles: string[] = [];
    const keptFiles: string[] = [];

    // 3. Purge logic: Delete everything EXCEPT files in 'master/' folder
    console.log("Starting deletion loop...");
    const deletionPromises = files.map(async (file) => {
      const isMaster = file.name.includes(`${prefix}master/`);
      if (isMaster) {
        keptFiles.push(file.name);
        return null;
      } else {
        try {
          console.log("Attempting to delete:", file.name);
          await file.delete();
          console.log("Deleted:", file.name);
        } catch (e: any) {
          console.error("DEBUG: Storage deletion error occurred:", e);
          
          // Try to extract status code and message robustly
          const err: any = e instanceof Error ? e : { message: String(e), code: (e as any).code || (e as any).response?.status };
          const errorCode = String(err.code || '');
          const errorMessage = String(err.message || '');
          
          if (errorCode === '404' || errorCode === '5' || errorMessage.toUpperCase().includes('NOT_FOUND')) {
             console.warn("Storage deletion ignored:", { code: errorCode, message: errorMessage, fileName: file.name });
             return null;
          }
          console.error("Storage deletion hard fail:", { errorCode, errorMessage, fileName: file.name, originalError: e });
          throw e;
        }
        deletedFiles.push(file.name);
        return file.name;
      }
    });

    console.log("Awaiting deletion promises...");
    await Promise.all(deletionPromises);
    console.log("Deletion complete.");

    // 4. Update Firestore
    const sanitizedAt = new Date();
    console.log("Attempting to delete booking entry:", bookingId);
    try {
      await bookingRef.delete();
      console.log("Booking deleted successfully.");
    } catch (e: any) {
      console.error("Failed to delete booking entry (" + bookingRef.path + "):", e);
      throw new Error(`Failed to delete booking (${bookingRef.path}): ${e.message}`);
    }

    // Delete associated transactions
    console.log("Deleting transactions, searching for bookingId:", bookingId);
    try {
      const transactionsSnapshot = await adminDb.collection('transactions').where('bookingId', '==', bookingId).get();
      console.log("Transactions found to delete:", transactionsSnapshot.size);
      const transactionDeletions = transactionsSnapshot.docs.map(doc => {
          console.log("Deleting transaction:", doc.ref.path);
          return doc.ref.delete();
      });
      await Promise.all(transactionDeletions);
      console.log("Transactions deleted successfully.");
    } catch (e: any) {
      console.error("Failed to delete transactions for bookingId " + bookingId + ":", e);
      throw new Error(`Failed to delete transactions: ${e.message}`);
    }

    // 5. Audit Log
    console.log("Fetching admin user for audit log:", adminId);
    let adminEmail = 'unknown';
    try {
      const adminUser = await adminAuth.getUser(adminId);
      adminEmail = adminUser.email || 'unknown';
      console.log("Admin user fetched:", adminEmail);
    } catch (e) {
      console.error("DEBUG: Failed to get auth user:", e);
      console.warn("Could not fetch admin user from Auth, using fallback email:", adminId);
      adminEmail = `user-${adminId}@unknown`;
    }
    
    try {
      await adminDb.collection('audit_logs').add({
        adminId,
        adminEmail,
        action: 'Digital Sanitize',
        targetId: bookingId,
        details: `Admin ${adminEmail} performed Digital Sanitize on Project ${bookingId}. Purged ${deletedFiles.length} files, retained ${keptFiles.length} master assets, and deleted booking/transaction records.`,
        timestamp: sanitizedAt
      });
      console.log("Audit log added.");
    } catch (e) {
      console.error("Failed to add audit log:", e);
      throw new Error(`Failed to add audit log: ${(e as Error).message}`);
    }

    return NextResponse.json({ 
      success: true, 
      purgedCount: deletedFiles.length,
      retainedCount: keptFiles.length,
      message: `Project ${bookingId} sanitized successfully.`
    });

  } catch (error: any) {
    console.error('Purge Error Details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      bookingId: bookingId || 'unknown'
    });
    
    // Return a raw Response to ensure proper JSON serialization and Content-Type header
    return new Response(JSON.stringify({ 
      error: `Purge Error: ${error.message || 'Internal Server Error'}`,
      code: error.code || 'UNKNOWN_ERROR'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
