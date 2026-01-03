import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { streets } from '@/data/streets';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const StreetsSectionMobile = () => {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const [selectedStreetIndex, setSelectedStreetIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const handleScroll = () => {
      const streetsSection = document.getElementById('streets');
      const contactsSection = document.getElementById('contacts');
      const streetsPanelOriginal = document.querySelector('[data-streets-nav]');

      if (streetsSection && contactsSection && streetsPanelOriginal) {
        const streetsSectionRect = streetsSection.getBoundingClientRect();
        const contactsSectionRect = contactsSection.getBoundingClientRect();
        const panelHeight = 100;
        const navHeight = 64;
        const stickyTop = navHeight - 176;
        const streetsSectionBottom = streetsSectionRect.bottom;

        if (streetsSectionRect.top <= stickyTop && streetsSectionBottom > (stickyTop + panelHeight + 100)) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedButton = scrollContainerRef.current.querySelector(`[data-street-index="${selectedStreetIndex}"]`);
      if (selectedButton) {
        selectedButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [selectedStreetIndex]);

  const selectedStreet = useMemo(() => streets[selectedStreetIndex], [selectedStreetIndex]);

  const handlePrevious = useCallback(() => {
    setDirection(-1);
    setSelectedStreetIndex((prev) => (prev === 0 ? streets.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setDirection(1);
    setSelectedStreetIndex((prev) => (prev === streets.length - 1 ? 0 : prev + 1));
  }, []);

  const handleStreetSelect = useCallback((index: number) => {
    setDirection(index > selectedStreetIndex ? 1 : -1);
    setSelectedStreetIndex(index);
  }, [selectedStreetIndex]);

  const slideVariants = useMemo(() => ({
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  }), []);

  return (
    <section id="streets" className="pt-0 pb-20 bg-background relative overflow-hidden">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4"
      >
        <motion.div
          ref={titleContainerRef}
          className="relative w-full mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div 
            className="absolute inset-0 rounded-2xl backdrop-blur-md"
            style={{
              background: theme === 'dark' 
                ? 'linear-gradient(to right, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.4) 30%, rgba(0, 0, 0, 0.85) 50%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.3) 100%)'
                : 'linear-gradient(to right, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 255, 255, 0.3) 70%, rgba(255, 255, 255, 0.2) 100%)',
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
                : '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
          />
          {/* txt */}
          <motion.h2 
            className="relative text-3xl md:text-5xl font-bold text-center py-6 px-4 text-foreground"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {t.streets.animatedTitle.split(' ').map((word, index) => (
              <motion.span
                key={index}
                className="inline-block mx-1"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>
        </motion.div>

        <div className={`mb-8 ${isSticky ? 'h-20' : ''}`}>
          <div
            data-streets-nav
            className={`transition-all duration-300 ${isSticky
                ? 'fixed top-16 left-0 right-0 z-[105] bg-background/95 backdrop-blur-md border-b border-border shadow-lg py-3'
                : 'relative py-3'
            }`}
          >
            <div className={isSticky ? 'container mx-auto px-4' : 'px-4'}>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handlePrevious} 
                  className="shrink-0 h-10 w-10"
                  aria-label="Previous street"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div 
                  ref={scrollContainerRef}
                  className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {streets.map((street, index) => (
                    <Button
                      key={street.id}
                      data-street-index={index}
                      variant={selectedStreetIndex === index ? 'default' : 'outline'}
                      onClick={() => handleStreetSelect(index)}
                      className="whitespace-nowrap text-sm shrink-0 h-10"
                    >
                      {language === 'ru' ? street.nameRu : street.nameBe}
                    </Button>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleNext} 
                  className="shrink-0 h-10 w-10"
                  aria-label="Next street"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={selectedStreetIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 200, damping: 25 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full"
              >
                <div className="grid md:grid-cols-[30%_70%] gap-6 mb-8">
                  <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={selectedStreet.heroImage}
                      alt={language === 'ru' ? selectedStreet.heroNameRu : selectedStreet.heroNameBe}
                      className="w-full h-full object-cover"
                    />
                    <div className="p-4 bg-card">
                      <h3 className="font-bold text-lg">
                        {language === 'ru' ? selectedStreet.heroNameRu : selectedStreet.heroNameBe}
                      </h3>
                      <p className="text-muted-foreground">{selectedStreet.heroYears}</p>
                    </div>
                  </div>

                  <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={selectedStreet.streetVideo}
                      alt={`${language === 'ru' ? selectedStreet.nameRu : selectedStreet.nameBe}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {selectedStreet.images.map((img, idx) => (
                    <div key={idx} className="aspect-video bg-muted rounded-lg overflow-hidden shadow">
                      <img src={img} alt={`Фото ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-card p-6 rounded-lg shadow">
                    <h3 className="text-2xl font-bold mb-4 text-primary">{t.streets.facts}</h3>
                    <ul className="space-y-2">
                      {(language === 'ru' ? selectedStreet.factsRu : selectedStreet.factsBe).map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-foreground/90">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-card p-6 rounded-lg shadow">
                    <h3 className="text-2xl font-bold mb-4 text-secondary">{t.streets.history}</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      {language === 'ru' ? selectedStreet.historyRu : selectedStreet.historyBe}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default StreetsSectionMobile;
