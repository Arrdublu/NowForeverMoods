"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Navbar } from "../../../components/Navbar";
import { Button } from "@/components/ui/button";
import { useGeoPricing } from "../../../hooks/useGeoPricing";
import { getAuthService, getDb } from "../../../lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export function BoutiqueClientDetail({ product }: { product: any }) {
    const { currency, calculateGeoPrice } = useGeoPricing();
    const auth = getAuthService();
    const db = getDb();
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const handleCheckout = async () => {
        setCheckoutLoading(true);
        try {
            const user = auth.currentUser;
            let userEmail = user?.email || "";
            if (!userEmail) {
                const promptEmail = prompt("Please enter your email for the receipt/digital delivery:");
                if (!promptEmail) {
                    setCheckoutLoading(false);
                    return;
                }
                userEmail = promptEmail;
            }

            const geoPrice = calculateGeoPrice(product.price);
            
            const docRef = await addDoc(collection(db, "orders"), {
                userId: user?.uid || "guest",
                userEmail,
                productId: product.id,
                productName: product.name,
                amountTotal: geoPrice,
                currency: currency.toLowerCase(),
                status: "pending",
                createdAt: new Date().toISOString()
            });

            const res = await fetch("/api/create-boutique-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: docRef.id, userId: user?.uid || 'guest' })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Failed to initiate checkout");
            }
        } catch (e) {
            console.error(e);
            alert("Error setting up payment");
        } finally {
            setCheckoutLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-accent/20">
            <Navbar />
            <div className="pt-32 px-8 pb-32 max-w-7xl mx-auto">
                <Link href="/boutique" className="inline-flex items-center text-[10px] uppercase font-bold tracking-widest text-brand-muted hover:text-brand-black transition-colors mb-12">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Boutique
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="w-full bg-brand-surface aspect-[4/5] relative border border-brand-line">
                            {product.imageUrl ? (
                                <Image src={product.imageUrl} fill alt={product.name} className="object-cover" referrerPolicy="no-referrer" priority />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-brand-muted/50 font-bold">No Image Available</div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center">
                        <div className="mb-8">
                            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-accent mb-4 block">
                                {product.category}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-serif text-brand-black mb-4 leading-tight">{product.name}</h1>
                            <div className="text-2xl font-light text-brand-black">
                                {currency === 'JMD' ? 'J$' : '$'}
                                {calculateGeoPrice(product.price).toLocaleString()}
                            </div>
                        </div>

                        <div className="prose prose-sm md:prose-base text-brand-muted mb-12">
                            {product.description ? (
                                <p className="leading-relaxed">{product.description}</p>
                            ) : (
                                <p className="italic">No description provided.</p>
                            )}
                        </div>

                        <div className="space-y-6 pt-8 border-t border-brand-line">
                            <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-brand-muted">
                                <span>Format: {product.isDigital ? 'Digital Download' : 'Physical Item'}</span>
                                {!product.isDigital && <span>•</span>}
                                {!product.isDigital && <span>Stock: {product.inStock}</span>}
                            </div>

                            {(!product.isDigital && product.inStock <= 0) ? (
                                <Button disabled className="w-full h-14 border border-brand-line rounded-none bg-brand-surface text-brand-muted text-[10px] uppercase tracking-widest font-bold">
                                    Currently Out of Stock
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading}
                                    className="w-full h-14 bg-brand-black hover:bg-zinc-800 text-white rounded-none text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center"
                                >
                                    {checkoutLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                                    {checkoutLoading ? 'Preparing Secured Checkout...' : 'Purchase Now'}
                                </Button>
                            )}
                            
                            <p className="text-center text-[9px] uppercase tracking-widest font-bold text-brand-muted/70 mt-4">
                                Secure Transact via Stripe
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
