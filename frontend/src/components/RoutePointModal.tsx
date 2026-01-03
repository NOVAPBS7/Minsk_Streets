import { X, MapPin, Navigation } from 'lucide-react';
import { useEffect, useRef } from 'react';

export interface RoutePoint {
  name: string;
  address: string;
  image: string;
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  additionalInfo?: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
  }>;
}

interface RoutePointModalProps {
  point: RoutePoint | null;
  isOpen: boolean;
  onClose: () => void;
}

const RoutePointModal = ({ point, isOpen, onClose }: RoutePointModalProps) => {
  const scrollPosition = useRef(0);

  useEffect(() => {
    if (isOpen) {
      // сохраняем текущую позицию скролла в ref
      scrollPosition.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition.current}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // восстанавливаем позицию скролла из ref
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollPosition.current);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !point) return null;

  // создаем URL для гугл мопса
  const mapsQuery = point.coordinates
    ? `${point.coordinates.lat},${point.coordinates.lng}`
    : encodeURIComponent(`${point.address}, Минск`);
  
  const googleMapsUrl = point.coordinates
    ? `https://www.google.com/maps?q=${mapsQuery}&output=embed`
    : `https://www.google.com/maps?q=${mapsQuery}&output=embed`;

  // ссылка для открытия в гугл мопсе
  const openInMapsUrl = point.coordinates
    ? `https://www.google.com/maps?q=${mapsQuery}`
    : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative z-[201] w-full max-w-5xl max-h-[90vh] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border/50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center justify-center shadow-lg hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="overflow-y-auto overflow-x-hidden flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(148 163 184 / 0.5) transparent' }}>
          {/* header */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={point.image}
              alt={point.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                {point.name}
              </h2>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-5 h-5" />
                <p className="text-lg">{point.address}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {point.description && (
              <div className="mb-6">
                <p className="text-foreground/80 text-lg leading-relaxed">
                  {point.description}
                </p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Navigation className="w-6 h-6 text-primary" />
                  Местоположение
                </h3>
                <a
                  href={openInMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 sm:w-auto w-full"
                >
                  <Navigation className="w-4 h-4" />
                  <span className="whitespace-nowrap">Открыть в Google Maps</span>
                </a>
              </div>
              
              <div className="relative aspect-[16/9] bg-muted rounded-xl overflow-hidden shadow-lg border border-border/50 group">
                <div className="absolute inset-0 z-10 bg-transparent group-hover:pointer-events-none cursor-pointer transition-all duration-200" />
                <iframe
                  title={`map-${point.name}`}
                  src={googleMapsUrl}
                  className="w-full h-full pointer-events-none group-hover:pointer-events-auto"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Наведите курсор на карту для взаимодействия
              </p>
            </div>

            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border border-border/50">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Адрес</h4>
                  <p className="text-foreground/70">{point.address}</p>
                </div>
              </div>
            </div>

            {point.additionalInfo && point.additionalInfo.length > 0 && (
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {point.additionalInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border border-border/50"
                    >
                      <div className="flex flex-col items-center text-center gap-3">
                        <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-1 text-sm">{info.label}</h4>
                          <p className="text-foreground/70 text-sm">{info.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePointModal;

