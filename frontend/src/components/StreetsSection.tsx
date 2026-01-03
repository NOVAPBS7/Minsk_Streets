{/* основной раздел сайта(todo: почистить от неиспользуемого мусора) */}

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { streets } from '@/data/streets';
import { gsap } from 'gsap';
import StreetDetailsModal from './StreetDetailsModal';
import StreetMapModal from './StreetMapModal';
import StreetDetailsPanel from './StreetDetailsPanel';
import StreetCard from './StreetCard';
import { STREETS_CONFIG } from '@/constants/streetsConfig';

const StreetsSection = () => {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const [order, setOrder] = useState<number[]>(Array.from({ length: streets.length }, (_, i) => i));
  const [detailsEven, setDetailsEven] = useState(true);
  const [selectedStreetIndex, setSelectedStreetIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const loopTimeout = useRef<NodeJS.Timeout | null>(null);
  const isAnimating = useRef(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const offsetTopRef = useRef(200);
  const offsetLeftRef = useRef(700);
  const { CARD_WIDTH, CARD_HEIGHT, GAP, NUMBER_SIZE, EASE } = STREETS_CONFIG;

  const animate = (target: string, duration: number, properties: any) => {
    return new Promise<void>((resolve) => {
      gsap.to(target, {
        ...properties,
        duration: duration,
        onComplete: resolve,
      });
    });
  };

  const step = (direction: 'next' | 'prev') => {
    return new Promise<void>((resolve) => {
      // модалка открыта или уже идёт анимация, то не перелистываем
      if (selectedStreetIndex !== null || isAnimating.current) {
        resolve();
        return;
      }
      isAnimating.current = true;
      setOrder((prevOrder) => {
        let newOrder: number[] = [];
        if (direction === 'next') {
          newOrder = [...prevOrder];
          newOrder.push(newOrder.shift()!);
        } else {
          newOrder = [...prevOrder];
          newOrder.unshift(newOrder.pop()!);
        }
        
        // вычисляение новоого значение локально, чтобы использовать его сразу
        const newDetailsEven = !detailsEven;
        setDetailsEven(newDetailsEven);

        // ВСЯ ЛОГИКА ПОД newOrder
        const detailsActive = newDetailsEven ? '#details-even' : '#details-odd';
        const detailsInactive = newDetailsEven ? '#details-odd' : '#details-even';
        const offsetTop = offsetTopRef.current;
        const offsetLeft = offsetLeftRef.current;

        const active = newOrder[0];
        const rest = newOrder.slice(1);
        const prv = rest[rest.length - 1];

        gsap.set(detailsActive, { zIndex: 22 });
        gsap.set(detailsInactive, { zIndex: 12 });
        
        // убиваем предыдущие анимации для обеих панелей
        gsap.killTweensOf([
          `${detailsActive} .text`,
          `${detailsActive} .title-1`,
          `${detailsActive} .title-2`,
          `${detailsActive} .desc`,
          `${detailsActive} .cta`,
          `${detailsInactive} .text`,
          `${detailsInactive} .title-1`,
          `${detailsInactive} .title-2`,
          `${detailsInactive} .desc`,
          `${detailsInactive} .cta`,
          detailsActive,
          detailsInactive
        ]);
        

        gsap.set(detailsInactive, { opacity: 1 });
        gsap.set(`${detailsInactive} .text`, { y: 0, opacity: 1 });
        gsap.set(`${detailsInactive} .title-1`, { y: 0, opacity: 1 });
        gsap.set(`${detailsInactive} .title-2`, { y: 0, opacity: 1 });
        gsap.set(`${detailsInactive} .desc`, { y: 0, opacity: 1 });
        gsap.set(`${detailsInactive} .cta`, { y: 0, opacity: 1 });
        
        // устанавливаем начальные позиции и прозрачность для анимации текста новой активной панели ПЕРЕД обновлением текста
        // сначала скрываем всю панель, чтобы новый текст не был виден
        gsap.set(detailsActive, { opacity: 0 });
        gsap.set(`${detailsActive} .text`, { y: 100, opacity: 0 });
        gsap.set(`${detailsActive} .title-1`, { y: 100, opacity: 0 });
        gsap.set(`${detailsActive} .title-2`, { y: 100, opacity: 0 });
        gsap.set(`${detailsActive} .desc`, { y: 100, opacity: 0 });
        gsap.set(`${detailsActive} .cta`, { y: 60, opacity: 0 });
        
        // обновляем содержимое текста после установки начальных значений
        // requestAnimationFrame для синхронизации с браузером
        requestAnimationFrame(() => {
          const activeStreet = streets[active];
          const detailsElement = document.querySelector(detailsActive);
          if (detailsElement) {
            const placeText = detailsElement.querySelector('.place-box .text');
            const title1 = detailsElement.querySelector('.title-1');
            const title2 = detailsElement.querySelector('.title-2');
            const desc = detailsElement.querySelector('.desc');

            if (placeText) placeText.textContent = language === 'ru' ? activeStreet.nameRu : activeStreet.nameBe;
            if (title1) title1.textContent = language === 'ru' ? activeStreet.heroNameRu.split(' ')[0] : activeStreet.heroNameBe.split(' ')[0];
            if (title2) title2.textContent = language === 'ru' ? activeStreet.heroNameRu.split(' ').slice(1).join(' ') : activeStreet.heroNameBe.split(' ').slice(1).join(' ');
            if (desc) desc.textContent = language === 'ru' ? activeStreet.historyRu : activeStreet.historyBe;
          }
          
          // кривая анимация текста(todo: переделать нормально)
          const exitDuration = STREETS_CONFIG.TEXT_DURATION * 0.8;
          gsap.to(`${detailsInactive} .text`, { 
            y: 100,
            opacity: 0,
            duration: exitDuration, 
            ease: EASE 
          });
          gsap.to(`${detailsInactive} .title-1`, { 
            y: 100,
            opacity: 0,
            duration: exitDuration, 
            ease: EASE 
          });
          gsap.to(`${detailsInactive} .title-2`, { 
            y: 100,
            opacity: 0,
            duration: exitDuration, 
            ease: EASE 
          });
          gsap.to(`${detailsInactive} .desc`, { 
            y: 100,
            opacity: 0,
            duration: exitDuration, 
            ease: EASE 
          });
          gsap.to(`${detailsInactive} .cta`, { 
            y: 60,
            opacity: 0,
            duration: STREETS_CONFIG.CTA_DURATION * 0.8, 
            ease: EASE 
          });
          gsap.to(detailsInactive, { 
            opacity: 0, 
            duration: exitDuration, 
            ease: EASE,
            onComplete: () => {
              // сбрасываем позиции и прозрачность
              gsap.set(`${detailsInactive} .text`, { y: 100, opacity: 1 });
              gsap.set(`${detailsInactive} .title-1`, { y: 100, opacity: 1 });
              gsap.set(`${detailsInactive} .title-2`, { y: 100, opacity: 1 });
              gsap.set(`${detailsInactive} .desc`, { y: 100, opacity: 1 });
              gsap.set(`${detailsInactive} .cta`, { y: 60, opacity: 1 });
            }
          });
          
          const entryDelay = exitDuration * 0.4; 
          gsap.to(detailsActive, { 
            opacity: 1, 
            delay: entryDelay, 
            duration: STREETS_CONFIG.DETAILS_OPACITY_DELAY, 
            ease: EASE 
          });
          gsap.to(`${detailsActive} .text`, { 
            y: 0,
            opacity: 1,
            delay: entryDelay + STREETS_CONFIG.DETAILS_TEXT_DELAY, 
            duration: STREETS_CONFIG.TEXT_DURATION, 
            ease: EASE 
          });
          gsap.to(`${detailsActive} .title-1`, { 
            y: 0,
            opacity: 1,
            delay: entryDelay + STREETS_CONFIG.DETAILS_TITLE_DELAY, 
            duration: STREETS_CONFIG.TEXT_DURATION, 
            ease: EASE 
          });
          gsap.to(`${detailsActive} .title-2`, { 
            y: 0,
            opacity: 1,
            delay: entryDelay + STREETS_CONFIG.DETAILS_TITLE_DELAY, 
            duration: STREETS_CONFIG.TEXT_DURATION, 
            ease: EASE 
          });
          gsap.to(`${detailsActive} .desc`, { 
            y: 0,
            opacity: 1,
            delay: entryDelay + STREETS_CONFIG.DETAILS_TITLE_DELAY, 
            duration: STREETS_CONFIG.TEXT_DURATION, 
            ease: EASE 
          });
          gsap.to(`${detailsActive} .cta`, {
            y: 0,
            opacity: 1,
            delay: entryDelay + STREETS_CONFIG.DETAILS_CTA_DELAY,
            duration: STREETS_CONFIG.CTA_DURATION,
            ease: EASE,
          });
        }); // закрываем requestAnimationFrame
        gsap.set(`#card-${prv}`, { zIndex: 10 });
        gsap.set(`#card-${active}`, { zIndex: 20 });
        gsap.to(`#card-${prv}`, { scale: 1.5, ease: EASE });
        gsap.to(`#card-content-${active}`, {
          y: offsetTop + CARD_HEIGHT - 10,
          opacity: 0,
          duration: STREETS_CONFIG.CARD_OPACITY_DURATION,
          ease: EASE,
        });
        gsap.to(`#slide-item-${active}`, { x: 0, ease: EASE });
        gsap.to(`#slide-item-${prv}`, { x: -NUMBER_SIZE, ease: EASE });
        gsap.to('.progress-sub-foreground', {
          width: STREETS_CONFIG.PROGRESS_WIDTH * (1 / newOrder.length) * (active + 1),
          ease: EASE,
        });
        gsap.to(`#card-${active}`, {
          x: 0,
          y: 0,
          ease: EASE,
          width: window.innerWidth,
          height: window.innerHeight,
          borderRadius: 0,
          onComplete: () => {
            const xNew = offsetLeft + (rest.length - 1) * (CARD_WIDTH + GAP);
            gsap.set(`#card-${prv}`, {
              x: xNew,
              y: offsetTop,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              zIndex: 30,
              borderRadius: 10,
              scale: 1,
            });
            gsap.set(`#card-content-${prv}`, {
              x: xNew,
              y: offsetTop + CARD_HEIGHT - 100,
              opacity: 1,
              zIndex: 40,
            });
            gsap.set(`#slide-item-${prv}`, { x: rest.length * NUMBER_SIZE });
            isAnimating.current = false;
            resolve();
          },
        });
        rest.forEach((i, index) => {
          if (i !== prv) {
            const xNew = offsetLeft + index * (CARD_WIDTH + GAP);
            gsap.set(`#card-${i}`, { zIndex: 30 });
            gsap.to(`#card-${i}`, {
              x: xNew,
              y: offsetTop,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              ease: EASE,
              delay: 0.1 * (index + 1),
            });
            gsap.to(`#card-content-${i}`, {
              x: xNew,
              y: offsetTop + CARD_HEIGHT - 100,
              opacity: 1,
              zIndex: 40,
              ease: EASE,
              delay: 0.1 * (index + 1),
            });
            gsap.to(`#slide-item-${i}`, { x: (index + 1) * NUMBER_SIZE, ease: EASE });
          }
        });
        return newOrder;
      });
    });
  };

  const loop = async () => {
    if (selectedStreetIndex !== null || isMapOpen) return;
    await animate('.indicator', STREETS_CONFIG.INDICATOR_DURATION, { x: 0 });
    if (selectedStreetIndex !== null || isMapOpen) return; // повторная проверка перед следующей фазой
    await animate('.indicator', STREETS_CONFIG.INDICATOR_EXIT_DURATION, { x: window.innerWidth, delay: 0.3 });
    gsap.set('.indicator', { x: -window.innerWidth });
    if (selectedStreetIndex !== null || isMapOpen) return; // не вызывать step при открытой модалке/карте
    await step('next');
    if (selectedStreetIndex === null && !isMapOpen) {
      loopTimeout.current = setTimeout(() => {
        loop();
      }, STREETS_CONFIG.AUTO_SCROLL_DELAY);
    }
  };

  const init = () => {
    const [active, ...rest] = order;
    const detailsActive = detailsEven ? '#details-even' : '#details-odd';
    const detailsInactive = detailsEven ? '#details-odd' : '#details-even';
    const { innerHeight: height, innerWidth: width } = window;
    const offsetTop = offsetTopRef.current;
    const offsetLeft = offsetLeftRef.current;

    gsap.set('#pagination', {
      top: offsetTop + 330,
      left: offsetLeft,
      y: 200,
      opacity: 0,
      zIndex: 60,
    });

    gsap.set(`#card-${active}`, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
    gsap.set(`#card-content-${active}`, { x: 0, y: 0, opacity: 0 });
    gsap.set(detailsActive, { opacity: 0, zIndex: 22, x: -200 });
    gsap.set(detailsInactive, { opacity: 0, zIndex: 12 });
    gsap.set(`${detailsInactive} .text`, { y: 100, opacity: 1 });
    gsap.set(`${detailsInactive} .title-1`, { y: 100, opacity: 1 });
    gsap.set(`${detailsInactive} .title-2`, { y: 100, opacity: 1 });
    gsap.set(`${detailsInactive} .desc`, { y: 100, opacity: 1 });
    gsap.set(`${detailsInactive} .cta`, { y: 60, opacity: 1 });

    gsap.set('.progress-sub-foreground', {
      width: STREETS_CONFIG.PROGRESS_WIDTH * (1 / order.length) * (active + 1),
    });

    rest.forEach((i, index) => {
      gsap.set(`#card-${i}`, {
        x: offsetLeft + 400 + index * (CARD_WIDTH + GAP),
        y: offsetTop,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        zIndex: 30,
        borderRadius: 10,
      });
      gsap.set(`#card-content-${i}`, {
        x: offsetLeft + 400 + index * (CARD_WIDTH + GAP),
        zIndex: 40,
        y: offsetTop + CARD_HEIGHT - 100,
      });
      gsap.set(`#slide-item-${i}`, { x: (index + 1) * NUMBER_SIZE });
    });

    gsap.set('.indicator', { x: -width });

    const startDelay = STREETS_CONFIG.START_DELAY;

    gsap.to('.cover', {
      x: width + 400,
      delay: 0.5,
      ease: EASE,
      onComplete: () => {
        // автоматическая прокрутка отключена
      },
    });

    rest.forEach((i, index) => {
      gsap.to(`#card-${i}`, {
        x: offsetLeft + index * (CARD_WIDTH + GAP),
        zIndex: 30,
        delay: startDelay + STREETS_CONFIG.CARD_DELAY_STEP * index,
        ease: EASE,
      });
      gsap.to(`#card-content-${i}`, {
        x: offsetLeft + index * (CARD_WIDTH + GAP),
        zIndex: 40,
        delay: startDelay + STREETS_CONFIG.CARD_DELAY_STEP * index,
        ease: EASE,
      });
    });

    gsap.to('#pagination', { y: 0, opacity: 1, ease: EASE, delay: startDelay });
    gsap.to(detailsActive, { opacity: 1, x: 0, ease: EASE, delay: startDelay });
  };

  // anim title on mount
  useEffect(() => {
    if (titleRef.current) {
      const titleElement = titleRef.current;
      const words = titleElement.querySelectorAll('.title-word');
      
      gsap.set(words, { opacity: 0, y: 50, scale: 0.8 });
      
      gsap.to(words, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.2)',
        delay: 0.3,
      });

    }
  }, [language]);

  useEffect(() => {
    const updateDimensions = () => {
      const { innerHeight: height, innerWidth: width } = window;
      offsetTopRef.current = height - 430;
      offsetLeftRef.current = width - 830;
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return;

    const loadImages = async () => {
      const imagePromises = streets.map((street) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
          img.src = street.streetVideo;
        });
      });

      try {
        await Promise.all(imagePromises);
      } catch (err) {
        console.error('Failed to load images', err);
      }
      
      init();
      isInitialized.current = true;
    };

    loadImages();

    return () => {
      if (loopTimeout.current) {
        clearTimeout(loopTimeout.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // автоматическая прокрутка выкл
  // useEffect(() => {
  //   if (selectedStreetIndex === null && !isMapOpen) {
  //     if (!loopTimeout.current) {
  //       loopTimeout.current = setTimeout(() => loop(), 3000);
  //     }
  //   } else {
  //     if (loopTimeout.current) {
  //       clearTimeout(loopTimeout.current);
  //       loopTimeout.current = null;
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedStreetIndex, isMapOpen]);


  const handlePrevious = useCallback(() => {
    if (isAnimating.current) return;
    if (selectedStreetIndex !== null || isMapOpen) return; // блокируем при открытой модалке/карте
    if (loopTimeout.current) {
      clearTimeout(loopTimeout.current);
      loopTimeout.current = null;
    }
    step('prev');
  }, [selectedStreetIndex, isMapOpen]);

  const handleNext = useCallback(() => {
    if (isAnimating.current) return;
    if (selectedStreetIndex !== null || isMapOpen) return; // блокируем при открытой модалке/карте
    if (loopTimeout.current) {
      clearTimeout(loopTimeout.current);
      loopTimeout.current = null;
    }
    step('next');
  }, [selectedStreetIndex, isMapOpen]);

  const handleDiscoverLocation = useCallback((index: number) => {
    if (loopTimeout.current) {
      clearTimeout(loopTimeout.current);
    }
    // сохраняем текущую позицию прокрутки перед открытием модалки
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    document.body.setAttribute('data-scroll-y-preserve', scrollY.toString());
    setSelectedStreetIndex(index);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedStreetIndex(null);
  }, []);

  const handleToggleMap = useCallback(() => {
    if (loopTimeout.current) {
      clearTimeout(loopTimeout.current);
      loopTimeout.current = null;
    }
    setIsMapOpen((prev) => !prev);
  }, []);

  const activeStreetIndex = order[0];
  const activeStreet = useMemo(() => streets[activeStreetIndex], [activeStreetIndex]);
  const activeStreetName = useMemo(
    () => (language === 'ru' ? activeStreet.nameRu : activeStreet.nameBe),
    [activeStreet, language]
  );

  const activeStreetData = useMemo(() => {
    const heroName = language === 'ru' ? activeStreet.heroNameRu : activeStreet.heroNameBe;
    const [firstName, ...rest] = heroName.split(' ');
    return {
      placeName: activeStreetName,
      firstName,
      lastName: rest.join(' '),
      description: language === 'ru' ? activeStreet.historyRu : activeStreet.historyBe,
    };
  }, [activeStreet, activeStreetName, language]);

  return (
    <section id="streets" className="relative w-full h-screen overflow-hidden bg-background">
      <div ref={containerRef} className="relative w-full h-full">
        <div className="indicator fixed left-0 right-0 top-0 h-[5px] z-[60] bg-primary" />

        <div 
          ref={titleRef}
          className="absolute top-0 left-0 right-0 z-[70] px-8 md:px-16"
        >
          <div 
            ref={titleContainerRef}
            className="relative w-full max-w-[95%] mx-auto"
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
            <h2 
              className="relative text-4xl md:text-6xl lg:text-7xl font-bold text-center py-6 px-8 text-foreground"
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              {t.streets.animatedTitle.split(' ').map((word, index) => (
                <span
                  key={index}
                  className="title-word inline-block mx-1 md:mx-2"
                >
                  {word}
                </span>
              ))}
            </h2>
          </div>
        </div>

        {/* cards */}
        <div id="demo">
          {streets.map((street, index) => {
            const heroName = language === 'ru' ? street.heroNameRu : street.heroNameBe;
            const [firstName, ...rest] = heroName.split(' ');
            return (
              <StreetCard
                key={street.id}
                index={index}
                backgroundImage={street.streetVideo}
                placeName={language === 'ru' ? street.nameRu : street.nameBe}
                heroFirstName={firstName}
                heroLastName={rest.join(' ')}
              />
            );
          })}
        </div>

        {/* details even */}
        <StreetDetailsPanel
          id="details-even"
          placeName={activeStreetData.placeName}
          heroFirstName={activeStreetData.firstName}
          heroLastName={activeStreetData.lastName}
          description={activeStreetData.description}
          onMapClick={handleToggleMap}
          onDetailsClick={() => handleDiscoverLocation(order[0])}
          zIndex={22}
        />

        {/* details odd */}
        <StreetDetailsPanel
          id="details-odd"
          placeName={activeStreetData.placeName}
          heroFirstName={activeStreetData.firstName}
          heroLastName={activeStreetData.lastName}
          description={activeStreetData.description}
          onMapClick={handleToggleMap}
          onDetailsClick={() => handleDiscoverLocation(order[0])}
          zIndex={12}
        />

        <div id="pagination" className="absolute left-0 top-0 inline-flex items-center gap-5">
          <div
            onClick={handlePrevious}
            className="arrow arrow-left z-[60] w-[50px] h-[50px] rounded-full border-2 border-white/80 grid place-items-center cursor-pointer hover:border-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 stroke-[2] text-white/90"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </div>
          <div
            onClick={handleNext}
            className="arrow arrow-right z-[60] w-[50px] h-[50px] rounded-full border-2 border-white/80 grid place-items-center cursor-pointer hover:border-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 stroke-[2] text-white/90"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
          <div className="progress-sub-container z-[60] w-[500px] h-[50px] flex items-center">
            <div className="progress-sub-background w-[500px] h-[3px] bg-white/20">
              <div className="progress-sub-foreground h-[3px] bg-primary" />
            </div>
          </div>
          <div className="slide-numbers w-[50px] h-[50px] overflow-hidden z-[60] relative">
            {streets.map((_, index) => (
              <div
                key={index}
                id={`slide-item-${index}`}
                className="item w-[50px] h-[50px] absolute text-white top-0 left-0 grid place-items-center text-[32px] font-bold"
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="cover absolute left-0 top-0 w-screen h-screen bg-background z-[100]" />
      </div>

      {/* modal */}
      {selectedStreetIndex !== null && (
        <StreetDetailsModal
          street={streets[selectedStreetIndex]}
          isOpen={selectedStreetIndex !== null}
          onClose={handleCloseModal}
          onPrev={() => {
            const total = streets.length;
            const current = selectedStreetIndex!;
            const prevIndex = (current - 1 + total) % total;
            setSelectedStreetIndex(prevIndex);
          }}
          onNext={() => {
            const total = streets.length;
            const current = selectedStreetIndex!;
            const nextIndex = (current + 1) % total;
            setSelectedStreetIndex(nextIndex);
          }}
        />
      )}

      {/* map modal */}
      {isMapOpen && (
        <StreetMapModal
          streetName={activeStreetName}
          isOpen={isMapOpen}
          onClose={handleToggleMap}
        />
      )}
    </section>
  );
};

export default StreetsSection;
