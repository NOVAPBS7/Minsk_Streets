import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';
import { gsap } from 'gsap';
import ShinyText from './ShinyText';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface StreetLine {
  x: number;
  y: number;
  width: number;
  progress: number;
  speed: number;
  depth: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkle: number;
  speed: number;
}

const AnimatedStreets = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const streetLinesRef = useRef<StreetLine[]>([]);
  const starsRef = useRef<Star[]>([]);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { t } = useLanguage();
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Color scheme based on theme
    const isDark = theme === 'dark';
    const primaryColor = isDark ? '#FF3232' : '#DC2626';
    const secondaryColor = isDark ? '#3A29FF' : '#2563EB';
    const accentColor = isDark ? '#1a5f1a' : '#16A34A';
    const bgColor = isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.15)';
    const streetColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';

    // Initialize stars
    const initStars = (width: number, height: number) => {
      starsRef.current = [];
      const starCount = 40;
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.6 + 0.3,
          twinkle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.01
        });
      }
    };

    // Initialize particles
    const initParticles = (width: number, height: number) => {
      particlesRef.current = [];
      const particleCount = 80;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const radius = Math.random() * Math.min(width, height) * 0.3;
        particlesRef.current.push({
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          size: Math.random() * 2.5 + 1.5,
          opacity: Math.random() * 0.5 + 0.5,
          color: [primaryColor, secondaryColor, accentColor][Math.floor(Math.random() * 3)]
        });
      }
    };

    // Initialize street lines with 3D perspective
    const initStreetLines = (width: number, height: number) => {
      streetLinesRef.current = [];
      const lineCount = 8;
      const centerY = height / 2;
      
      for (let i = 0; i < lineCount; i++) {
        const depth = i / lineCount;
        const y = centerY + (i - lineCount / 2) * 40;
        const perspective = 1 - depth * 0.6;
        const lineWidth = (200 + i * 30) * perspective;
        
        streetLinesRef.current.push({
          x: width / 2 - lineWidth / 2,
          y: y,
          width: lineWidth,
          progress: Math.random() * 100,
          speed: 0.3 + Math.random() * 0.2,
          depth: depth
        });
      }
    };

    let initialized = false;
    
    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      if (!initialized) {
        initStars(width, height);
        initParticles(width, height);
        initStreetLines(width, height);
        initialized = true;
      }
    };

    // Mouse tracking with smooth interpolation
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
    };

    resize();
    window.addEventListener('resize', resize);
    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }

    let time = 0;

    const animate = () => {
      if (!canvas || !ctx) return;

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      // Clear with fade effect
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Draw animated stars
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)';
      starsRef.current.forEach(star => {
        star.twinkle += star.speed;
        const twinkleOpacity = star.opacity + Math.sin(star.twinkle) * 0.3;
        ctx.globalAlpha = Math.max(0.1, twinkleOpacity);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Draw street perspective lines with 3D effect
      streetLinesRef.current.forEach((line) => {
        line.progress += line.speed;
        if (line.progress > 100) line.progress = 0;

        const depth = line.depth;
        const perspective = 1 - depth * 0.6;
        const lineOpacity = 0.2 + depth * 0.3;

        // Draw street surface (simplified)
        ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${lineOpacity * 0.15})` : `rgba(0, 0, 0, ${lineOpacity * 0.15})`;
        ctx.fillRect(line.x, line.y - 1, line.width, 3);

        // Draw dashed center line
        const dashOffset = line.progress;
        ctx.setLineDash([20 * perspective, 20 * perspective]);
        ctx.lineDashOffset = dashOffset;
        ctx.strokeStyle = isDark ? `rgba(255, 50, 50, ${lineOpacity * 0.5})` : `rgba(220, 38, 38, ${lineOpacity * 0.5})`;
        ctx.lineWidth = 1.5 * perspective;
        
        ctx.beginPath();
        ctx.moveTo(line.x + line.width / 2, line.y);
        ctx.lineTo(line.x + line.width / 2, line.y + 5 * perspective);
        ctx.stroke();

        // Draw street edges
        ctx.setLineDash([]);
        ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${lineOpacity * 0.3})` : `rgba(0, 0, 0, ${lineOpacity * 0.3})`;
        ctx.lineWidth = 1 * perspective;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x + line.width, line.y);
        ctx.stroke();
      });

      // Draw particles with mouse interaction (optimized)
      particlesRef.current.forEach((particle, i) => {
        // Mouse attraction (simplified)
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distanceSq = dx * dx + dy * dy;
        const maxDistanceSq = 150 * 150;
        
        if (distanceSq < maxDistanceSq && distanceSq > 0) {
          const distance = Math.sqrt(distanceSq);
          const force = (150 - distance) / 150 * 0.2;
          particle.vx += (dx / distance) * force * 0.05;
          particle.vy += (dy / distance) * force * 0.05;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Draw connections to nearby particles (optimized - check fewer)
        const checkCount = Math.min(10, particlesRef.current.length - i - 1);
        for (let j = 1; j <= checkCount; j++) {
          const otherParticle = particlesRef.current[i + j];
          if (!otherParticle) break;
          
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq < 100 * 100) {
            const distance = Math.sqrt(distanceSq);
            const connectionOpacity = (1 - distance / 100) * 0.2;
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = connectionOpacity;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        }

        // Draw particle (simplified glow)
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      // Draw dynamic flowing gradient overlay
      const gradientAngle = time * 0.01;
      const gradient = ctx.createLinearGradient(
        width / 2 + Math.cos(gradientAngle) * width,
        height / 2 + Math.sin(gradientAngle) * height,
        width / 2 - Math.cos(gradientAngle) * width,
        height / 2 - Math.sin(gradientAngle) * height
      );
      gradient.addColorStop(0, isDark ? 'rgba(255, 50, 50, 0.08)' : 'rgba(220, 38, 38, 0.08)');
      gradient.addColorStop(0.33, isDark ? 'rgba(58, 41, 255, 0.08)' : 'rgba(37, 99, 235, 0.08)');
      gradient.addColorStop(0.66, isDark ? 'rgba(26, 95, 26, 0.08)' : 'rgba(22, 163, 74, 0.08)');
      gradient.addColorStop(1, isDark ? 'rgba(255, 50, 50, 0.08)' : 'rgba(220, 38, 38, 0.08)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add single pulsing center effect (simplified)
      const centerX = width / 2;
      const centerY = height / 2;
      const pulsePhase = time * 0.01;
      const pulseSize = 100 + Math.sin(pulsePhase) * 30;
      const pulseOpacity = 0.1 * (0.7 + Math.sin(pulsePhase) * 0.3);
      
      const radialGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
      radialGradient.addColorStop(0, isDark ? `rgba(255, 50, 50, ${pulseOpacity})` : `rgba(220, 38, 38, ${pulseOpacity})`);
      radialGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = radialGradient;
      ctx.fillRect(0, 0, width, height);

      time += 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Enhanced text animation
    if (textContainerRef.current) {
      const textElements = textContainerRef.current.querySelectorAll('h1, h2, p, div > div');
      gsap.fromTo(textElements,
        {
          opacity: 0,
          y: 50,
          scale: 0.9,
          filter: 'blur(10px)'
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.12,
          ease: 'power4.out',
          delay: 0.4
        }
      );
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme, t]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'auto' }}
      />
      {/* Text overlay with enhanced background */}
      <div ref={textContainerRef} className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-8 z-10 pointer-events-none">
        {/* Enhanced background with gradient */}
        <div className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-gradient-to-b from-black/60 via-black/50 to-black/60' 
            : 'bg-gradient-to-b from-white/60 via-white/50 to-white/60'
        } backdrop-blur-md`} />
        
        <div className={`relative text-center max-w-6xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {/* Project Title with enhanced styling */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-6 md:mb-8 leading-tight drop-shadow-2xl">
            <ShinyText 
              text={t.hero.title} 
              disabled={false} 
              speed={6} 
              className='custom-class' 
            />
          </h1>
          
          {/* Main title with enhanced styling */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-6 md:mb-8 leading-tight drop-shadow-2xl">
            Образовательный проект подготовленный в рамках конкурса
            <br />
            <span className="text-primary font-extrabold text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              "100 идей для Беларуси"
            </span>
          </h2>
          
          {/* Technical info with enhanced cards */}
          <div className={`text-sm md:text-base lg:text-lg space-y-3 md:space-y-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div className={`p-4 md:p-5 rounded-2xl ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-white/20 to-white/10' 
                  : 'bg-gradient-to-br from-black/20 to-black/10'
              } backdrop-blur-lg border-2 ${
                theme === 'dark' ? 'border-white/30' : 'border-black/30'
              } shadow-2xl hover:scale-105 transition-transform duration-300`}>
                <p className="font-bold mb-2 text-base md:text-lg text-primary">Frontend:</p>
                <p className="text-xs md:text-sm lg:text-base leading-relaxed font-medium">React 18 • TypeScript • Vite • Tailwind CSS</p>
                <p className="text-xs md:text-sm lg:text-base leading-relaxed font-medium">GSAP • Three.js • Framer Motion • React Router</p>
              </div>
              <div className={`p-4 md:p-5 rounded-2xl ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-white/20 to-white/10' 
                  : 'bg-gradient-to-br from-black/20 to-black/10'
              } backdrop-blur-lg border-2 ${
                theme === 'dark' ? 'border-white/30' : 'border-black/30'
              } shadow-2xl hover:scale-105 transition-transform duration-300`}>
                <p className="font-bold mb-2 text-base md:text-lg text-primary">Backend:</p>
                <p className="text-xs md:text-sm lg:text-base leading-relaxed font-medium">Express.js • Node.js • DeepSeek AI</p>
                <p className="text-xs md:text-sm lg:text-base leading-relaxed font-medium">Nodemailer • CORS</p>
              </div>
            </div>
            
            <div className={`pt-4 md:pt-5 border-t-2 ${
              theme === 'dark' ? 'border-white/50' : 'border-gray-800/50'
            }`}>
              <p className="font-bold mb-2 text-base md:text-lg text-primary">Особенности:</p>
              <p className="text-xs md:text-sm lg:text-base leading-relaxed font-medium">
                Интерактивные карты улиц • AI-чат помощник • Туристические маршруты • 
                Мультиязычность (RU/BY) • Адаптивный дизайн • WebGL анимации
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedStreets;
