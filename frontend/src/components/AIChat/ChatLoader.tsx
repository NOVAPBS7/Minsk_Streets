import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useTheme } from 'next-themes';

const ChatLoader = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const dots = containerRef.current?.querySelectorAll('.loader-dot');
      if (!dots) return;

      gsap.fromTo(
        dots,
        { scale: 0.5, opacity: 0.3 },
        {
          scale: 1.5,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut'
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex items-center gap-2 py-4">
      <span className="text-sm text-muted-foreground">AI думает</span>
      <div className="flex gap-1">
        <div 
          className="loader-dot w-2 h-2 rounded-full"
          style={{
            background: theme === 'dark' ? 'hsl(220, 30%, 60%)' : 'hsl(220, 40%, 50%)'
          }}
        />
        <div 
          className="loader-dot w-2 h-2 rounded-full"
          style={{
            background: theme === 'dark' ? 'hsl(220, 30%, 60%)' : 'hsl(220, 40%, 50%)'
          }}
        />
        <div 
          className="loader-dot w-2 h-2 rounded-full"
          style={{
            background: theme === 'dark' ? 'hsl(220, 30%, 60%)' : 'hsl(220, 40%, 50%)'
          }}
        />
      </div>
    </div>
  );
};

export default ChatLoader;
