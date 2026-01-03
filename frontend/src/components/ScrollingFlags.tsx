import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FLAGS_SRC = '/assets/streets/flags.avif';

const ScrollingFlags = ({ src = FLAGS_SRC, heightClass = 'h-48', mobileBreakpoint = 1290 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flagsRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < mobileBreakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [mobileBreakpoint]);

  useEffect(() => {
    if (!containerRef.current || !flagsRef.current || isMobile) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        flagsRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.to(flagsRef.current, {
        x: '-39%',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isMobile]);

  useEffect(() => {
    let cancelled = false;
    setIsImageReady(false);
    
    const img = new Image();
    img.decoding = 'async';
    
    // сеттинг src*а после установки crossOrigin
    img.src = src;

    const finish = () => {
      if (!cancelled) {
        setIsImageReady(true);
      }
    };

    const attachFallbackListeners = () => {
      img.addEventListener('load', finish, { once: true });
      img.addEventListener('error', (e) => {
        console.warn('Failed to load flags image:', e);
        // при ошибке показываем элемент
        finish();
      }, { once: true });
    };

    // если изображение уже загружено
    if (img.complete && img.naturalWidth > 0) {
      finish();
    } else if ('decode' in img) {
      // decode API для асинхронной декодировки
      img
        .decode()
        .then(() => {
          if (!cancelled) finish();
        })
        .catch((err) => {
          console.warn('Image decode failed, using fallback:', err);
          attachFallbackListeners();
        });
    } else {
      // для старых браузеров
      attachFallbackListeners();
    }

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${heightClass} overflow-hidden pointer-events-none`}
      style={{
        opacity: isImageReady ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      {isMobile ? (
        <div
          className="w-full h-full animate-scroll-flags"
          style={{
            backgroundImage: `url("${src}")`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'cover',
            backgroundPosition: '0 50%',
          }}
        />
      ) : (
        <div
          ref={flagsRef}
          style={{
            width: '180%',
            height: '100%',
            backgroundImage: `url("${src}")`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'cover',
            backgroundPosition: '0 50%',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
        />
      )}
    </div>
  );
};

export default ScrollingFlags;
