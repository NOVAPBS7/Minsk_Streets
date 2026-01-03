import { useLanguage } from '@/contexts/LanguageContext';
import { Street } from '@/data/streets';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface StreetDetailsSectionProps {
  street: Street | null;
  isOpen: boolean;
  onClose: () => void;
}

const StreetDetailsSection = ({ street, isOpen, onClose }: StreetDetailsSectionProps) => {
  const { language, t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && sectionRef.current) {
      // scroll to details smoothly
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // anim
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  if (!isOpen || !street) return null;

  return (
    <section
      ref={sectionRef}
      id="street-details"
      className="relative w-full min-h-screen bg-background py-16 px-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onClose}
          className="fixed top-20 right-8 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center shadow-lg"
        >
          <X className="w-6 h-6" />
        </button>

        {/* header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 font-oswald">
            {language === 'ru' ? street.nameRu : street.nameBe}
          </h2>
          <div className="h-1 w-20 bg-primary rounded-full" />
        </div>

        <div className="grid md:grid-cols-[30%_70%] gap-6 mb-12">
          <div className="bg-muted rounded-lg overflow-hidden shadow-lg">
            <img
              src={street.heroImage}
              alt={language === 'ru' ? street.heroNameRu : street.heroNameBe}
              className="w-full h-auto object-cover"
            />
            <div className="p-4 bg-card">
              <h3 className="font-bold text-lg">
                {language === 'ru' ? street.heroNameRu : street.heroNameBe}
              </h3>
              <p className="text-muted-foreground">{street.heroYears}</p>
            </div>
          </div>

          <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
            <img
              src={street.streetVideo}
              alt={`Видео ${language === 'ru' ? street.nameRu : street.nameBe}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* imgs gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {street.images.map((img, idx) => (
            <div key={idx} className="aspect-video bg-muted rounded-lg overflow-hidden shadow">
              <img src={img} alt={`Фото ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* facts */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-muted/50 p-6 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-4 text-primary">{t.streets.facts}</h3>
            <ul className="space-y-2">
              {(language === 'ru' ? street.factsRu : street.factsBe).map((fact, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-foreground/90">{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-4 text-secondary">{t.streets.history}</h3>
            <p className="text-foreground/90 leading-relaxed">
              {language === 'ru' ? street.historyRu : street.historyBe}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StreetDetailsSection;
