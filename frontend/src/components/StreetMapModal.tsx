import { X } from 'lucide-react';
import { useEffect } from 'react';

interface StreetMapModalProps {
  streetName: string;
  isOpen: boolean;
  onClose: () => void;
}

const StreetMapModal = ({ streetName, isOpen, onClose }: StreetMapModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const mapsQuery = encodeURIComponent(`${streetName}, Минск`);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-[201] w-[90vw] max-w-4xl max-h-[90vh] bg-card rounded-lg shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Map */}
        <div className="w-full aspect-[16/10] bg-muted">
          <iframe
            title="street-map"
            src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
            className="w-full h-full"
            loading="lazy"
          />
        </div>

        {/* Footer (street name) */}
        <div className="p-4 bg-card border-t border-white/10">
          <div className="text-lg font-semibold text-foreground">{streetName}</div>
        </div>
      </div>
    </div>
  );
};

export default StreetMapModal;
