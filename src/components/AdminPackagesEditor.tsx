'use client';
import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, updateDoc, doc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { getDb, handleFirestoreError } from "../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function PackageEditorCard({ pkg, onSave, onDelete, isDeleting }: { pkg: any, onSave: (id: string, data: any) => Promise<void>, onDelete: (id: string) => void, isDeleting: boolean }) {
  const [formData, setFormData] = useState({
    ...pkg,
    features: Array.isArray(pkg.features) ? pkg.features.join(', ') : (pkg.features || '')
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      ...pkg,
      features: Array.isArray(pkg.features) ? pkg.features.join(', ') : (pkg.features || '')
    });
  }, [pkg]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleMediaChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      media: { ...(prev.media || {}), [field]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        features: formData.features.split(',').map((s: string) => s.trim()).filter(Boolean)
      };
      await onSave(pkg.id, dataToSave);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white border-brand-line rounded-none">
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle className="text-lg">{pkg.name || "Untitled Package"}</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onDelete(pkg.id)} disabled={isDeleting} className="text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">Package Name</Label>
          <div className="flex items-center justify-between gap-4">
            <Input className="flex-1 rounded-none border-brand-line" value={formData.name || ''} placeholder="Package Name" onChange={(e) => handleChange('name', e.target.value)} />
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id={`featured-${pkg.id}`}
                checked={formData.isFeatured || false} 
                onChange={(e) => handleChange('isFeatured', e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-brand-accent"
              />
              <Label htmlFor={`featured-${pkg.id}`} className="text-[10px] uppercase font-bold cursor-pointer whitespace-nowrap">Featured</Label>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">Description</Label>
          <Textarea className="rounded-none border-brand-line" value={formData.description || ''} placeholder="Description" onChange={(e) => handleChange('description', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">USD Price</Label>
            <Input className="rounded-none border-brand-line" type="number" value={formData.usdPrice || ''} placeholder="USD Price" onChange={(e) => handleChange('usdPrice', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">JMD Price</Label>
            <Input className="rounded-none border-brand-line" type="number" value={formData.jmdPrice || ''} placeholder="JMD Price" onChange={(e) => handleChange('jmdPrice', parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">Type / Category</Label>
          <Input className="rounded-none border-brand-line" value={formData.type || ''} placeholder="Type (e.g. Branding Focus)" onChange={(e) => handleChange('type', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">Features (Comma-separated)</Label>
          <Textarea className="rounded-none border-brand-line h-24" value={formData.features || ''} placeholder="Features" onChange={(e) => handleChange('features', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">Expertise: Arrdublu</Label>
          <Input className="rounded-none border-brand-line" value={formData.expertiseProviderArr || ''} placeholder="Expertise Arr" onChange={(e) => handleChange('expertiseProviderArr', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">Expertise: Ioka</Label>
          <Input className="rounded-none border-brand-line" value={formData.expertiseProviderIok || ''} placeholder="Expertise Iok" onChange={(e) => handleChange('expertiseProviderIok', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">Media: Poster URL</Label>
          <Input className="rounded-none border-brand-line" value={formData.media?.poster || ''} placeholder="Poster URL" onChange={(e) => handleMediaChange('poster', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">Media: Video URL</Label>
          <Input className="rounded-none border-brand-line" value={formData.media?.videoLoop || ''} placeholder="Video Loop URL" onChange={(e) => handleMediaChange('videoLoop', e.target.value)} />
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full bg-brand-black hover:bg-zinc-800 text-white rounded-none mt-4 font-bold text-[10px] uppercase tracking-widest gap-2">
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}

export function AdminPackagesEditor() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(getDb(), "packages"));
    const unsub = onSnapshot(q, (snapshot) => {
      setPackages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'list', 'packages');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updatePackage = async (id: string, updatedData: any) => {
    try {
      await updateDoc(doc(getDb(), "packages", id), updatedData);
    } catch (error) {
      handleFirestoreError(error, 'update', `packages/${id}`);
    }
  };

  const addNewPackage = async () => {
    try {
      const newPkg = {
        name: 'New Package',
        type: 'New Type',
        description: '',
        usdPrice: 0,
        jmdPrice: 0,
        features: [],
        expertiseProviderArr: '',
        expertiseProviderIok: '',
        isFeatured: false,
        media: {
          poster: '',
          videoLoop: ''
        }
      };
      await addDoc(collection(getDb(), "packages"), newPkg);
    } catch (error) {
      handleFirestoreError(error, 'create', 'packages');
    }
  };

  const deletePackage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    setDeletingPackageId(id);
    try {
      await deleteDoc(doc(getDb(), "packages", id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `packages/${id}`);
    } finally {
      setDeletingPackageId(null);
    }
  };

  const seedPackages = async () => {
    const defaultPackages = [
      {
        id: 'exp-sig-motion',
        name: 'The Signature Motion',
        type: 'Branding Focus',
        description: 'For executives, artists, and public figures claiming their digital presence.',
        usdPrice: 1000,
        jmdPrice: 150000,
        isFeatured: true,
        features: ['60-second high-energy Cinematic Reel (4K)', '12 High-end retouched editorial portraits', 'Professional "Power Look" + on-set grooming', '90-minute session + mood board development', 'Deposit: 30% to secure date.'],
        expertiseProviderArr: '90-minute session + mood board development',
        expertiseProviderIok: 'Professional "Power Look" + on-set grooming',
        media: {
          poster: 'https://cdn.pixabay.com/photo/2020/02/05/17/20/model-4821616_1280.jpg',
          videoLoop: 'https://cdn.pixabay.com/video/2016/09/21/5361-183437941_tiny.mp4'
        }
      },
      {
        id: 'exp-legacy-film',
        name: 'The Legacy Film',
        type: 'Milestone Focus',
        description: 'For maternity, luxury birthdays, and those honoring a season of growth.',
        usdPrice: 1850,
        jmdPrice: 275000,
        isFeatured: false,
        features: ['3-minute Storyboarded "Living Portrait" Film with custom audio/narrative', '25 Premium retouched images', '2 Distinct looks + mid-session aesthetic shift', 'Half-day session (4 hours) + narrative consulting', 'Same-day "Behind-the-Scenes" content snippets', 'Deposit: 30% to secure date.'],
        expertiseProviderArr: 'Half-day session (4 hours) + narrative consulting',
        expertiseProviderIok: '2 Distinct looks + mid-session aesthetic shift',
        media: {
          poster: 'https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083379_1280.jpg',
          videoLoop: 'https://cdn.pixabay.com/video/2020/06/15/42045-430932219_tiny.mp4'
        }
      },
      {
        id: 'exp-nuptial-premiere',
        name: 'The Nuptial Premiere (Weddings & Elopements)',
        type: 'Wedding Collections',
        description: 'Our flagship orchestration for high-profile visual legacy.',
        usdPrice: 3000,
        jmdPrice: 450000,
        isFeatured: true,
        features: ['5-7m Narrative Feature Film + 60s Teaser + Full Ceremony edit', '50+ Master-retouched images in an encrypted digital gallery', 'Private Bridal Consultation & Trial + Full Day-of Bridal Beauty', 'Cinematic Timeline Planning + Direction for "First Look" and "Golden Hour"', 'Security: Covered by the Closed-Loop Data Stewardship protocol', 'Deposit: 40% to secure date.'],
        expertiseProviderArr: 'Cinematic Timeline Planning + Direction for First Look and Golden Hour',
        expertiseProviderIok: 'Private Bridal Consultation & Trial + Full Day-of Bridal Beauty',
        media: {
          poster: 'https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083379_1280.jpg',
          videoLoop: 'https://cdn.pixabay.com/video/2018/10/16/18653-294371587_tiny.mp4'
        }
      }
    ];

    for (const pkg of defaultPackages) {
       await setDoc(doc(getDb(), "packages", pkg.id), pkg);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif text-brand-ink">Manage Packages</h2>
        <Button onClick={addNewPackage} className="bg-brand-black hover:bg-brand-ink text-white rounded-none flex items-center gap-2">
          <Plus size={16} /> Add Package
        </Button>
      </div>

      {packages.length === 0 && (
         <Button onClick={seedPackages} className="bg-brand-black text-white rounded-none">Initialize Default Packages</Button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map(pkg => (
          <PackageEditorCard 
            key={pkg.id} 
            pkg={pkg} 
            onSave={updatePackage} 
            onDelete={deletePackage} 
            isDeleting={deletingPackageId === pkg.id} 
          />
        ))}
      </div>
    </div>
  );
}
