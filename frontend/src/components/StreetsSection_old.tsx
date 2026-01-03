{/* старая версия раздела улиц */}

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { streets } from '@/data/streets';
import { gsap } from 'gsap';
import { Bookmark } from 'lucide-react';
import StreetDetailsModal from './StreetDetailsModal';

const StreetsSection = () => {
  const { language } = useLanguage();
  const [order, setOrder] = useState<number[]>(Array.from({ length: streets.length }, (_, i) => i));
  const [detailsEven, setDetailsEven] = useState(true);
  const [clicks, setClicks] = useState(0);
  const [selectedStreetIndex, setSelectedStreetIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const loopTimeout = useRef<NodeJS.Timeout | null>(null);

  const offsetTopRef = useRef(200);
  const offsetLeftRef = useRef(700);
  const cardWidth = 200;
  const cardHeight = 300;
  const gap = 40;
  const numberSize = 50;
  const ease = 'sine.inOut';

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
          img.src = street.heroImage;
        });
      });

      try {
        await Promise.all(imagePromises);
      } catch (error) {
        console.error('Failed to load images', error);
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
  }, []);

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
    gsap.set(`${detailsInactive} .text`, { y: 100 });
    gsap.set(`${detailsInactive} .title-1`, { y: 100 });
    gsap.set(`${detailsInactive} .title-2`, { y: 100 });
    gsap.set(`${detailsInactive} .desc`, { y: 50 });
    gsap.set(`${detailsInactive} .cta`, { y: 60 });

    gsap.set('.progress-sub-foreground', {
      width: 500 * (1 / order.length) * (active + 1),
    });

    rest.forEach((i, index) => {
      gsap.set(`#card-${i}`, {
        x: offsetLeft + 400 + index * (cardWidth + gap),
        y: offsetTop,
        width: cardWidth,
        height: cardHeight,
        zIndex: 30,
        borderRadius: 10,
      });
      gsap.set(`#card-content-${i}`, {
        x: offsetLeft + 400 + index * (cardWidth + gap),
        zIndex: 40,
        y: offsetTop + cardHeight - 100,
      });
      gsap.set(`#slide-item-${i}`, { x: (index + 1) * numberSize });
    });

    gsap.set('.indicator', { x: -width });

    const startDelay = 0.6;

    gsap.to('.cover', {
      x: width + 400,
      delay: 0.5,
      ease,
      onComplete: () => {
        setTimeout(() => {
          loop();
        }, 500);
      },
    });

    rest.forEach((i, index) => {
      gsap.to(`#card-${i}`, {
        x: offsetLeft + index * (cardWidth + gap),
        zIndex: 30,
        delay: startDelay + 0.05 * index,
        ease,
      });
      gsap.to(`#card-content-${i}`, {
        x: offsetLeft + index * (cardWidth + gap),
        zIndex: 40,
        delay: startDelay + 0.05 * index,
        ease,
      });
    });

    gsap.to('#pagination', { y: 0, opacity: 1, ease, delay: startDelay });
    gsap.to(detailsActive, { opacity: 1, x: 0, ease, delay: startDelay });
  };

  const step = () => {
    return new Promise<void>((resolve) => {
      const newOrder = [...order];
      newOrder.push(newOrder.shift()!);
      setOrder(newOrder);
      setDetailsEven(!detailsEven);

      const detailsActive = !detailsEven ? '#details-even' : '#details-odd';
      const detailsInactive = !detailsEven ? '#details-odd' : '#details-even';
      const offsetTop = offsetTopRef.current;
      const offsetLeft = offsetLeftRef.current;

      const active = newOrder[0];
      const rest = newOrder.slice(1);
      const prv = rest[rest.length - 1];

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

      gsap.set(detailsActive, { zIndex: 22 });
      gsap.to(detailsActive, { opacity: 1, delay: 0.4, ease });
      gsap.to(`${detailsActive} .text`, { y: 0, delay: 0.1, duration: 0.7, ease });
      gsap.to(`${detailsActive} .title-1`, { y: 0, delay: 0.15, duration: 0.7, ease });
      gsap.to(`${detailsActive} .title-2`, { y: 0, delay: 0.15, duration: 0.7, ease });
      gsap.to(`${detailsActive} .desc`, { y: 0, delay: 0.3, duration: 0.4, ease });
      gsap.to(`${detailsActive} .cta`, {
        y: 0,
        delay: 0.35,
        duration: 0.4,
        onComplete: resolve,
        ease,
      });
      gsap.set(detailsInactive, { zIndex: 12 });

      gsap.set(`#card-${prv}`, { zIndex: 10 });
      gsap.set(`#card-${active}`, { zIndex: 20 });
      gsap.to(`#card-${prv}`, { scale: 1.5, ease });

      gsap.to(`#card-content-${active}`, {
        y: offsetTop + cardHeight - 10,
        opacity: 0,
        duration: 0.3,
        ease,
      });
      gsap.to(`#slide-item-${active}`, { x: 0, ease });
      gsap.to(`#slide-item-${prv}`, { x: -numberSize, ease });
      gsap.to('.progress-sub-foreground', {
        width: 500 * (1 / order.length) * (active + 1),
        ease,
      });

      gsap.to(`#card-${active}`, {
        x: 0,
        y: 0,
        ease,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        onComplete: () => {
          const xNew = offsetLeft + (rest.length - 1) * (cardWidth + gap);
          gsap.set(`#card-${prv}`, {
            x: xNew,
            y: offsetTop,
            width: cardWidth,
            height: cardHeight,
            zIndex: 30,
            borderRadius: 10,
            scale: 1,
          });

          gsap.set(`#card-content-${prv}`, {
            x: xNew,
            y: offsetTop + cardHeight - 100,
            opacity: 1,
            zIndex: 40,
          });
          gsap.set(`#slide-item-${prv}`, { x: rest.length * numberSize });

          gsap.set(detailsInactive, { opacity: 0 });
          gsap.set(`${detailsInactive} .text`, { y: 100 });
          gsap.set(`${detailsInactive} .title-1`, { y: 100 });
          gsap.set(`${detailsInactive} .title-2`, { y: 100 });
          gsap.set(`${detailsInactive} .desc`, { y: 50 });
          gsap.set(`${detailsInactive} .cta`, { y: 60 });
          setClicks((prev) => Math.max(0, prev - 1));
        },
      });

      rest.forEach((i, index) => {
        if (i !== prv) {
          const xNew = offsetLeft + index * (cardWidth + gap);
          gsap.set(`#card-${i}`, { zIndex: 30 });
          gsap.to(`#card-${i}`, {
            x: xNew,
            y: offsetTop,
            width: cardWidth,
            height: cardHeight,
            ease,
            delay: 0.1 * (index + 1),
          });

          gsap.to(`#card-content-${i}`, {
            x: xNew,
            y: offsetTop + cardHeight - 100,
            opacity: 1,
            zIndex: 40,
            ease,
            delay: 0.1 * (index + 1),
          });
          gsap.to(`#slide-item-${i}`, { x: (index + 1) * numberSize, ease });
        }
      });
    });
  };

  const loop = async () => {
    await animate('.indicator', 2, { x: 0 });
    await animate('.indicator', 0.8, { x: window.innerWidth, delay: 0.3 });
    gsap.set('.indicator', { x: -window.innerWidth });
    await step();
    loopTimeout.current = setTimeout(() => {
      loop();
    }, 3000);
  };

  const animate = (target: string, duration: number, properties: any) => {
    return new Promise<void>((resolve) => {
      gsap.to(target, {
        ...properties,
        duration: duration,
        onComplete: resolve,
      });
    });
  };

  const handlePrevious = () => {
    if (loopTimeout.current) {
      clearTimeout(loopTimeout.current);
    }
    setClicks((prev) => prev + 1);
    step().then(() => {
      loopTimeout.current = setTimeout(() => loop(), 3000);
    });
  };

  const handleNext = () => {
    if (loopTimeout.current) {
      clearTimeout(loopTimeout.current);
    }
    setClicks((prev) => prev + 1);
    step().then(() => {
      loopTimeout.current = setTimeout(() => loop(), 3000);
    });
  };

  const handleDiscoverLocation = (index: number) => {
    if (loopTimeout.current) {
      clearTimeout(loopTimeout.current);
    }
    setSelectedStreetIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedStreetIndex(null);
    loopTimeout.current = setTimeout(() => loop(), 3000);
  };

  return (
    <section id="streets" className="relative w-full h-screen overflow-hidden bg-background">
      <div ref={containerRef} className="relative w-full h-full">
        <div className="indicator fixed left-0 right-0 top-0 h-[5px] z-[60] bg-primary" />

        <div id="demo">
          {streets.map((street, index) => (
            <div key={street.id}>
              <div
                id={`card-${index}`}
                className="card absolute left-0 top-0 bg-cover bg-center shadow-[6px_6px_10px_2px_rgba(0,0,0,0.6)]"
                style={{ backgroundImage: `url(${street.heroImage})` }}
              />
              <div
                id={`card-content-${index}`}
                className="card-content absolute left-0 top-0 text-white pl-4"
              >
                <div className="content-start w-[30px] h-[5px] rounded-full bg-white" />
                <div className="content-place mt-1.5 text-[13px] font-medium">
                  {language === 'ru' ? street.nameRu : street.nameBe}
                </div>
                <div className="content-title-1 font-semibold text-[20px] font-['Oswald']">
                  {(language === 'ru' ? street.heroNameRu : street.heroNameBe).split(' ')[0]}
                </div>
                <div className="content-title-2 font-semibold text-[20px] font-['Oswald']">
                  {(language === 'ru' ? street.heroNameRu : street.heroNameBe).split(' ').slice(1).join(' ')}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div id="details-even" className="details z-[22] absolute top-[240px] left-[60px]">
          <div className="place-box h-[46px] overflow-hidden">
            <div className="text pt-4 text-[20px] relative before:absolute before:top-0 before:left-0 before:w-[30px] before:h-1 before:rounded-full before:bg-white">
              {language === 'ru' ? streets[0].nameRu : streets[0].nameBe}
            </div>
          </div>
          <div className="title-box-1 mt-0.5 h-[100px] overflow-hidden">
            <div className="title-1 font-semibold text-[72px] font-['Oswald']">
              {(language === 'ru' ? streets[0].heroNameRu : streets[0].heroNameBe).split(' ')[0]}
            </div>
          </div>
          <div className="title-box-2 mt-0.5 h-[100px] overflow-hidden">
            <div className="title-2 font-semibold text-[72px] font-['Oswald']">
              {(language === 'ru' ? streets[0].heroNameRu : streets[0].heroNameBe).split(' ').slice(1).join(' ')}
            </div>
          </div>
          <div className="desc mt-4 w-[500px] text-white/90">
            {language === 'ru' ? streets[0].historyRu : streets[0].historyBe}
          </div>
          <div className="cta w-[500px] mt-6 flex items-center gap-4">
            <button className="bookmark border-none bg-primary w-9 h-9 rounded-full text-white grid place-items-center hover:bg-primary/90 transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDiscoverLocation(order[0])}
              className="discover border border-white bg-transparent h-9 rounded-full text-white px-6 text-xs uppercase hover:bg-white/10 transition-colors"
            >
              Discover Location
            </button>
          </div>
        </div>

        <div id="details-odd" className="details z-[12] absolute top-[240px] left-[60px]">
          <div className="place-box h-[46px] overflow-hidden">
            <div className="text pt-4 text-[20px] relative before:absolute before:top-0 before:left-0 before:w-[30px] before:h-1 before:rounded-full before:bg-white">
              {language === 'ru' ? streets[0].nameRu : streets[0].nameBe}
            </div>
          </div>
          <div className="title-box-1 mt-0.5 h-[100px] overflow-hidden">
            <div className="title-1 font-semibold text-[72px] font-['Oswald']">
              {(language === 'ru' ? streets[0].heroNameRu : streets[0].heroNameBe).split(' ')[0]}
            </div>
          </div>
          <div className="title-box-2 mt-0.5 h-[100px] overflow-hidden">
            <div className="title-2 font-semibold text-[72px] font-['Oswald']">
              {(language === 'ru' ? streets[0].heroNameRu : streets[0].heroNameBe).split(' ').slice(1).join(' ')}
            </div>
          </div>
          <div className="desc mt-4 w-[500px] text-white/90">
            {language === 'ru' ? streets[0].historyRu : streets[0].historyBe}
          </div>
          <div className="cta w-[500px] mt-6 flex items-center gap-4">
            <button className="bookmark border-none bg-primary w-9 h-9 rounded-full text-white grid place-items-center hover:bg-primary/90 transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDiscoverLocation(order[0])}
              className="discover border border-white bg-transparent h-9 rounded-full text-white px-6 text-xs uppercase hover:bg-white/10 transition-colors"
            >
              Discover Location
            </button>
          </div>
        </div>

        <div id="pagination" className="absolute left-0 top-0 inline-flex items-center gap-5">
          <div
            onClick={handlePrevious}
            className="arrow arrow-left z-[60] w-[50px] h-[50px] rounded-full border-2 border-white/30 grid place-items-center cursor-pointer hover:border-white/50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 stroke-[2] text-white/60"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </div>
          <div
            onClick={handleNext}
            className="arrow arrow-right z-[60] w-[50px] h-[50px] rounded-full border-2 border-white/30 grid place-items-center cursor-pointer hover:border-white/50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 stroke-[2] text-white/60"
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

      {selectedStreetIndex !== null && (
        <StreetDetailsModal
          street={streets[selectedStreetIndex]}
          isOpen={selectedStreetIndex !== null}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};

export default StreetsSection;
