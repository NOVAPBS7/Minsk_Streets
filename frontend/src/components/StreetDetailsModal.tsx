import { useLanguage } from '@/contexts/LanguageContext';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface StreetModalStreet {
  nameRu: string;
  nameBe: string;
  streetVideo: string;
  heroImage: string;
  heroNameRu: string;
  heroNameBe: string;
  heroYears: string;
  images: string[];
  factsRu: string[];
  factsBe: string[];
  historyRu: string;
  historyBe: string;
}

interface StreetDetailsModalProps {
  street: StreetModalStreet;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const StreetDetailsModal = ({ street, isOpen, onClose, onPrev, onNext }: StreetDetailsModalProps) => {
  const { language, t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);

  const handlePrev = () => {
    setDirection('prev');
    onPrev?.();
  };

  const handleNext = () => {
    setDirection('next');
    onNext?.();
  };

  useLayoutEffect(() => {
    if (isOpen) {
      // сохраняем текущую позицию прокрутки
      // проверяем есть ли сохраненное значение из handleDiscoverLocation
      const preservedScrollY = document.body.getAttribute('data-scroll-y-preserve');
      const scrollY = preservedScrollY 
        ? parseInt(preservedScrollY, 10)
        : (window.scrollY || window.pageYOffset || document.documentElement.scrollTop);
      
      // удаляем временное сохраненное значение
      if (preservedScrollY) {
        document.body.removeAttribute('data-scroll-y-preserve');
      }
      
      document.body.style.overflow = 'hidden';
      // предотвращаем прокрутку на touch-устройствах
      // устанавливаем top с отрицательным значением, чтобы сохранить визуальную позицию
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.left = '0';
      document.body.style.right = '0';
      
      // сохраняем позицию в data-атрибуте для восстановления
      document.body.setAttribute('data-scroll-y', scrollY.toString());
    } else {
      // сосстанавливаем позицию прокрутки
      const scrollY = document.body.getAttribute('data-scroll-y');
      
      // сбрасываем стили
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.left = '';
      document.body.style.right = '';
      
      // восстанавливаем позицию прокрутки после сброса стилей
      if (scrollY) {
        const scrollPosition = parseInt(scrollY, 10);
        // requestAnimationFrame на всякийц
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPosition);
          // еще через document.documentElement
          if (window.scrollY === 0) {
            document.documentElement.scrollTop = scrollPosition;
          }
        });
        document.body.removeAttribute('data-scroll-y');
      }
    }

    return () => {
      // восст
      const scrollY = document.body.getAttribute('data-scroll-y');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.left = '';
      document.body.style.right = '';
      
      if (scrollY) {
        const scrollPosition = parseInt(scrollY, 10);
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPosition);
          if (window.scrollY === 0) {
            document.documentElement.scrollTop = scrollPosition;
          }
        });
        document.body.removeAttribute('data-scroll-y');
      }
    };
  }, [isOpen]);

  // стоп всплытие прокрутки
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          onWheel={(e) => e.preventDefault()}
        >
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            onWheel={(e) => e.preventDefault()}
            className="absolute inset-0 bg-black/50 backdrop-blur-xl"
          />

          {/* modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-[201] w-[90vw] max-w-6xl max-h-[90vh] bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 dark:shadow-black/50 border border-border/60 flex flex-col overflow-hidden"
            onWheel={handleWheel}
          >
            {/* nav arrows */}
            {onPrev && (
              <motion.button
                onClick={handlePrev}
                whileHover={{ scale: 1.1, x: -3 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-xl bg-gradient-to-r from-primary/10 via-primary/15 to-secondary/10 hover:from-primary/20 hover:via-primary/25 hover:to-secondary/20 border border-primary/20 hover:border-primary/30 text-foreground/70 hover:text-foreground transition-all duration-300 flex items-center justify-center group backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6 relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
              </motion.button>
            )}
            {onNext && (
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.1, x: 3 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-xl bg-gradient-to-r from-primary/10 via-primary/15 to-secondary/10 hover:from-primary/20 hover:via-primary/25 hover:to-secondary/20 border border-primary/20 hover:border-primary/30 text-foreground/70 hover:text-foreground transition-all duration-300 flex items-center justify-center group backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6 relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
              </motion.button>
            )}

            {/* close */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-4 right-4 z-20 w-12 h-12 rounded-xl bg-gradient-to-r from-primary/10 via-primary/15 to-secondary/10 hover:from-primary/20 hover:via-primary/25 hover:to-secondary/20 border border-primary/20 hover:border-primary/30 text-foreground/70 hover:text-foreground transition-all duration-300 flex items-center justify-center group backdrop-blur-sm"
            >
              <X className="w-5 h-5 relative z-10" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              />
            </motion.button>

            <div className="p-8 lg:p-10 overflow-y-auto flex-1 scrollbar-custom">
              {/* header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground/80 via-foreground/70 to-foreground/80 bg-clip-text text-transparent mb-3">
                  {language === 'ru' ? street.nameRu : street.nameBe}
                </h2>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '80px' }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="h-1 bg-gradient-to-r from-primary via-primary/80 to-secondary rounded-full"
                />
              </motion.div>

              {/* top: hero (left) + main street photo (right) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid md:grid-cols-[30%_70%] gap-6 mb-8"
              >
                {/* Hero card */}
                <div className="bg-gradient-to-br from-muted/80 to-muted/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-border/50 hover:border-primary/20 transition-all duration-300 group">
                  <div className="overflow-hidden">
                    <img
                      src={street.heroImage}
                      alt={language === 'ru' ? street.heroNameRu : street.heroNameBe}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm">
                    <h3 className="font-bold text-lg text-foreground mb-1">
                      {language === 'ru' ? street.heroNameRu : street.heroNameBe}
                    </h3>
                    <p className="text-muted-foreground text-sm">{street.heroYears}</p>
                  </div>
                </div>

                {/* main photo */}
                <div className="aspect-video bg-gradient-to-br from-muted/80 to-muted/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-border/50 hover:border-primary/20 transition-all duration-300 group">
                  <img
                    src={street.streetVideo}
                    alt={language === 'ru' ? street.nameRu : street.nameBe}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.div>

              {/* other photos */}
              {street.images?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-10"
                >
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-custom">
                    {street.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="min-w-[220px] aspect-video bg-gradient-to-br from-muted/80 to-muted/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-border/50 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
                      >
                        <img
                          src={img}
                          alt={`Фото ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* facts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-primary/20 hover:border-primary/30 transition-all duration-300">
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    {t.streets.facts}
                  </h3>
                  <ul className="space-y-3">
                    {(language === 'ru' ? street.factsRu : street.factsBe).map((fact, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-primary mt-1 text-xl">•</span>
                        <span className="text-foreground/90 leading-relaxed">{fact}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-secondary/10 via-secondary/5 to-primary/10 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-secondary/20 hover:border-secondary/30 transition-all duration-300">
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
                    {t.streets.history}
                  </h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-foreground/90 leading-relaxed"
                  >
                    {language === 'ru' ? street.historyRu : street.historyBe}
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreetDetailsModal;
