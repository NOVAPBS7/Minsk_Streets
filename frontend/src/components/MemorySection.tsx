import { useLanguage } from '@/contexts/LanguageContext';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MemorySection = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const reasonsRef = useRef<(HTMLDivElement | null)[]>([]);
  const quoteRef = useRef<HTMLDivElement>(null);
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current || !titleRef.current || !quoteRef.current) return;

    const ctx = gsap.context(() => {
      
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

      
      reasonsRef.current.forEach((reason, index) => {
        if (reason) {
          gsap.fromTo(reason,
            {
              opacity: 0,
              x: -40,
              clipPath: 'inset(0% 100% 0% 0%)',
            },
            {
              opacity: 1,
              x: 0,
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 0.5,
              delay: index * 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: reason,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });

      
      gsap.fromTo(quoteRef.current,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: quoteRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      
      parallaxRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.to(ref, {
            y: (index % 2 === 0 ? 1 : -1) * 50,
            opacity: 0.4,
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
  }, [t.memory]);

  return (
    <section ref={containerRef} id="memory" className="py-20 bg-background relative overflow-hidden">
      <div 
        ref={(el) => (parallaxRefs.current[0] = el)}
        className="absolute top-20 left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" 
      />
      <div 
        ref={(el) => (parallaxRefs.current[1] = el)}
        className="absolute bottom-10 right-16 w-64 h-64 bg-accent/5 rounded-full blur-3xl" 
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 
          ref={titleRef}
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-foreground cursor-default"
        >
          {t.memory.title}
        </h2>
        <div className="max-w-[83.2rem] mx-auto space-y-6">
          {t.memory.reasons.map((reason, index) => (
            <div
              key={index}
              ref={(el) => (reasonsRef.current[index] = el)}
              className="space-y-2 cursor-default"
            >
              <h3 className="text-xl font-semibold text-foreground">{reason.title}</h3>
              <p className="text-foreground/80 leading-relaxed text-lg">{reason.content}</p>
            </div>
          ))}
        </div>
        <div
          ref={quoteRef}
          className="mt-12 flex flex-col items-center"
        >
          <p className="text-xl md:text-2xl font-semibold text-foreground italic text-center max-w-4xl">
            {t.memory.quote}
          </p>
          <p className="mt-2 text-foreground/70 text-base md:text-lg text-right max-w-4xl w-full">{t.memory.quoteAuthor}</p>
        </div>
      </div>
    </section>
  );
};

export default MemorySection;
