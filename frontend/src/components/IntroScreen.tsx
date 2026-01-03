import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { Moon, Sun, ShieldCheck } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

type IntroStep = 'language' | 'theme' | 'privacy' | 'logo';

const IntroScreen = ({ onComplete }: IntroScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState<IntroStep>('language');
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1st visit check
  useEffect(() => {
    const firstVisitCompleted = localStorage.getItem('firstVisitCompleted');
    if (firstVisitCompleted === 'true') {
      // skip if not 1st visit
      setIsVisible(false);
      setTimeout(onComplete, 100);
      return;
    }
  }, [onComplete]);

  // anim
  useEffect(() => {
    if (!contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        {
          opacity: 0,
          y: 20,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [currentStep]);

  useEffect(() => {
    if (currentStep !== 'logo' || !logoRef.current || !overlayRef.current) return;

    const ctx = gsap.context(() => {
      // logo enter
      gsap.fromTo(
        logoRef.current,
        {
          opacity: 0,
          scale: 0.95,
          filter: 'blur(15px)',
        },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.5,
          ease: 'power2.out',
        }
      );

      // logog exit
      const exitTL = gsap.timeline({
        delay: 1.5,
        onComplete: () => {
          localStorage.setItem('firstVisitCompleted', 'true');
          setIsVisible(false);
          setTimeout(onComplete, 400);
        },
      });

      exitTL.to(logoRef.current, {
        opacity: 0,
        scale: 0.9,
        filter: 'blur(10px)',
        duration: 0.8,
        ease: 'power2.in',
      });

      exitTL.to(
        overlayRef.current,
        {
          opacity: 0,
          backdropFilter: 'blur(0px)',
          duration: 0.6,
          ease: 'power2.out',
        },
        '-=0.4'
      );

      exitTL.to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
        },
        '-=0.3'
      );
    }, containerRef);

    return () => ctx.revert();
  }, [currentStep, onComplete]);

  const handleLanguageSelect = (lang: 'ru' | 'be') => {
    setLanguage(lang);
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.98,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          setCurrentStep('theme');
        },
      });
    }
  };

  const handleThemeSelect = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.98,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          setCurrentStep('privacy');
        },
      });
    }
  };

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacyPolicyAccepted', 'true');
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.98,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          setCurrentStep('logo');
        },
      });
    }
  };

  const handlePrivacyLater = () => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.98,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          setCurrentStep('logo');
        },
      });
    }
  };

  const handlePrivacyLearnMore = () => {
    window.open('https://novapbs.ru/privacy', '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          <div
            ref={overlayRef}
            className="absolute inset-0 backdrop-blur-md bg-foreground/20"
          />

          {/* language */}
          {currentStep === 'language' && (
            <div
              ref={contentRef}
              className="relative z-10 w-full max-w-md px-6 md:px-8 opacity-0"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight">
                    {t.intro.languageTitle}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {t.intro.languageSubtitle}
                  </p>
                </div>

                <div className="flex gap-3 md:gap-4 justify-center">
                  <button
                    onClick={() => handleLanguageSelect('ru')}
                    className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium text-base md:text-lg transition-all uppercase tracking-wider ${
                      language === 'ru'
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                        : 'bg-card text-card-foreground border border-border hover:border-primary/50'
                    }`}
                  >
                    Русский
                  </button>
                  <button
                    onClick={() => handleLanguageSelect('be')}
                    className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium text-base md:text-lg transition-all uppercase tracking-wider ${
                      language === 'be'
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                        : 'bg-card text-card-foreground border border-border hover:border-primary/50'
                    }`}
                  >
                    Белорусский
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* theme */}
          {currentStep === 'theme' && (
            <div
              ref={contentRef}
              className="relative z-10 w-full max-w-md px-6 md:px-8 opacity-0"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight">
                    {t.intro.themeTitle}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {t.intro.themeSubtitle}
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:gap-4">
                  <button
                    onClick={() => handleThemeSelect('light')}
                    className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium text-base md:text-lg transition-all uppercase tracking-wider flex items-center justify-center gap-3 ${
                      (mounted && theme === 'light') || (!mounted && !theme)
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                        : 'bg-card text-card-foreground border border-border hover:border-primary/50'
                    }`}
                  >
                    <Sun size={20} className="md:w-6 md:h-6" />
                    <span>{t.intro.themeLight}</span>
                  </button>
                  <button
                    onClick={() => handleThemeSelect('dark')}
                    className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium text-base md:text-lg transition-all uppercase tracking-wider flex items-center justify-center gap-3 ${
                      mounted && theme === 'dark'
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                        : 'bg-card text-card-foreground border border-border hover:border-primary/50'
                    }`}
                  >
                    <Moon size={20} className="md:w-6 md:h-6" />
                    <span>{t.intro.themeDark}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* legacy */}
          {currentStep === 'privacy' && (
            <div
              ref={contentRef}
              className="relative z-10 w-full max-w-lg px-6 md:px-8 opacity-0"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border border-border rounded-lg p-6 md:p-8 space-y-6 shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1 space-y-2">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground uppercase tracking-tight">
                      {t.intro.privacyTitle}
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {t.intro.privacyDescription}{' '}
                      <button
                        onClick={handlePrivacyLearnMore}
                        className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors font-medium"
                      >
                        {t.intro.privacyLearnMore}
                      </button>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={handlePrivacyLater}
                    className="flex-1 px-6 py-3 rounded-lg font-medium text-sm uppercase tracking-wider bg-muted hover:bg-muted/80 text-muted-foreground transition-all border border-border"
                  >
                    {t.intro.privacyLater}
                  </button>
                  <button
                    onClick={handlePrivacyAccept}
                    className="flex-1 px-6 py-3 rounded-lg font-medium text-sm uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-lg hover:shadow-xl"
                  >
                    {t.intro.privacyAccept}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 'logo' && (
            <img
              ref={logoRef}
              src="https://assets.novapbs.ru/CoatOfArms.webp"
              alt="Герб"
              className="relative z-10 w-48 h-48 md:w-64 md:h-64 object-contain opacity-0"
            />
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default IntroScreen;
