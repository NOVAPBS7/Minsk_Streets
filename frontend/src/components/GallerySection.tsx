import { useLanguage } from '@/contexts/LanguageContext';
import { useRef, useEffect, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { streetImages } from '@/data/streetsAssets';
import Stack from './Stack';

gsap.registerPlugin(ScrollTrigger);

const GallerySection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  
  const galleryImages = useMemo(() => {
    const images: string[] = [];
    const imageMap = streetImages as Record<string, string>;
    
    
    Object.keys(imageMap).forEach((key) => {
      
      if (!key.includes('flags') && !key.includes('CoatOfArms') && !key.includes('g61') && !key.includes('grom')) {
        images.push(imageMap[key]);
      }
    });
    
    return images.slice(0, 8); 
  }, []);

  
  const cards = useMemo(() => {
    return galleryImages.map((src, i) => (
      <img 
        key={i} 
        src={src} 
        alt={`Галерея ${i + 1}`} 
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />
    ));
  }, [galleryImages]);

  
  useEffect(() => {
    if (!sectionRef.current || !titleRef.current) return;

    const ctx = gsap.context(() => {
      
      gsap.fromTo(titleRef.current,
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section 
        ref={sectionRef}
        id="gallery" 
        className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-background/70 to-background"
      >
        {/* dcrt elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute -top-20 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* header */}
          <div className="text-center mb-16">
            <h2 
              ref={titleRef}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground cursor-default"
            >
              {t.gallery.title}
            </h2>
            <div className="w-24 h-1.5 bg-foreground rounded-full mx-auto" />
            <p className="mt-6 text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.gallery.description}
            </p>
          </div>

          {/* main gallery */}
          <div className="max-w-7xl mx-auto flex justify-center">
            <div className="w-full max-w-[550px] md:max-w-[600px] aspect-[4/3]">
              <Stack
                randomRotation={true}
                sensitivity={180}
                sendToBackOnClick={true}
                cards={cards}
              />
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default GallerySection;

