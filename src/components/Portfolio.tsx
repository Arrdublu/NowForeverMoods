'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getDb, handleFirestoreError } from '../lib/firebase';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ArrowUpRight, Share, Search, MoreHorizontal, Tag as TagIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import img1 from '@/assets/images/regenerated_image_1778833092121.webp';
import img2 from '@/assets/images/regenerated_image_1778769960902.png';
import img3 from '@/assets/images/regenerated_image_1778769964034.png';
import img4 from '@/assets/images/regenerated_image_1778769968060.png';
import img5 from '@/assets/images/regenerated_image_1778769969811.png';
import img6 from '@/assets/images/regenerated_image_1778769971493.png';

const STATIC_ARCHIVES = [
  { id: 'static-1', type: 'image', url: img1, title: 'Editorial Frame 1', theme_category: 'Editorial' },
  { id: 'static-2', type: 'image', url: img2, title: 'The Aligned Woman 1', theme_category: 'The Aligned Woman' },
  { id: 'static-3', type: 'image', url: img3, title: 'Nuptial Poetry 1', theme_category: 'Nuptial Poetry' },
  { id: 'static-4', type: 'image', url: img4, title: 'Seasonal Becoming 1', theme_category: 'Seasonal Becoming' },
  { id: 'static-5', type: 'image', url: img5, title: 'Muted Tropics 1', theme_category: 'Muted Tropics' },
  { id: 'static-6', type: 'image', url: img6, title: 'Caribbean 1', theme_category: 'Caribbean' }
];

const LEGACY_THEMES = [
  "All",
  "The Aligned Woman",
  "Nuptial Poetry",
  "Seasonal Becoming",
  "Muted Tropics",
  "Caribbean",
  "Luxury",
  "Bridal Makeup",
  "Editorial",
  "Beauty Architecture"
];

export function Portfolio() {
  const [items, setItems] = useState<any[]>(STATIC_ARCHIVES);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [activeTheme, setActiveTheme] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showTagFilters, setShowTagFilters] = useState(false);

  // Derive available tags from loaded items
  const availableTags = Array.from(new Set(
    items.flatMap(item => [
      ...(item.tags || []),
      ...(item.artistry_themes || []),
      ...(item.metadata_tags || [])
    ])
  )).filter(tag => typeof tag === 'string' && tag.length > 0).sort();

  useEffect(() => {
    const q = query(collection(getDb(), 'portfolio_items'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const dbItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(dbItems.length > 0 ? dbItems : STATIC_ARCHIVES);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'list', 'portfolio_items');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredItems = items.filter(item => {
    // Category check
    const matchesTheme = activeTheme === "All" || item.theme_category === activeTheme || item.category === activeTheme;
    
    // Tag check (Additive)
    const itemTags = [
      ...(item.tags || []),
      ...(item.artistry_themes || []),
      ...(item.metadata_tags || [])
    ].map(t => String(t).toLowerCase());

    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => itemTags.includes(tag.toLowerCase()));

    // Search check
    const query = searchQuery.toLowerCase();
    const matchesSearch = query === "" || 
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.author && item.author.toLowerCase().includes(query)) ||
      itemTags.some(tag => tag.includes(query));
      
    return matchesTheme && matchesTags && matchesSearch;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleShare = async (itemToShare: any = selectedItem) => {
    if (!itemToShare) return;
    
    const shareData = {
      title: itemToShare.title || 'NowForeverMoods',
      text: itemToShare.description || 'Discover timeless frames at NowForeverMoods.',
      url: window.location.href,
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return <div className="py-24 flex items-center justify-center text-xs uppercase tracking-widest font-medium text-brand-muted">Loading Archives...</div>;
  }

  if (items.length === 0) {
    return <div className="py-24 text-center text-xs uppercase tracking-widest font-medium text-brand-muted bg-brand-surface border-y border-brand-line">No items in the archive yet.</div>;
  }

  return (
    <section className="w-full">
      {/* Category Bar and Search */}
      <div className="w-full border-b border-brand-line bg-brand-bg sticky top-0 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex overflow-x-auto no-scrollbar gap-6 min-w-0 py-4 w-full md:w-auto">
              {LEGACY_THEMES.map((theme) => (
                <button
                  key={theme}
                  onClick={() => {
                    setActiveTheme(theme);
                    // Optionally clear tags when changing main theme
                    // setSelectedTags([]);
                  }}
                  className={cn(
                    "text-xs whitespace-nowrap uppercase tracking-[0.2em] font-medium transition-all duration-300 relative py-2",
                    activeTheme === theme ? "text-brand-ink" : "text-brand-muted hover:text-brand-ink/70"
                  )}
                >
                  {theme}
                  {activeTheme === theme && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-brand-ink"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowTagFilters(!showTagFilters)}
              className={cn(
                "hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold px-4 py-2 border rounded-full transition-colors",
                showTagFilters || selectedTags.length > 0 ? "border-brand-ink text-brand-ink bg-brand-ink/5" : "border-brand-line text-brand-muted hover:border-brand-muted"
              )}
            >
              <Filter size={12} />
              Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
            </button>
          </div>

          <div className="relative w-full md:w-64 pb-4 md:pb-0 flex-shrink-0 flex items-center justify-center gap-2">
            <div className="relative w-full text-brand-muted focus-within:text-brand-black transition-colors">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search archives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border border-brand-line rounded-full pl-10 pr-4 py-2 text-[10px] uppercase font-bold tracking-widest text-brand-black focus:outline-none focus:border-brand-ink/50 transition-colors placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
              />
            </div>
            <button 
              onClick={() => setShowTagFilters(!showTagFilters)}
              className="md:hidden p-2 text-brand-muted border border-brand-line rounded-full"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Tags Expandable Area */}
        <AnimatePresence>
          {(showTagFilters || selectedTags.length > 0) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-brand-surface/50 border-t border-brand-line"
            >
              <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brand-muted mr-2 flex items-center gap-1">
                    <TagIcon size={12} /> Filter by Tags:
                  </span>
                  
                  {availableTags.length > 0 ? (
                    availableTags.slice(0, 20).map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium transition-all",
                          selectedTags.includes(tag)
                            ? "bg-brand-ink text-white"
                            : "bg-brand-bg text-brand-muted border border-brand-line hover:border-brand-muted"
                        )}
                      >
                        {tag}
                      </button>
                    ))
                  ) : (
                    <span className="text-[10px] text-brand-muted italic uppercase tracking-widest">No tags available</span>
                  )}

                  {selectedTags.length > 0 && (
                    <button 
                      onClick={() => setSelectedTags([])}
                      className="ml-auto text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:underline flex items-center gap-1"
                    >
                      <X size={12} /> Clear Filters
                    </button>
                  )}
                </div>
                
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-brand-line/50">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/60 mr-2">Selected:</span>
                    {selectedTags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="bg-brand-ink/10 text-brand-ink hover:bg-brand-ink/20 cursor-pointer flex items-center gap-1 text-[10px] px-2"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag} <X size={10} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Masonry Grid */}
      <div className="p-3 md:p-6 bg-brand-bg max-w-[1600px] mx-auto min-h-screen">
        <motion.div layout className="columns-2 md:columns-3 lg:columns-4 xl:columns-4 gap-3 md:gap-4">
          <AnimatePresence>
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "relative mb-3 md:mb-4 group rounded-3xl overflow-hidden bg-brand-surface break-inside-avoid cursor-pointer transform-gpu outline-none select-none",
                  item.type === 'text' ? "border border-stone-200" : "border-none"
                )}
                onClick={() => { if(item.type !== 'text') setSelectedItem(item); }}
              >
                {item.type === 'text' ? (
                  <div className="w-full h-full bg-stone-50 p-6 md:p-8 flex flex-col justify-center min-h-[220px] transition-transform duration-700 group-hover:scale-[1.02]">
                    <p className="font-serif text-lg md:text-xl text-brand-black leading-relaxed italic mb-4">
                      &quot;{item.text || item.description || "The essence of timeless beauty captured in a fleeting frame."}&quot;
                    </p>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold">
                      — {item.author || item.title || "NowForeverMoods"}
                    </p>
                  </div>
                ) : item.type === 'video' ? (
                  <video 
                    src={item.url} 
                    className="w-full object-cover rounded-3xl transition-transform duration-[2s] ease-out group-hover:scale-105"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    src={item.url || ''}
                    alt={item.title || `Portfolio item`}
                    width={800}
                    height={1200}
                    className="w-full h-auto object-cover rounded-3xl transition-transform duration-[2s] ease-out group-hover:scale-[1.02]"
                    priority={idx < 4}
                    placeholder={typeof item.url === 'object' ? "blur" : "empty"}
                    referrerPolicy="no-referrer"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                )}
                
                {/* Hover State Overlay for Media */}
                {item.type !== 'text' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-brand-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:duration-500 flex flex-col justify-end p-4 md:p-5 active:opacity-100 pointer-events-none">
                      <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white/90 text-[10px] uppercase tracking-widest font-bold drop-shadow-sm">Arrdublu x Ioka</p>
                      </div>
                    </div>
                    
                    {/* Pinterest style three-dot menu */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                      className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white hover:text-black active:opacity-100 shadow-lg z-10"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    
                    {/* Active state overlay for mobile tap-and-hold info */}
                    <div className="absolute inset-0 bg-brand-black/40 opacity-0 active:opacity-100 sm:hidden transition-opacity duration-200 pointer-events-none flex items-end justify-start p-4">
                       <p className="text-white text-[10px] uppercase tracking-widest font-bold drop-shadow-sm pb-10">Arrdublu x Ioka</p>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredItems.length === 0 && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
             <p className="text-brand-muted font-serif text-xl italic">No archives found for this mood.</p>
           </motion.div>
        )}
      </div>

      {/* The Discovery Modal (Immersive Expansion) */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent 
          showCloseButton={false}
          className="fixed top-0 left-0 translate-x-0 translate-y-0 z-50 w-screen h-[100dvh] max-w-none sm:max-w-none m-0 p-0 rounded-none border-none bg-[#111111]/95 backdrop-blur-md overflow-hidden flex flex-col"
        >
          <DialogTitle className="sr-only">{selectedItem?.title || 'Details'}</DialogTitle>
          
          {selectedItem && (
            <>
              {/* Top Navbar */}
              <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50 pointer-events-none">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-12 h-12 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center hover:bg-white/10 transition-colors pointer-events-auto backdrop-blur-md"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-3 pointer-events-auto">
                  <button 
                    onClick={() => handleShare()}
                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-full font-medium text-sm transition-colors backdrop-blur-md flex items-center gap-2"
                  >
                    Share <Share size={16} />
                  </button>
                  <Link 
                    href={`/booking?ref=${selectedItem.id}&title=${encodeURIComponent(selectedItem.title || 'Editorial')}`} 
                    className="bg-brand-black hover:bg-brand-accent text-white px-6 py-3 rounded-full font-medium text-sm transition-colors shadow-lg"
                  >
                    Inquire
                  </Link>
                </div>
              </div>

              {/* Main Scrollable Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar pt-24 pb-32 px-4 flex flex-col items-center">
                
                {/* Media Wrapper */}
                <div className="relative w-full max-w-[90vw] md:max-w-[75vw] lg:max-w-[1000px] rounded-[2rem] flex-shrink-0 overflow-hidden bg-zinc-900 shadow-2xl flex items-center justify-center">
                  {selectedItem.type === 'video' ? (
                     <video src={selectedItem.url || ''} autoPlay loop muted playsInline className="w-full h-auto max-h-[85vh] object-contain" />
                  ) : (
                     <Image src={selectedItem.url || ''} alt={selectedItem.title || 'Portfolio item'} width={1200} height={1600} priority placeholder={typeof selectedItem.url === 'object' ? "blur" : "empty"} className="w-full h-auto max-h-[85vh] object-contain" referrerPolicy="no-referrer" sizes="100vw" />
                  )}

                  {/* Floating Action Bar */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <Link 
                      href={`/booking?ref=${selectedItem.id}&title=${encodeURIComponent(selectedItem.title || 'Editorial')}`} 
                      className="bg-white/20 backdrop-blur-xl text-white px-5 py-3 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-white/30 transition-colors shadow-lg"
                    >
                       <ArrowUpRight size={18} /> Book Session
                    </Link>
                    <Link href="/packages" className="bg-white/20 backdrop-blur-xl text-white px-5 py-3 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-white/30 transition-colors shadow-lg">
                       View Packages
                    </Link>
                  </div>
                </div>

                {/* Details Wrapper (Pinterest style flow) */}
                <div className="w-full max-w-[90vw] md:max-w-[75vw] lg:max-w-[1000px] mt-10 text-zinc-100 flex flex-col gap-6 px-2">
                   <div>
                     <h2 className="text-4xl font-serif mb-2">{selectedItem.title || 'Curated Frame'}</h2>
                     <p className="text-zinc-400 font-medium tracking-wide text-sm">Arrdublu x Ioka</p>
                   </div>
                   
                   <p className="text-zinc-300 leading-relaxed text-lg font-light">
                     {selectedItem.description || "A timeless capture expressing deep narrative and aesthetic intention. This frame speaks to the subtle interplay of light and emotional resonance."}
                   </p>

                   {/* Tags / Themes */}
                   <div className="flex flex-wrap gap-2 pt-2">
                     {(selectedItem.artistry_themes || selectedItem.tags || selectedItem.metadata_tags || ["Editorial", "Tonal Mastery", "Raw Intimacy"]).map((tag: string) => (
                       <button 
                         key={tag} 
                         onClick={() => {
                           if (!selectedTags.includes(tag)) {
                             toggleTag(tag);
                             setShowTagFilters(true);
                           }
                           setSelectedItem(null);
                         }}
                         className={cn(
                           "bg-zinc-800/80 border border-white/10 text-zinc-300 px-5 py-2 rounded-full text-sm font-medium transition-colors",
                           selectedTags.includes(tag) ? "bg-brand-accent/20 border-brand-accent/50 text-brand-accent" : "hover:bg-zinc-700"
                         )}
                       >
                         {tag}
                       </button>
                     ))}
                   </div>
                   
                   {/* Production Notes */}
                   <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 mt-4">
                     <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 font-bold">Production (Arrdublu)</h3>
                     <p className="text-sm text-zinc-400 font-mono">
                       {selectedItem.production_notes || "Shot on standard cinematic format. Natural light orchestration with intentional underexposure. 35mm grain emulation."}
                     </p>
                   </div>

                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}


