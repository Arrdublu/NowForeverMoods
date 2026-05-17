'use client';
import { ExperienceCollections } from "@/components/ExperienceCollections";
import { Navbar } from "@/components/Navbar";

export default function Page() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <div className="pt-24">
        {/* We reuse ExperienceCollections because it contains the selection logic and the BookingForm */}
        <ExperienceCollections />
      </div>
    </div>
  );
}
