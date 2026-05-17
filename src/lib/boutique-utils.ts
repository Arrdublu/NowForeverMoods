import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function sendDigitalDownloadEmail(orderId: string, email: string, productName: string, downloadUrl: string) {
    const db = getDb();
    // Simulate sending an email via trigger-mail
    try {
        const mailRef = doc(db, 'mail', `order_${orderId}`);
        await updateDoc(mailRef, {
            to: [email],
            message: {
                subject: `Your Secure Download: ${productName}`,
                html: `
                    <h2>Thank you for your purchase!</h2>
                    <p>You can download <strong>${productName}</strong> using the secure link below. This link will expire in 24 hours.</p>
                    <a href="${downloadUrl}" style="display:inline-block;padding:10px 20px;background:#1a1a1a;color:#fff;text-decoration:none;">Download Now</a>
                `
            }
        });
    } catch (e) {
        console.error("Email simulated failed", e);
    }
}
