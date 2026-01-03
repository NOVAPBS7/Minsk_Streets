import { memo } from 'react';
import { MapPin } from 'lucide-react';

interface StreetDetailsPanelProps {
  id: string;
  placeName: string;
  heroFirstName: string;
  heroLastName: string;
  description: string;
  onMapClick: () => void;
  onDetailsClick: () => void;
  zIndex: number;
}

const StreetDetailsPanel = memo(({
  id,
  placeName,
  heroFirstName,
  heroLastName,
  description,
  onMapClick,
  onDetailsClick,
  zIndex,
}: StreetDetailsPanelProps) => {
  return (
    <div id={id} className="details absolute top-[240px] left-[60px]" style={{ zIndex }}>
      <div className="place-box h-[46px] overflow-hidden">
        <div className="text pt-4 text-[20px] text-white relative before:absolute before:top-0 before:left-0 before:w-[30px] before:h-1 before:rounded-full before:bg-white">
          {placeName}
        </div>
      </div>
      <div className="title-box-1 mt-0.5 h-[100px] overflow-hidden">
        <div className="title-1 font-semibold text-[72px] font-['Oswald'] text-white">
          {heroFirstName}
        </div>
      </div>
      <div className="title-box-2 mt-0.5 h-[100px] overflow-hidden">
        <div className="title-2 font-semibold text-[72px] font-['Oswald'] text-white">
          {heroLastName}
        </div>
      </div>
      <div 
        className="desc mt-4 w-[500px] text-white/90 text-[17px] leading-relaxed tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" 
        style={{ 
          display: '-webkit-box', 
          WebkitLineClamp: 10, 
          WebkitBoxOrient: 'vertical' as any, 
          overflow: 'hidden',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.7), 0 0 2px rgba(0, 0, 0, 0.5)'
        }}
      >
        {description}
      </div>
      <div className="cta w-[500px] mt-6 flex items-center gap-4">
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMapClick();
          }}
          className="border-none bg-primary w-9 h-9 rounded-full text-white grid place-items-center hover:bg-primary/90 transition-colors"
          aria-label="Показать на карте"
        >
          <MapPin className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDetailsClick();
          }}
          className="discover border border-white bg-transparent h-9 rounded-full text-white px-6 text-xs uppercase hover:bg-white/10 transition-colors"
        >
          Узнать подробнее
        </button>
      </div>
    </div>
  );
});

StreetDetailsPanel.displayName = 'StreetDetailsPanel';

export default StreetDetailsPanel;

