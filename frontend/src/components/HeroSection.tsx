import { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Aurora from './Aurora';
import AnimatedStreets from './AnimatedStreets';

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const { theme } = useTheme();

  const containerRef = useRef<HTMLElement>(null);
  const animationWrapperRef = useRef<HTMLDivElement>(null);
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([]);

  
  useEffect(() => {
    if (!containerRef.current || !animationWrapperRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(animationWrapperRef.current, 
        { 
          opacity: 0,
          clipPath: 'inset(100% 0% 0% 0%)',
          scale: 0.95
        },
        { 
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          duration: 0.8,
          ease: 'power2.inOut'
        }
      );

      
      parallaxRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.to(ref, {
            y: (index + 1) * -40,
            opacity: 0.6,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 2,
            },
          });
        }
      });

      
      gsap.to(animationWrapperRef.current, {
        y: -80,
        scale: 1.05,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const backgroundStyle = theme === 'dark' 
    ? { background: 'linear-gradient(135deg, #1a0000 0%, #000a00 100%)' }
    : { background: '#f8f9fa' }; 

  
  const gradientFromClass = theme === 'dark' 
    ? 'from-black' 
    : 'from-white';
  
  const gradientToClass = theme === 'dark'
    ? 'to-transparent'
    : 'to-transparent';

  return (
    <section ref={containerRef} id="hero" className={`min-h-screen flex items-center justify-center pt-16 relative overflow-hidden ${theme === 'dark' ? 'text-primary-foreground' : 'text-foreground'}`} style={backgroundStyle}>
      {/* sun */}
      {theme !== 'dark' && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <Aurora
            colorStops={["#FF3232", "#3A29FF", "#1a5f1a"]}
            blend={0.5}
            amplitude={0.9}
            speed={0.5}
          />
        </div>
      )}
      
      {/* параллакс эффекты */}
      <div 
        ref={(el) => (parallaxRefs.current[0] = el)}
        className={`absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl ${theme === 'dark' ? 'bg-red-950/20' : 'bg-primary/10'}`}
      />
      <div 
        ref={(el) => (parallaxRefs.current[1] = el)}
        className={`absolute top-40 right-20 w-48 h-48 rounded-full blur-3xl ${theme === 'dark' ? 'bg-green-950/20' : 'bg-accent/10'}`}
      />
      <div 
        ref={(el) => (parallaxRefs.current[2] = el)}
        className={`absolute bottom-32 left-1/4 w-24 h-24 rounded-full blur-2xl ${theme === 'dark' ? 'bg-red-900/15' : 'bg-secondary/10'}`}
      />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-7xl mx-auto">
          <div 
            ref={animationWrapperRef}
            className="w-[98vw] md:w-[95vw] h-[85vh] mb-8 bg-card overflow-hidden shadow-2xl relative left-1/2 -translate-x-1/2 rounded-2xl border-2 border-primary/20"
          >
            <div className="relative w-full h-full">
              <AnimatedStreets />
              {/* edge gradients*/}
              <div className={`pointer-events-none absolute inset-y-0 left-0 w-32 md:w-48 bg-gradient-to-r ${gradientFromClass} ${gradientToClass}`} />
              <div className={`pointer-events-none absolute inset-y-0 right-0 w-32 md:w-48 bg-gradient-to-l ${gradientFromClass} ${gradientToClass}`} />
              {/* top and bottom*/}
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-32 md:h-48 bg-gradient-to-b ${gradientFromClass} ${gradientToClass}`} />
              <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-32 md:h-48 bg-gradient-to-t ${gradientFromClass} ${gradientToClass}`} />
              {/* glowing center effect */}
              <div className={`absolute inset-0 pointer-events-none ${theme === 'dark' ? 'bg-gradient-radial from-primary/5 via-transparent to-transparent' : 'bg-gradient-radial from-primary/3 via-transparent to-transparent'}`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;