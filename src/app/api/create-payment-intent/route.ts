import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore/lite';
import { firebaseConfig, firestoreDatabaseId } from '@/lib/firebase-config';

// Initialize Firebase if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, firestoreDatabaseId);

let stripeInstance: Stripe | null = null;
function getStripe(): Stripe {
    if (!stripeInstance) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            console.error("STRIPE_SECRET_KEY is missing from environment variables.");
            throw new Error('STRIPE_SECRET_KEY is required');
        }
        stripeInstance = new Stripe(key);
    }
    return stripeInstance;
}

export async function POST(req: Request) {
    console.log("Payment Intent API called");
    const startTime = Date.now();
    try {
        const body = await req.json();
        const { bookingId, userId } = body;
        
        if (!bookingId || !userId) {
            return NextResponse.json({ error: "Missing bookingId or userId" }, { status: 400 });
        }

        console.log(`Processing payment intent for booking: ${bookingId}, user: ${userId}`);

        // Fetch booking using client SDK since firestore.rules allow read: if true
        const bookingRef = doc(db, "bookings", bookingId);
        const bookingDoc = await getDoc(bookingRef);
        console.log(`Booking fetch took: ${Date.now() - startTime}ms`);

        if (!bookingDoc.exists()) {
            console.error("Booking not found:", bookingId);
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }
        
        const bookingData = bookingDoc.data();
        if (bookingData?.userId !== userId) {
            console.error("Unauthorized: userId mismatch", { requested: userId, found: bookingData?.userId });
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const serverAmount = Math.round((bookingData.amountTotal || 0) * 100);
        const serverCurrency = (bookingData.currency || "usd").toLowerCase();

        if (serverAmount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        console.log(`Stripe setup starting. Amount: ${serverAmount}, Currency: ${serverCurrency}`);
        const stripe = getStripe();
        
        const intentStartTime = Date.now();
        const paymentIntent = await stripe.paymentIntents.create({
            amount: serverAmount,
            currency: serverCurrency,
            receipt_email: bookingData.userEmail,
            metadata: { bookingId, userId },
            automatic_payment_methods: { enabled: true },
        });
        console.log(`Stripe intent creation took: ${Date.now() - intentStartTime}ms`);

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
        console.error("Payment intent error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        console.log(`Total API time: ${Date.now() - startTime}ms`);
    }
}
