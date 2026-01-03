import { memo } from 'react';

interface StreetCardProps {
  index: number;
  backgroundImage: string;
  placeName: string;
  heroFirstName: string;
  heroLastName: string;
}

const StreetCard = memo(({ index, backgroundImage, placeName, heroFirstName, heroLastName }: StreetCardProps) => {
  return (
    <div key={index}>
      <div
        id={`card-${index}`}
        className="card absolute left-0 top-0 bg-cover bg-center shadow-[6px_6px_10px_2px_rgba(0,0,0,0.6)]"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div
        id={`card-content-${index}`}
        className="card-content absolute left-0 top-0 text-white pl-4 pr-2 overflow-hidden"
        style={{ width: '200px' }}
      >
        <div className="content-start w-[30px] h-[5px] rounded-full bg-white" />
        <div className="content-place mt-1.5 text-[13px] font-medium truncate" style={{ maxWidth: '172px' }}>
          {placeName}
        </div>
        <div className="content-title-1 font-semibold text-[20px] font-['Oswald'] truncate" style={{ maxWidth: '172px' }}>
          {heroFirstName}
        </div>
        <div className="content-title-2 font-semibold text-[20px] font-['Oswald'] truncate" style={{ maxWidth: '172px' }}>
          {heroLastName}
        </div>
      </div>
    </div>
  );
});

StreetCard.displayName = 'StreetCard';

export default StreetCard;

