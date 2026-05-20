import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore/lite';
import firebaseConfig from '../../../../firebase-applet-config.json';

// Initialize Firebase if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
    if (!stripeInstance) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key || key.includes('secrets/') || key === 'placeholder') {
             throw new Error('Stripe API Key is missing or invalid. Please configure your actual STRIPE_SECRET_KEY in the app settings.');
        }
        stripeInstance = new Stripe(key);
    }
    return stripeInstance;
}

export async function POST(req: Request) {
    const { orderId, userId } = await req.json();
    const url = new URL(req.url);
    const baseUrl = process.env.APP_URL || `${url.protocol}//${url.host}`;

    try {
        const orderRef = doc(db, "orders", orderId);
        const orderDoc = await getDoc(orderRef);
        if (!orderDoc.exists()) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        
        const orderData = orderDoc.data();

        const serverAmount = Math.round((orderData?.amountTotal || 0) * 100);
        const serverCurrency = orderData?.currency || "usd";
        const productName = orderData?.productName || "Boutique Product";

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: serverCurrency,
                    product_data: { name: productName },
                    unit_amount: serverAmount,
                },
                quantity: 1,
            }],
            mode: "payment",
            success_url: `${baseUrl}/boutique/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/boutique`,
            metadata: { orderId, userId: userId || 'guest' },
        });
        return NextResponse.json({ id: session.id, url: session.url });
    } catch (error: any) {
        const isStripeMissing = error.message?.includes('Stripe API Key') || error.message?.includes('STRIPE_SECRET_KEY');
        return NextResponse.json({ 
            error: error.message, 
            stripeKeyMissing: isStripeMissing 
        }, { status: isStripeMissing ? 400 : 500 });
    }
}
