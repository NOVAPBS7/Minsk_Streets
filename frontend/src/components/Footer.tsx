import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, ShieldCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const { t } = useLanguage();
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const borderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!footerRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      
      borderRefs.current.forEach((border, index) => {
        if (border) {
          gsap.fromTo(
            border,
            {
              scaleY: 0,
              transformOrigin: 'top center',
            },
            {
              scaleY: 1,
              duration: 0.8,
              delay: 0.3 + index * 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: footerRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });

      
      textRefs.current.forEach((text, index) => {
        if (text) {
          gsap.fromTo(
            text,
            {
              y: 30,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: 0.5 + index * 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: footerRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });

      
      gsap.to(contentRef.current, {
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-gradient-to-b from-background via-card to-background border-t border-border"
    >
      <div
        ref={contentRef}
        className="container mx-auto px-4 py-12 md:py-16 relative z-10"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-12">
            <div className="relative">
              <div
                ref={(el) => (borderRefs.current[0] = el)}
                className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent"
              />
              <div
                ref={(el) => (textRefs.current[0] = el)}
                className="pl-6 space-y-4"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight uppercase">
                  {t.footer.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.footer.description}
                </p>
              </div>
            </div>

            <div className="relative">
              <div
                ref={(el) => (borderRefs.current[1] = el)}
                className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent"
              />
              <div
                ref={(el) => (textRefs.current[1] = el)}
                className="pl-6 space-y-4"
              >
                <div className="inline-block">
                  <p className="text-xl md:text-2xl font-bold text-primary uppercase tracking-wider border-b-2 border-primary pb-2">
                    {t.footer.memory}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.footer.location}
                </p>
              </div>
            </div>

            <div className="relative">
              <div
                ref={(el) => (borderRefs.current[2] = el)}
                className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent"
              />
              <div
                ref={(el) => (textRefs.current[2] = el)}
                className="pl-6 space-y-4"
              >
                <p className="text-base md:text-lg text-foreground font-medium leading-relaxed border-l-2 border-primary/30 pl-4">
                  {t.footer.motto}
                </p>
              </div>
            </div>
          </div>

          <div
            ref={(el) => (textRefs.current[3] = el)}
            className="pt-6 border-t border-border/50 space-y-4"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground tracking-wider uppercase">
                © 2025 NOVAPBS. Все права защищены.
              </p>
              <div className="flex items-center gap-6">
                <p className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                  {t.footer.madeWith}
                  <Heart className="h-3 w-3 fill-primary text-primary" />
                  {t.footer.inBelarus}
                </p>
              </div>
            </div>

            {/* legacy */}
            <div className="pt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t.footer.licenseTitle}
                </span>
              </div>
              
              <div className="p-3 border border-primary/20 rounded bg-card/50 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground leading-relaxed text-center">
                  {t.footer.licenseDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-primary/20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/20" />
    </footer>
  );
};

export default Footer;
