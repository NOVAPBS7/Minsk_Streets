import { useRef, useEffect, useState, ReactNode } from 'react';
import { gsap } from 'gsap';

interface Card3DProps {
  children: ReactNode;
  index: number;
  isHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  className?: string;
}

const Card3D = ({ children, index, isHovered, onHoverChange, className = '' }: Card3DProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const holographicRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);
  const floatingTimelineRef = useRef<gsap.core.Timeline | null>(null);

  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  
  useEffect(() => {
    if (!cardRef.current) return;

    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { duration: 2.5 + index * 0.4, ease: 'sine.inOut' }
    });

    
    const yOffset = isMobile ? 6 : 10;
    const rotation = isMobile ? 0.8 : 1.5;
    const scale = isMobile ? 1.01 : 1.02;

    tl.to(cardRef.current, {
      y: yOffset,
      rotateX: rotation,
      rotateY: rotation * (index % 2 === 0 ? 1 : -1),
      rotateZ: rotation * 0.3 * (index % 2 === 0 ? -1 : 1),
      scale: scale,
    });

    floatingTimelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [index, isMobile]);

  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    
    const rotateY = ((x - centerX) / centerX) * 9; 
    const rotateX = ((centerY - y) / centerY) * 9; 
    const rotateZ = ((x - centerX) / centerX) * 1.5; 
    
    
    const posX = (x / rect.width) * 100;
    const posY = (y / rect.height) * 100;
    
    setMousePosition({ x: posX, y: posY });

    
    gsap.to(card, {
      rotateY: rotateY,
      rotateX: rotateX,
      rotateZ: rotateZ,
      transformPerspective: 1000,
      scale: 1.05, 
      duration: 0.6,
      ease: 'power2.out',
    });

    
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        background: `radial-gradient(circle at ${posX}% ${posY}%, 
          rgba(139, 92, 246, 0.5) 0%, 
          rgba(59, 130, 246, 0.4) 20%, 
          rgba(236, 72, 153, 0.3) 40%, 
          rgba(16, 185, 129, 0.2) 60%,
          transparent 75%)`,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    
    if (holographicRef.current) {
      gsap.to(holographicRef.current, {
        backgroundPosition: `${posX}% ${posY}%`,
        opacity: 0.6,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || isMobile) return;

    
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      rotateZ: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power2.out',
    });

    
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    }

    
    if (holographicRef.current) {
      gsap.to(holographicRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseEnter = () => {
    if (glowRef.current && !isMobile) {
      gsap.to(glowRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
    
    if (holographicRef.current && !isMobile) {
      gsap.to(holographicRef.current, {
        opacity: 0.3,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
    
    onHoverChange(true);
  };

  return (
    <div
      ref={cardRef}
      className={`card-3d-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        handleMouseLeave();
        onHoverChange(false);
      }}
      onMouseEnter={handleMouseEnter}
      style={{
        transformStyle: 'preserve-3d',
        transform: 'translateZ(0)',
      }}
    >
      {/* bg depth layers*/}
      <div 
        className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
        style={{
          transform: 'translateZ(-30px)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))',
          filter: 'blur(30px)',
        }}
      />
      
      <div 
        className="absolute inset-0 rounded-2xl opacity-50 pointer-events-none"
        style={{
          transform: 'translateZ(-20px)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.12), rgba(139, 92, 246, 0.12))',
          filter: 'blur(20px)',
        }}
      />
      
      <div 
        className="absolute inset-0 rounded-2xl opacity-60 pointer-events-none"
        style={{
          transform: 'translateZ(-10px)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(225deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.08))',
          filter: 'blur(15px)',
        }}
      />

      {/* holographic bg */}
      <div
        ref={holographicRef}
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0"
        style={{
          transform: 'translateZ(-5px)',
          transformStyle: 'preserve-3d',
          background: `
            linear-gradient(
              135deg,
              rgba(139, 92, 246, 0.2) 0%,
              rgba(59, 130, 246, 0.2) 25%,
              rgba(236, 72, 153, 0.2) 50%,
              rgba(16, 185, 129, 0.2) 75%,
              rgba(139, 92, 246, 0.2) 100%
            )
          `,
          backgroundSize: '200% 200%',
          animation: 'holographic-shimmer 3s ease infinite',
        }}
      />

      <div
        className="relative"
        style={{
          transform: 'translateZ(0px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>

      {/* shine v2 */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300"
        style={{
          transform: 'translateZ(8px)',
          transformStyle: 'preserve-3d',
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(139, 92, 246, 0.5) 0%, 
            rgba(59, 130, 246, 0.4) 20%, 
            rgba(236, 72, 153, 0.3) 40%, 
            rgba(16, 185, 129, 0.2) 60%,
            transparent 75%)`,
          mixBlendMode: 'screen',
        }}
      />

      {/* glass refl v2 */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
        style={{
          transform: 'translateZ(12px)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="absolute top-0 left-0 h-full opacity-25"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, transparent 20%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.3) 60%, transparent 80%, transparent 100%)',
            transform: `translateX(${isHovered ? '150%' : '-150%'})`,
            transition: 'transform 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
          }}
        />
      </div>

      {/* particles */}
      {isHovered && !isMobile && (
        <>
          <div
            className="absolute w-2 h-2 rounded-full pointer-events-none animate-pulse"
            style={{
              top: '20%',
              left: '30%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8), transparent)',
              transform: 'translateZ(15px)',
              transformStyle: 'preserve-3d',
              animation: 'sparkle 1.5s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none animate-pulse"
            style={{
              top: '70%',
              right: '25%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8), transparent)',
              transform: 'translateZ(15px)',
              transformStyle: 'preserve-3d',
              animation: 'sparkle 2s ease-in-out infinite 0.5s',
            }}
          />
          <div
            className="absolute w-1 h-1 rounded-full pointer-events-none animate-pulse"
            style={{
              top: '40%',
              right: '35%',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.8), transparent)',
              transform: 'translateZ(15px)',
              transformStyle: 'preserve-3d',
              animation: 'sparkle 1.8s ease-in-out infinite 0.3s',
            }}
          />
        </>
      )}

      {/* glow v2 */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          transform: 'translateZ(2px)',
          transformStyle: 'preserve-3d',
          boxShadow: isHovered && !isMobile
            ? '0 0 40px rgba(139, 92, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.4), inset 0 0 30px rgba(139, 92, 246, 0.3)'
            : '0 0 20px rgba(139, 92, 246, 0.15)',
          transition: 'box-shadow 0.6s ease',
        }}
      />
    </div>
  );
};

export default Card3D;
