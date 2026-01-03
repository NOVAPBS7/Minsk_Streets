import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const PrivacyBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolledToSection, setHasScrolledToSection] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const privacyAccepted = localStorage.getItem('privacyPolicyAccepted');
    const firstVisitCompleted = localStorage.getItem('firstVisitCompleted');
    
    if (privacyAccepted || firstVisitCompleted) {
      console.log('1st visit done. Not showing intro');
      return;
    }

    if (hasScrolledToSection) {
      return;
    }

    const timer = setTimeout(() => {
      // wwii search
      const wwiiSection = document.getElementById('wwii-section');
      
      if (!wwiiSection) {
        console.log('WWII Section not found');
        return;
      }

      console.log('WWII Section found, creating ScrollTrigger');

      const scrollTriggerInstance = ScrollTrigger.create({
        trigger: wwiiSection,
        start: 'top 80%',
        onEnter: () => {
          console.log('ScrollTrigger: Entered WWII section');
          if (!hasScrolledToSection) {
            setHasScrolledToSection(true);
            setTimeout(() => {
              console.log('Showing banner');
              setIsVisible(true);
            }, 300);
          }
        },
      });

      (window as any).__privacyBannerScrollTrigger = scrollTriggerInstance;
    }, 1000);

    return () => {
      clearTimeout(timer);
      if ((window as any).__privacyBannerScrollTrigger) {
        (window as any).__privacyBannerScrollTrigger.kill();
        (window as any).__privacyBannerScrollTrigger = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && bannerRef.current && contentRef.current && borderRef.current) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();

        // аним
        tl.fromTo(
          bannerRef.current,
          {
            y: 200,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
          }
        );

        // аним вертикальной линии
        tl.fromTo(
          borderRef.current,
          {
            scaleY: 0,
            transformOrigin: 'top center',
          },
          {
            scaleY: 1,
            duration: 0.6,
            ease: 'power3.out',
          },
          '-=0.4'
        );

        // аним контента
        tl.fromTo(
          contentRef.current,
          {
            y: 20,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
          },
          '-=0.5'
        );
      }, bannerRef);

      return () => ctx.revert();
    }
  }, [isVisible]);

  const handleAccept = () => {
    console.log('handleAccept called, isClosing:', isClosing);
    if (isClosing) {
      console.log('Already closing, returning');
      return; // prevent multiple clicks
    }
    setIsClosing(true);
    console.log('Starting close animation');
    console.log('Refs:', {
      banner: !!bannerRef.current,
      content: !!contentRef.current,
      border: !!borderRef.current
    });
    
    if (bannerRef.current && contentRef.current && borderRef.current) {
      const tl = gsap.timeline({
        onStart: () => {
          console.log('Timeline started');
        },
        onUpdate: () => {
          console.log('Timeline progress:', tl.progress());
        },
        onComplete: () => {
          console.log('Timeline complete callback triggered');
          try {
            localStorage.setItem('privacyPolicyAccepted', 'true');
            console.log('Privacy accepted and saved to localStorage');
          } catch (e) {
            console.error('Failed to save to localStorage:', e);
          }
          setIsVisible(false);
          setIsClosing(false);
          console.log('Animation complete, banner hidden');
        }
      });

      // реверсивная анимация
      tl.to(contentRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.in',
        onStart: () => console.log('Content animation started'),
        onComplete: () => console.log('Content animation done'),
      });

      tl.to(
        borderRef.current,
        {
          scaleY: 0,
          duration: 0.4,
          ease: 'power3.in',
          onStart: () => console.log('Border animation started'),
          onComplete: () => console.log('Border animation done'),
        },
        '-=0.2'
      );

      tl.to(
        bannerRef.current,
        {
          y: 200,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.in',
          onStart: () => console.log('Banner animation started'),
          onComplete: () => console.log('Banner animation done'),
        },
        '-=0.3'
      );

      console.log('Timeline created, duration:', tl.duration());
    } else {
      console.error('Some refs are null, cannot animate');
    }
  };

  const handleLearnMore = () => {
    window.open('https://novapbs.ru/privacy', '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  return (
    <div
      ref={bannerRef}
      className="fixed bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-auto md:max-w-2xl z-[9999] opacity-0"
      style={{ pointerEvents: isClosing ? 'none' : 'auto' }}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-background border border-border rounded-lg shadow-2xl backdrop-blur-sm">
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/20" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/20" />
        
        <div className="relative z-10 p-4 md:p-5">
          <div className="flex items-start gap-4 relative">
            <div
              ref={borderRef}
              className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent"
            />

            {/* content */}
            <div
              ref={contentRef}
              className="flex-1 pl-4 space-y-2 opacity-0"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
                <h3 className="text-sm md:text-base font-bold text-foreground uppercase tracking-tight">
                  Политика конфиденциальности
                </h3>
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed">
                Мы используем cookies для улучшения работы сайта. Продолжая использование сайта, 
                вы соглашаетесь с{' '}
                <button
                  onClick={handleLearnMore}
                  className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors font-medium"
                >
                  Политикой в отношении обработки персональных данных
                </button>
                .
              </p>

              {/* bttn */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleLearnMore}
                  className="flex-1 md:flex-none px-4 py-2 text-xs font-medium text-foreground border border-border hover:bg-card/50 rounded transition-all uppercase tracking-wider hover:border-primary/30"
                >
                  Узнать больше
                </button>
                
                <button
                  onClick={handleAccept}
                  className="flex-1 md:flex-none px-4 py-2 text-xs font-medium text-background bg-primary hover:bg-primary/90 rounded transition-all uppercase tracking-wider shadow-lg hover:shadow-xl"
                >
                  Принять
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none rounded-lg" />
      </div>
    </div>
  );
};

export default PrivacyBanner;
