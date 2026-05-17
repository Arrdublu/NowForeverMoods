"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
import { getDb, handleFirestoreError } from "../lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export function LeadMagnet() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleDownload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            const db = getDb();
            // Save email for retargeting
            await addDoc(collection(db, "leads"), {
                email,
                source: "Aesthetic Blueprint",
                createdAt: new Date().toISOString()
            });

            // Trigger email send
            await addDoc(collection(db, "mail"), {
                to: [email],
                message: {
                    subject: "Your Free Guide: Aesthetic Blueprint (Mini Version)",
                    html: `
                        <h2>Here is your Camera-Ready Glow Guide!</h2>
                        <p>Hi there,</p>
                        <p>Thank you for downloading Ioka's 5-step guide.</p>
                        <p>1. Hydrate intensely.</p>
                        <p>2. Exfoliate gently.</p>
                        <p>3. Moisturize to the max.</p>
                        <p>4. Prime strategically.</p>
                        <p>5. Set the look.</p>
                        <p>When you're ready for the full Nuptial Premiere or Legacy Film packages, we'll be here.</p>
                        <p>— Ioka & Arrdublu</p>
                    `
                }
            });
            setSuccess(true);
        } catch (error) {
            handleFirestoreError(error, "write", "leads");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="mt-8 p-6 bg-brand-surface border border-emerald-200 text-center">
                <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 mb-2">Success!</p>
                <p className="text-sm font-medium text-brand-black">Check your inbox for the Aesthetic Blueprint.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-stone-100 border border-brand-line mt-6">
            <h4 className="text-lg font-serif italic text-brand-black mb-2">Not ready to book?</h4>
            <p className="text-xs text-brand-muted mb-4 leading-relaxed">
                Download Ioka&apos;s 5-step guide to the Camera-Ready Glow. Our exclusive &quot;Aesthetic Blueprint&quot; (Mini Version).
            </p>
            <form onSubmit={handleDownload} className="flex flex-col gap-3">
                <Input 
                    type="email" 
                    required 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-none border-brand-line bg-white" 
                />
                <Button 
                    type="submit" 
                    disabled={loading}
                    variant="outline"
                    className="rounded-none text-[10px] uppercase tracking-widest font-bold border-brand-line bg-transparent hover:bg-white transition-all h-10"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Download Free Guide"}
                </Button>
            </form>
        </div>
    );
}
