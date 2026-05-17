const fs = require('fs');
const filePath = 'src/app/beauty-architecture/page.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. imports
code = code.replace(
  'import React, { useState } from "react";',
  'import React, { useState, useEffect } from "react";'
);

code = code.replace(
  'import { addDoc, collection } from "firebase/firestore";',
  'import { addDoc, collection, query, where, onSnapshot } from "firebase/firestore";'
);

// 2. State and Effect Hook
const stateInject = `    const [wantsProShot, setWantsProShot] = useState(false);
    
    // Portfolio logic
    const [portfolioImages, setPortfolioImages] = useState<any[]>([
        { url: "https://picsum.photos/seed/beauty1/600/800", type: "image", id: "fallback-1" },
        { url: "https://picsum.photos/seed/beauty2/600/600", type: "image", id: "fallback-2" },
        { url: "https://picsum.photos/seed/beauty3/600/900", type: "image", id: "fallback-3" },
        { url: "https://picsum.photos/seed/beauty4/600/700", type: "image", id: "fallback-4" },
        { url: "https://picsum.photos/seed/beauty5/600/800", type: "image", id: "fallback-5" },
        { url: "https://picsum.photos/seed/beauty6/600/600", type: "image", id: "fallback-6" }
    ]);
    
    useEffect(() => {
        const q = query(
            collection(db, "portfolio_items"),
            where("theme_category", "==", "Beauty Architecture")
        );
        const unsub = onSnapshot(q, (snapshot) => {
            const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (images.length > 0) {
                setPortfolioImages(images);
            }
        });
        return () => unsub();
    }, [db]);
`;

code = code.replace(
  '    const [wantsProShot, setWantsProShot] = useState(false);',
  stateInject
);

// 3. Render grid
const oldGrid = `                        {[
                            "https://picsum.photos/seed/beauty1/600/800",
                            "https://picsum.photos/seed/beauty2/600/600",
                            "https://picsum.photos/seed/beauty3/600/900",
                            "https://picsum.photos/seed/beauty4/600/700",
                            "https://picsum.photos/seed/beauty5/600/800",
                            "https://picsum.photos/seed/beauty6/600/600"
                        ].map((src, i) => (
                            <motion.div 
                                key={src}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="break-inside-avoid relative"
                            >
                                <Image 
                                    src={src} 
                                    alt="Macro beauty shot" 
                                    width={600} 
                                    height={800} 
                                    className="w-full h-auto object-cover border border-brand-line filter grayscale hover:grayscale-0 transition-all duration-700" 
                                    referrerPolicy="no-referrer"
                                />
                            </motion.div>
                        ))}`;

const newGrid = `                        {portfolioImages.map((item, i) => (
                            <motion.div 
                                key={item.id || i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="break-inside-avoid relative"
                            >
                                {item.type === 'video' ? (
                                    <video 
                                        src={item.url} 
                                        autoPlay 
                                        muted 
                                        loop 
                                        playsInline 
                                        className="w-full h-auto object-cover border border-brand-line filter grayscale hover:grayscale-0 transition-all duration-700" 
                                    />
                                ) : (
                                    <Image 
                                        src={item.url} 
                                        alt={item.title || "Macro beauty shot"} 
                                        width={600} 
                                        height={800} 
                                        className="w-full h-auto object-cover border border-brand-line filter grayscale hover:grayscale-0 transition-all duration-700" 
                                        referrerPolicy="no-referrer"
                                    />
                                )}
                            </motion.div>
                        ))}`;

code = code.replace(oldGrid, newGrid);

fs.writeFileSync(filePath, code);
console.log('Updated Beauty Architecture page.');
