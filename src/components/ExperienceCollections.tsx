'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGeoPricing, Currency } from '../hooks/useGeoPricing';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { getDb, getAuthService, handleFirestoreError } from '../lib/firebase';
import { Loader2, Plus, ArrowRight, Video, Sparkles, Check, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StripePayment } from './StripePayment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingForm } from './BookingForm';
import { LeadMagnet } from './LeadMagnet';
import Image from 'next/image';

function PackageCard({ pkg, currency, onBook }: { pkg: any, currency: Currency, onBook: (pkg: any) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [priceDisplay, setPriceDisplay] = useState<string>('');
  const [depositDisplay, setDepositDisplay] = useState<string>('');

  useEffect(() => {
    const baseP = currency === 'USD' ? Number(pkg.usdPrice) : Number(pkg.jmdPrice);
    const dep = baseP * 0.50;
    setPriceDisplay(currency === 'USD' ? `$${baseP}` : `J$${baseP.toLocaleString()}`);
    setDepositDisplay(currency === 'USD' ? `$${dep}` : `J$${dep.toLocaleString()}`);
  }, [currency, pkg.usdPrice, pkg.jmdPrice]);

  useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered]);

  return (
    <motion.div 
      initial={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-stone-50 border overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-700 ${pkg.isFeatured ? 'border-brand-accent shadow-lg ring-1 ring-brand-accent/20 relative' : 'border-stone-200'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className="relative w-full h-[340px] md:h-[400px] overflow-hidden bg-black">
        <Image 
          src={pkg.media?.poster || '/hero.jpg'} 
          alt={pkg.name || 'Package'} 
          fill
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          referrerPolicy="no-referrer"
        />
        <video
          ref={videoRef}
          src={pkg.media.videoLoop}
          poster={pkg.media.poster}
          muted
          playsInline
          loop
          preload="none"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <div className="flex gap-2">
            {pkg.isFeatured && (
              <Badge variant="outline" className="text-brand-accent border-brand-accent/40 bg-brand-accent/10 mb-3 uppercase tracking-[0.2em] text-[9px] backdrop-blur-md rounded-none">
                Featured
              </Badge>
            )}
            <Badge variant="outline" className="text-white border-white/40 bg-black/40 mb-3 uppercase tracking-widest text-[9px] backdrop-blur-md rounded-none drop-shadow-md">
              {pkg.type}
            </Badge>
          </div>
          <h3 className="text-white text-3xl font-serif italic drop-shadow-lg">{pkg.name}</h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-8">
        <p className="text-stone-600 text-sm mb-8 leading-relaxed">
          {pkg.description}
        </p>

        <div className="mb-8 flex flex-col gap-2">
          {pkg.features.map((feat: string, i: number) => (
             <div key={i} className="flex items-center gap-3">
               <div className="w-1 h-1 bg-amber-200 rounded-full flex-shrink-0" />
               <span className="text-stone-800 text-xs font-bold uppercase tracking-wide">{feat}</span>
             </div>
          ))}
        </div>

        <div className="py-6 border-y border-stone-200 mb-8 space-y-4">
          <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-4">Collective Signature</h4>
          <div className="flex flex-col gap-1">
             <span className="text-[10px] uppercase font-bold text-stone-900 tracking-widest flex justify-between">
               <span>Production: Arrdublu</span>
             </span>
             <span className="text-xs text-stone-500 italic">{pkg.expertiseProviderArr}</span>
          </div>
          <div className="flex flex-col gap-1 mt-3">
             <span className="text-[10px] uppercase font-bold text-stone-900 tracking-widest flex justify-between">
               <span>Aesthetics: Ioka</span>
             </span>
             <span className="text-xs text-stone-500 italic">{pkg.expertiseProviderIok}</span>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase text-stone-500 tracking-widest font-bold">Total Investment</span>
            <span className="text-2xl font-serif text-stone-900">{priceDisplay}</span>
            <span className="text-[10px] text-stone-400 tracking-wide mt-1">50% Retainer: <span className="font-bold text-stone-600">{depositDisplay}</span></span>
          </div>
          <Button 
            onClick={() => onBook(pkg)}
            className="rounded-none bg-brand-accent hover:bg-brand-black hover:text-white transition-all duration-500 uppercase tracking-[0.3em] text-[9px] h-14 px-8 border border-white/20 shadow-lg hover:shadow-brand-accent/20 active:scale-90 active:bg-zinc-800"
          >
            Book Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function ExperienceCollections() {
  const { currency } = useGeoPricing();
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(getDb(), "packages"));
    const unsub = onSnapshot(q, (snapshot) => {
        const sortedPackages = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || "",
              description: data.description || "",
              type: data.type || "signature",
              usdPrice: Number(data.usdPrice) || 0,
              jmdPrice: Number(data.jmdPrice) || 0,
              isFeatured: Boolean(data.isFeatured),
              features: Array.isArray(data.features) ? [...data.features] : [],
              media: {
                poster: data.media?.poster || "",
                videoLoop: data.media?.videoLoop || ""
              },
              expertiseProviderArr: data.expertiseProviderArr || "",
              expertiseProviderIok: data.expertiseProviderIok || ""
            };
          })
          .sort((a: any, b: any) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return a.usdPrice - b.usdPrice;
          });
        setPackages(sortedPackages);
    }, (error) => {
      handleFirestoreError(error, 'list', 'packages');
    });
    return () => unsub();
  }, []);

  const handleBook = (pkg: any) => {
    setSelectedPkg(pkg);
    setIsBookingOpen(true);
  };

  return (
    <div id="packages" className="w-full bg-[#fafaf9] py-32">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-24 text-center max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-600 mb-4 block">NowForeverMoods Collections</span>
          <h2 className="text-4xl md:text-6xl font-serif italic text-stone-900 tracking-tight mb-6">Experience Tiers</h2>
          <p className="text-stone-500 uppercase tracking-widest text-xs font-bold leading-relaxed">
            The intersection of high-fashion beauty and cinematic storytelling.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} currency={currency} onBook={handleBook} />
          ))}
        </div>
        <div className="mt-16 max-w-lg mx-auto">
          <LeadMagnet />
        </div>
      </div>
      <BookingForm
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedPackage={selectedPkg}
        currency={currency}
      />
    </div>
  );
}
