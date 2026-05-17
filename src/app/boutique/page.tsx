"use client";
import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, addDoc } from "firebase/firestore";
import { getAuthService, getDb } from "../../lib/firebase";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { useGeoPricing } from "../../hooks/useGeoPricing";

export default function BoutiquePage() {
    const db = getDb();
    const auth = getAuthService();
    const { currency, calculateGeoPrice } = useGeoPricing();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "products"));
        const unsub = onSnapshot(q, (snap) => {
            setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            import("../../lib/firebase").then(({ handleFirestoreError }) => {
                handleFirestoreError(error, "list" as any, "products");
            });
        });
        return () => unsub();
    }, [db]);

    const handleQuickAdd = async (product: any) => {
        setCheckoutLoadingId(product.id);
        try {
            const user = auth.currentUser;
            let userEmail = user?.email || "";
            if (!userEmail) {
                const promptEmail = prompt("Please enter your email for the receipt/digital delivery:");
                if (!promptEmail) {
                    setCheckoutLoadingId(null);
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
            setCheckoutLoadingId(null);
        }
    };

    const displayProducts = filter === "All" ? products : products.filter(p => p.category === filter);

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
            <Navbar />
            <div className="pt-32 px-8 pb-16 max-w-7xl mx-auto">
                <header className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-brand-black mb-4">NFM Boutique</h1>
                    <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-muted">Digital & Physical Collective</p>
                    
                    <div className="flex justify-center gap-4 mt-8 flex-wrap">
                        {["All", "Digital Guides", "Presets", "Physical Legacy"].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 border transition-all ${filter === cat ? 'border-brand-black bg-brand-black text-white' : 'border-brand-line text-brand-muted hover:border-brand-black/50 hover:text-brand-black'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-brand-accent h-8 w-8" />
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {displayProducts.map(product => (
                            <motion.div 
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="break-inside-avoid bg-white border border-brand-line p-4 hover:shadow-lg transition-all flex flex-col group relative overflow-hidden"
                            >
                                <Link href={`/boutique/${product.id}`}>
                                    <div className="w-full bg-brand-surface aspect-[4/5] relative overflow-hidden mb-6">
                                        {product.imageUrl ? (
                                            <Image src={product.imageUrl} fill alt={product.name} className="object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-brand-muted/50 font-bold">No Image</div>
                                        )}
                                    </div>
                                </Link>
                                <div className="space-y-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <Link href={`/boutique/${product.id}`} className="hover:text-brand-accent transition-colors">
                                                <h3 className="font-serif text-2xl text-brand-black leading-tight">{product.name}</h3>
                                            </Link>
                                            <span className="text-sm font-light mt-1">
                                                {currency === 'JMD' ? 'J$' : '$'}
                                                {calculateGeoPrice(product.price).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-accent">
                                            {product.category}
                                            {!product.isDigital && ` • ${product.inStock} In Stock`}
                                        </p>
                                    </div>

                                    {(!product.isDigital && product.inStock <= 0) ? (
                                        <Button disabled className="w-full border-brand-line rounded-none bg-brand-surface text-brand-muted text-[10px] uppercase tracking-widest font-bold">
                                            Out of Stock
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={() => handleQuickAdd(product)}
                                            disabled={checkoutLoadingId === product.id}
                                            className="w-full bg-brand-black text-white hover:bg-zinc-800 rounded-none text-[10px] uppercase tracking-widest font-bold transition-all h-12"
                                        >
                                            {checkoutLoadingId === product.id ? <Loader2 className="animate-spin h-4 w-4" /> : 'Quick Add'}
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
                {!loading && displayProducts.length === 0 && (
                    <div className="text-center py-20 text-brand-muted text-[10px] uppercase tracking-widest font-bold">
                        No products available in this category.
                    </div>
                )}
            </div>
        </div>
    );
}
