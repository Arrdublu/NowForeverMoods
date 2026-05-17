'use client';
import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Currency } from "../hooks/useGeoPricing";
import { CinematicPackage } from "./CinematicPackage";

interface PackageProps {
  currency: Currency;
  onBook: (pkg: any) => void;
}

const signatureSessions = [
  {
    id: 'sig-1',
    name: 'The Signature Motion',
    description: 'For executives, artists, and public figures claiming their digital presence.',
    type: 'signature' as const,
    usdPrice: 1000,
    jmdPrice: 150000,
    features: [
      { label: '60-second high-energy Cinematic Reel (4K)', provider: 'Arrdublu' as const },
      { label: '12 High-end retouched editorial portraits', provider: 'NowForeverMoods' as const },
      { label: 'Professional "Power Look" + on-set grooming', provider: 'Ioka' as const },
      { label: '90-minute session + mood board development', provider: 'Arrdublu' as const },
      { label: 'Deposit: 30% to secure date.', provider: 'NowForeverMoods' as const },
    ],
    credits: { production: 'Arrdublu', beauty: 'Ioka' },
    media: {
      videoLoop: 'https://cdn.pixabay.com/video/2016/09/21/5361-183437941_tiny.mp4',
      fullReel: 'https://cdn.pixabay.com/video/2021/04/09/70498-535787611_tiny.mp4'
    }
  },
  {
    id: 'sig-2',
    name: 'The Legacy Film',
    description: 'For maternity, luxury birthdays, and those honoring a season of growth.',
    type: 'signature' as const,
    usdPrice: 1850,
    jmdPrice: 275000,
    features: [
      { label: '3-minute Storyboarded "Living Portrait" Film with custom audio/narrative', provider: 'Arrdublu' as const },
      { label: '25 Premium retouched images', provider: 'NowForeverMoods' as const },
      { label: '2 Distinct looks + mid-session aesthetic shift', provider: 'Ioka' as const },
      { label: 'Half-day session (4 hours) + narrative consulting', provider: 'Arrdublu' as const },
      { label: 'Same-day "Behind-the-Scenes" content snippets', provider: 'NowForeverMoods' as const },
      { label: 'Deposit: 30% to secure date.', provider: 'NowForeverMoods' as const },
    ],
    credits: { production: 'Arrdublu', beauty: 'Ioka' },
    media: {
      videoLoop: 'https://cdn.pixabay.com/video/2020/06/15/42045-430932219_tiny.mp4',
      fullReel: 'https://cdn.pixabay.com/video/2018/10/16/18653-294371587_tiny.mp4'
    }
  },
];

const weddingCollections = [
  {
    id: 'wed-1',
    name: 'The Nuptial Premiere (Weddings & Elopements)',
    description: 'Our flagship orchestration for high-profile visual legacy.',
    type: 'wedding' as const,
    usdPrice: 3000,
    jmdPrice: 450000,
    features: [
      { label: '5-7m Narrative Feature Film + 60s Teaser + Full Ceremony edit', provider: 'Arrdublu' as const },
      { label: '50+ Master-retouched images in an encrypted digital gallery', provider: 'NowForeverMoods' as const },
      { label: 'Private Bridal Consultation & Trial + Full Day-of Bridal Beauty', provider: 'Ioka' as const },
      { label: 'Cinematic Timeline Planning + Direction for "First Look" and "Golden Hour"', provider: 'Arrdublu' as const },
      { label: 'Security: Covered by the Closed-Loop Data Stewardship protocol', provider: 'NowForeverMoods' as const },
      { label: 'Deposit: 40% to secure date.', provider: 'NowForeverMoods' as const },
    ],
    credits: { production: 'Arrdublu', beauty: 'Ioka' },
    media: {
      videoLoop: 'https://cdn.pixabay.com/video/2018/10/16/18653-294371587_tiny.mp4',
      fullReel: 'https://cdn.pixabay.com/video/2021/04/09/70498-535787611_tiny.mp4'
    },
    timeline: [
      { day: 'Day 01', events: ['Beauty Prep', 'First Look', 'Cinematic Portraits', 'Reception Narrative'] },
      { day: 'Day 02', events: ['Day-After Lifestyle Shoot', 'Visual Debrief'] }
    ]
  },
];

export function Packages({ currency, onBook }: PackageProps) {
  const getPrice = (pkg: any) => currency === 'USD' ? `$${pkg.usdPrice}` : `J$${pkg.jmdPrice.toLocaleString()}`;
  const sigNames = signatureSessions.map(p => `${p.name} (${getPrice(p)})`).join(', ');
  const wedNames = weddingCollections.map(p => `${p.name} (${getPrice(p)})`).join(', ');
  const seoDescription = `Discover our luxury photography collections. Signature Sessions: ${sigNames}. Wedding Collections: ${wedNames}.`;

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 bg-brand-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <span className="text-[10px] uppercase tracking-[0.6em] text-brand-accent font-bold mb-4 block underline underline-offset-8">Curriculum of Visuals</span>
        <h2 className="text-5xl md:text-7xl font-serif italic text-brand-black tracking-tighter">The Collections</h2>
        <p className="text-brand-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-8 italic">A Collective Alignment by Arrdublu & Ioka</p>
      </motion.div>

      <Tabs defaultValue="wedding" className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 bg-transparent mb-16 p-1 h-14 rounded-full border border-brand-line">
          <TabsTrigger value="wedding" className="rounded-full data-active:bg-brand-black data-active:text-white text-brand-muted text-[10px] uppercase tracking-[0.3em] font-bold h-full border-none shadow-none transition-all duration-500">Wedding Collections</TabsTrigger>
          <TabsTrigger value="signature" className="rounded-full data-active:bg-brand-black data-active:text-white text-brand-muted text-[10px] uppercase tracking-[0.3em] font-bold h-full border-none shadow-none transition-all duration-500">Signature Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="wedding" className="space-y-12 focus-visible:outline-none">
          {weddingCollections.map(pkg => (
            <CinematicPackage 
              key={pkg.id} 
              title={pkg.name}
              description={pkg.description}
              price={currency === 'USD' ? `$${pkg.usdPrice}` : `J$${pkg.jmdPrice.toLocaleString()}`}
              features={pkg.features}
              credits={(pkg as any).credits}
              media={pkg.media}
              type={pkg.type}
              timeline={pkg.timeline}
              onBook={() => onBook(pkg)}
              onConsult={() => { window.location.href = '/support'; }}
            />
          ))}
        </TabsContent>
        <TabsContent value="signature" className="space-y-12 focus-visible:outline-none">
          {signatureSessions.map(pkg => (
           <CinematicPackage 
              key={pkg.id} 
              title={pkg.name}
              description={pkg.description}
              price={currency === 'USD' ? `$${pkg.usdPrice}` : `J$${pkg.jmdPrice.toLocaleString()}`}
              features={pkg.features}
              credits={(pkg as any).credits}
              media={pkg.media}
              type={pkg.type}
              onBook={() => onBook(pkg)}
              onConsult={() => { window.location.href = '/support'; }}
            />
          ))}
        </TabsContent>
      </Tabs>

      <div className="mt-32 flex flex-col md:flex-row gap-8 justify-center items-center">
        <Button variant="outline" className="h-16 px-12 rounded-full border-brand-line text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-brand-surface w-full md:w-auto shadow-sm transition-all duration-300">Request Private Portfolio</Button>
        <Button variant="outline" className="h-16 px-12 rounded-full border-brand-line text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-brand-surface w-full md:w-auto shadow-sm transition-all duration-300">Enterprise Collaboration</Button>
      </div>
    </div>
  );
}
