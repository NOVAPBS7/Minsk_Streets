import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { streetsSearchData, StreetSearchData } from '@/data/streetsSearch';
import { Search, MapPin, ExternalLink, User } from 'lucide-react';

const StreetSearchSection = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStreet, setSelectedStreet] = useState<StreetSearchData | null>(null);

  // расшифровка
  const districtNames: Record<string, { ru: string; be: string }> = {
    MOSKOVSKI: { ru: 'Московский район', be: 'Маскоўскі раён' },
    ZAVODSKI: { ru: 'Заводской район', be: 'Заводскі раён' },
    KASTRYCHNICKI: { ru: 'Октябрьский район', be: 'Кастрычніцкі раён' },
    LENINSKI: { ru: 'Ленинский район', be: 'Ленінскі раён' },
    PARTYZANSKI: { ru: 'Партизанский район', be: 'Партызанскі раён' },
    PERSHAMAYSKI: { ru: 'Первомайский район', be: 'Першамайскі раён' },
    SAVETSKI: { ru: 'Советский район', be: 'Савецкі раён' },
    FRUNZENSKI: { ru: 'Фрунзенский район', be: 'Фрунзенскі раён' },
    CENTRALNY: { ru: 'Центральный район', be: 'Цэнтральны раён' },
  };

  const filteredStreets = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const query = searchQuery.toLowerCase();
    return streetsSearchData.filter((street) => {
      const nameRu = street.nameRu.toLowerCase();
      const nameBe = street.nameBe.toLowerCase();
      const heroNameRu = street.heroNameRu.toLowerCase();
      const heroNameBe = street.heroNameBe.toLowerCase();
      return (
        nameRu.includes(query) ||
        nameBe.includes(query) ||
        heroNameRu.includes(query) ||
        heroNameBe.includes(query)
      );
    });
  }, [searchQuery]);

  const handleStreetSelect = (street: StreetSearchData) => {
    setSelectedStreet(street);
    setSearchQuery('');
  };

  const handleCloseDetails = () => {
    setSelectedStreet(null);
  };

  return (
    <section id="street-search" className={`relative w-full bg-background px-4 md:px-8 3xl:px-16 ${!searchQuery.trim() && !selectedStreet ? 'py-16 pb-8' : 'py-16'}`}>
      <div className="max-w-7xl 3xl:max-w-[1920px] 5xl:max-w-[2800px] mx-auto">
        {/* headder */}
        <div className="text-center mb-12 3xl:mb-16">
          <h2 className="text-4xl md:text-6xl 3xl:text-7xl 5xl:text-8xl font-bold text-foreground mb-4 3xl:mb-6">
            {language === 'ru' ? 'Поиск улиц' : 'Пошук вуліц'}
          </h2>
          <p className="text-lg 3xl:text-xl 5xl:text-2xl text-muted-foreground">
            {language === 'ru'
              ? 'Найдите информацию об улицах Минска, названных в честь героев'
              : 'Знайдзіце інфармацыю пра вуліцы Мінска, названыя ў гонар герояў'}
          </p>
        </div>

        {/* input */}
        <div className="max-w-2xl 3xl:max-w-3xl 5xl:max-w-4xl mx-auto mb-8 3xl:mb-12">
          <div className="relative">
            <Search className="absolute left-4 3xl:left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 3xl:w-7 3xl:h-7 5xl:w-9 5xl:h-9" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ru'
                  ? 'Введите название улицы или имя героя...'
                  : 'Увядзіце назву вуліцы або імя героя...'
              }
              className="w-full pl-12 3xl:pl-16 5xl:pl-20 pr-4 3xl:pr-6 py-4 3xl:py-6 5xl:py-8 text-lg 3xl:text-xl 5xl:text-2xl rounded-lg border-2 border-border bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* results */}
        {searchQuery.trim() && filteredStreets.length > 0 && (
          <div className="max-w-4xl 3xl:max-w-6xl 5xl:max-w-[2400px] mx-auto mb-8 3xl:mb-12">
            <div className="grid gap-4 3xl:gap-6 5xl:gap-8 md:grid-cols-2 lg:grid-cols-3 5xl:grid-cols-4">
              {filteredStreets.map((street) => (
                <button
                  key={street.id}
                  onClick={() => handleStreetSelect(street)}
                  className="relative p-6 3xl:p-8 5xl:p-10 rounded-lg 3xl:rounded-xl border-2 transition-all hover:shadow-lg text-left bg-card border-border hover:border-primary"
                >
                  {/* название района в правом верхнем углу */}
                  <div className="absolute top-2 3xl:top-3 right-2 3xl:right-3 text-xs 3xl:text-sm 5xl:text-base text-muted-foreground/50 font-medium">
                    {language === 'ru' 
                      ? districtNames[street.district]?.ru || street.district
                      : districtNames[street.district]?.be || street.district
                    }
                  </div>
                  
                  <h3 className="text-xl 3xl:text-2xl 5xl:text-3xl font-bold text-foreground mb-2 3xl:mb-3 pr-20 3xl:pr-24 5xl:pr-32">
                    {language === 'ru' ? street.nameRu : street.nameBe}
                  </h3>
                  <p className="text-sm 3xl:text-base 5xl:text-lg text-muted-foreground mb-2 3xl:mb-3">
                    {language === 'ru' ? street.heroNameRu : street.heroNameBe}
                  </p>
                  <p className="text-xs 3xl:text-sm 5xl:text-base text-muted-foreground">{street.heroYears}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {searchQuery.trim() && filteredStreets.length === 0 && (
          <div className="text-center py-12 3xl:py-16">
            <p className="text-muted-foreground text-lg 3xl:text-xl 5xl:text-2xl">
              {language === 'ru'
                ? 'Улицы не найдены. Попробуйте другой запрос.'
                : 'Вуліцы не знойдзены. Паспрабуйце іншы запыт.'}
            </p>
          </div>
        )}

        {/* details */}
        {selectedStreet && (
          <div className="max-w-5xl 3xl:max-w-6xl 5xl:max-w-[2400px] mx-auto mt-8 3xl:mt-12">
            <div className="rounded-2xl 3xl:rounded-3xl overflow-hidden shadow-2xl bg-card border border-border">
              {/* header */}
              <div className="p-6 md:p-8 3xl:p-12 5xl:p-16 border-b border-border">
                <div className="flex items-start justify-between mb-4 3xl:mb-6">
                  <div className="flex-1">
                    <h3 className="text-3xl md:text-4xl 3xl:text-5xl 5xl:text-6xl font-bold text-foreground mb-2 3xl:mb-4">
                      {language === 'ru' ? selectedStreet.nameRu : selectedStreet.nameBe}
                    </h3>
                    <div className="flex items-center gap-4 3xl:gap-6 flex-wrap">
                      <a
                        href={selectedStreet.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 3xl:gap-3 text-primary hover:text-primary/80 transition-colors"
                      >
                        <MapPin className="w-5 h-5 3xl:w-7 3xl:h-7 5xl:w-9 5xl:h-9" />
                        <span className="text-sm 3xl:text-base 5xl:text-lg font-medium">
                          {language === 'ru' ? 'Открыть в Google Maps' : 'Адкрыць у Google Maps'}
                        </span>
                        <ExternalLink className="w-4 h-4 3xl:w-6 3xl:h-6 5xl:w-7 5xl:h-7" />
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseDetails}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 3xl:p-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* hero Info */}
              <div className="p-6 md:p-8 3xl:p-12 5xl:p-16">
                <div className={`grid ${selectedStreet.district === 'MOSKOVSKI' ? 'md:grid-cols-[200px_1fr] 3xl:grid-cols-[280px_1fr] 5xl:grid-cols-[380px_1fr]' : 'md:grid-cols-1'} gap-6 3xl:gap-10 5xl:gap-12 mb-8 3xl:mb-12`}>
                  {/* hero photo - только для ММосковского района */}
                  {selectedStreet.district === 'MOSKOVSKI' && (
                    <div className="flex flex-col items-center">
                      <div className="w-full aspect-square rounded-lg 3xl:rounded-xl overflow-hidden mb-4 3xl:mb-6 bg-muted">
                        <img
                          src={selectedStreet.heroPhotoLink}
                          alt={language === 'ru' ? selectedStreet.heroNameRu : selectedStreet.heroNameBe}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 3xl:gap-3 mb-2 3xl:mb-3">
                          <User className="w-5 h-5 3xl:w-7 3xl:h-7 5xl:w-9 5xl:h-9 text-primary" />
                          <h4 className="text-xl 3xl:text-2xl 5xl:text-3xl font-bold text-foreground">
                            {language === 'ru' ? selectedStreet.heroNameRu : selectedStreet.heroNameBe}
                          </h4>
                        </div>
                        <p className="text-base 3xl:text-lg 5xl:text-xl text-muted-foreground">{selectedStreet.heroYears}</p>
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  <div>
                    {/* имя и годы для остальныз районов */}
                    {selectedStreet.district !== 'MOSKOVSKI' && (
                      <div className="mb-6 3xl:mb-8">
                        <div className="flex items-center gap-2 3xl:gap-3 mb-2 3xl:mb-3">
                          <User className="w-5 h-5 3xl:w-7 3xl:h-7 5xl:w-9 5xl:h-9 text-primary" />
                          <h4 className="text-xl 3xl:text-2xl 5xl:text-3xl font-bold text-foreground">
                            {language === 'ru' ? selectedStreet.heroNameRu : selectedStreet.heroNameBe}
                          </h4>
                        </div>
                        <p className="text-base 3xl:text-lg 5xl:text-xl text-muted-foreground">{selectedStreet.heroYears}</p>
                      </div>
                    )}
                    <h4 className="text-2xl 3xl:text-3xl 5xl:text-4xl font-bold text-foreground mb-4 3xl:mb-6">
                      {language === 'ru' ? 'Биография героя' : 'Біяграфія героя'}
                    </h4>
                    <p className="text-base 3xl:text-lg 5xl:text-xl text-foreground/90 leading-relaxed 3xl:leading-relaxed 5xl:leading-loose whitespace-pre-line">
                      {language === 'ru' ? selectedStreet.heroBiographyRu : selectedStreet.heroBiographyBe}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!searchQuery.trim() && !selectedStreet && (
          <div className="text-center py-4">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              {language === 'ru'
                ? 'Начните поиск, введя название улицы или имя героя'
                : 'Пачніце пошук, увёўшы назву вуліцы або імя героя'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StreetSearchSection;

