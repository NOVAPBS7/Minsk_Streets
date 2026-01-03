import { useLanguage } from '@/contexts/LanguageContext';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WWIISection = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current || !titleRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Title reveal with line animation
      gsap.fromTo(titleRef.current,
        {
          opacity: 0,
          y: 40,
          clipPath: 'inset(0% 0% 100% 0%)',
        },
        {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Content reveal with mask animation
      gsap.fromTo(contentRef.current,
        {
          opacity: 0,
          y: 30,
          maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
        },
        {
          opacity: 1,
          y: 0,
          maskImage: 'linear-gradient(to bottom, black 0%, black 100%)',
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          delay: 0.1
        }
      );

      // Subtle parallax for decorative elements
      parallaxRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.to(ref, {
            y: (index % 2 === 0 ? 1 : -1) * 60,
            opacity: 0.5,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 2,
            },
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [t.wwii.title, t.wwii.content]);

  return (
    <section ref={containerRef} id="wwii-section" className="py-20 bg-card relative overflow-hidden">
      {/* Parallax decorative elements */}
      <div 
        ref={(el) => (parallaxRefs.current[0] = el)}
        className="absolute top-10 right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" 
      />
      <div 
        ref={(el) => (parallaxRefs.current[1] = el)}
        className="absolute bottom-20 left-16 w-56 h-56 bg-accent/5 rounded-full blur-3xl" 
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 
          ref={titleRef}
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-foreground cursor-default"
        >
          {t.wwii.title}
        </h2>
        <div className="max-w-5xl mx-auto">
          <p 
            ref={contentRef}
            className="text-lg md:text-xl leading-relaxed text-foreground/90"
          >
            {t.wwii.content}
          </p>
        </div>
      </div>
    </section>
  );
};

export default WWIISection;
