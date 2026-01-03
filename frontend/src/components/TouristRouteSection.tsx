import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, ChevronDown, ChevronUp, Route, Award, Mail, User, Phone, Send } from 'lucide-react';
import { streets } from '@/data/streets';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RoutePointModal, { RoutePoint } from './RoutePointModal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

type ExcursionFormValues = {
  fullName: string;
  email: string;
  phone: string;
};

const TouristRouteSection = () => {
  const { t } = useLanguage();

  const excursionFormSchema = z.object({
    fullName: z.string().min(2, t.touristRoute.formValidation.nameMin).max(100, t.touristRoute.formValidation.nameMax),
    email: z.string().email(t.touristRoute.formValidation.emailInvalid),
    phone: z.string().min(7, t.touristRoute.formValidation.phoneMin).regex(/^[\d\s\+\-\(\)]+$/, t.touristRoute.formValidation.phoneFormat),
  });
  const [showQuizzes, setShowQuizzes] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const routeCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const routeListRef = useRef<HTMLDivElement>(null);
  const objectivesRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLButtonElement[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExcursionFormValues>({
    resolver: zodResolver(excursionFormSchema),
  });

  const handlePointClick = (point: RoutePoint, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedPoint(point);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPoint(null), 300);
  };

  // обработка отправки формы
  const onSubmit = async (data: ExcursionFormValues) => {
    setIsSubmitting(true);
    try {
      // api.streets.novapbs.ru для API запросов
      const apiUrl = import.meta.env.VITE_API_URL || '';
      
      console.log('Sending request to:', `${apiUrl}/smtp/excursion-request`);
      console.log('Request data:', { full_name: data.fullName, email: data.email, phone: data.phone });
      
      const response = await fetch(`${apiUrl}/smtp/excursion-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: t.touristRoute.toastServerError }));
        throw new Error(errorData.detail || `Ошибка HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success response:', result);

      toast.success(t.touristRoute.toastSuccess, {
        description: t.touristRoute.toastSuccessDescription,
      });
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      
      let errorMessage = t.touristRoute.toastErrorDescription;
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = t.touristRoute.toastErrorConnection;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(t.touristRoute.toastError, {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showRouteLabel = t?.touristRoute?.showRoute ?? 'Показать маршрут';
  const hideRouteLabel = t?.touristRoute?.hideRoute ?? 'Скрыть маршрут';
  const quizButtonLabel = t?.touristRoute?.quizButton ?? 'Викторины';

  useEffect(() => {
    if (!showRoute) return;

    const ctx = gsap.context(() => {
      const cards = routeCardsRef.current.filter(
        (card): card is HTMLDivElement => Boolean(card)
      );
      const formElement = formRef.current;
      const formFields = formElement
        ? Array.from(formElement.querySelectorAll<HTMLElement>('.form-field'))
        : [];
      const submitButton = formElement?.querySelector<HTMLElement>('.form-submit');

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });

      if (routeListRef.current) {
        timeline.fromTo(
          routeListRef.current,
          {
            opacity: 0,
            clipPath: 'inset(15% 15% 85% 15%)',
            filter: 'blur(10px)',
          },
          {
            opacity: 1,
            clipPath: 'inset(0% 0% 0% 0%)',
            filter: 'blur(0px)',
            duration: 0.6,
            ease: 'power2.out',
          },
          0
        );
      }

      if (cards.length) {
        gsap.set(cards, {
          opacity: 0,
          y: 60,
          rotateX: -6,
          filter: 'blur(6px)',
          transformOrigin: 'top center',
        });

        timeline.to(
          cards,
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: 'blur(0px)',
            duration: 0.7,
            stagger: { amount: 0.6 },
          },
          '-=0.35'
        );
      }

      if (formElement) {
        gsap.set(formElement, {
          opacity: 0,
          y: 80,
          filter: 'blur(12px)',
          scale: 0.96,
        });

        timeline.to(
          formElement,
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
            duration: 0.65,
          },
          cards.length ? '-=0.2' : '-=0.1'
        );

        if (formFields.length) {
          gsap.set(formFields, { opacity: 0, y: 25 });
          timeline.to(
            formFields,
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.08,
            },
            '-=0.25'
          );
        }

        if (submitButton) {
          gsap.set(submitButton, { opacity: 0, scale: 0.9 });
          timeline.to(
            submitButton,
            {
              opacity: 1,
              scale: 1,
              duration: 0.35,
              ease: 'back.out(1.6)',
            },
            '-=0.15'
          );
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [showRoute]);

  useEffect(() => {
    if (objectivesRef.current) {
      const items = objectivesRef.current.querySelectorAll('.objective-item');
      
      items.forEach((item, index) => {
        gsap.fromTo(
          item,
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay: 0.1 + index * 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: objectivesRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }
  }, []);


  // GSAP для заголовка и интро
  useEffect(() => {
    if (!sectionRef.current || !titleRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current,
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      if (introRef.current) {
        const paragraphs = introRef.current.querySelectorAll('p');
        paragraphs.forEach((p, index) => {
          gsap.fromTo(p,
            {
              y: 30,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: 0.5 + index * 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }

      buttonsRef.current.forEach((button, index) => {
        if (button) {
          gsap.fromTo(button,
            {
              y: 30,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: 0.5 + index * 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t?.touristRoute?.title]);

  const routePoints: RoutePoint[] = [
    {
      name: t?.touristRoute?.gromova ?? 'Улица Громова',
      address: "ул. Громова, д. 20",
      image: "https://assets.novapbs.ru/streets/grom.jpeg",
      description: "Улица в микрорайоне Малиновка-6 названа в честь участника Великой Отечественной войны.",
      coordinates: { lat: 53.852276, lng: 27.443505 }
    },
    {
      name: streets.find(s => s.id === 'rafieva')?.nameRu || "Улица Рафиева",
      address: "ул. Рафиева, д. 3-1",
      image: "https://assets.novapbs.ru/images/e12666c7-67bb-7114-dd6c-c3b7c1dfe513.jpg",
      description: "Улица носит имя Раджабали Рафиева - героя Великой Отечественной войны.",
      coordinates: { lat: 53.863508, lng: 27.449461 }
    },
    {
      name: streets.find(s => s.id === 'zhukova')?.nameRu || "Проспект Жукова",
      address: "пр. Жукова",
      image: "https://assets.novapbs.ru/images/7dfd21g4-2b6f-3c47-6413-357cfg637645.jpg",
      description: "Проспект назван в честь маршала Георгия Жукова - выдающегося полководца.",
      coordinates: { lat: 53.879944, lng: 27.511355 }
    }
  ];

  const otherStreets: RoutePoint[] = streets
    .filter(s => s.id !== 'rafieva' && s.id !== 'zhukova')
    .map(street => ({
      name: street.nameRu,
      address: street.nameRu,
      image: street.streetVideo || "https://assets.novapbs.ru/placeholder.svg",
      description: street.historyRu ? street.historyRu.substring(0, 150) + '...' : undefined,
    }));

  const allRoutePoints = [...routePoints, ...otherStreets];

  return (
    <section ref={sectionRef} id="tourist-route" className="py-20 bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-56 h-56 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-16 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <h2 
          ref={titleRef}
          className="text-4xl md:text-5xl font-bold text-center mb-8 text-foreground cursor-default"
        >
          {t?.touristRoute?.title ?? 'Туристический маршрут'}
        </h2>

        <div ref={introRef} className="max-w-[90rem] mx-auto mb-12 space-y-6">
          <p className="text-xl text-foreground/80 leading-relaxed text-center">
            {(t?.touristRoute?.introduction ?? [])[0]}
          </p>
          <p className="text-xl text-foreground/80 leading-relaxed text-center">
            {(t?.touristRoute?.introduction ?? [])[1]}
          </p>
          <p className="text-xl text-foreground/80 leading-relaxed text-center">
            {(t?.touristRoute?.introduction ?? []).slice(2).join(' ')}
          </p>
        </div>

        <div className="max-w-[90rem] mx-auto mb-16" ref={objectivesRef}>
          <h3 className="text-3xl md:text-4xl font-bold mb-10 text-foreground text-center uppercase tracking-tight">
            {t?.touristRoute?.objectivesTitle ?? 'Цели'}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {(t?.touristRoute?.objectives ?? []).map((objective: string, i: number) => {
              return (
                <div
                  key={i}
                  className="objective-item group relative bg-gradient-to-br from-background via-primary/5 to-primary/10 rounded-lg p-6 border-2 border-primary/40 hover:border-primary transition-all duration-300 hover:shadow-xl hover:from-background hover:via-primary/10 hover:to-primary/15"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {i + 1}
                    </div>
                    <p className="text-foreground text-base leading-relaxed flex-1 pt-2">{objective}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <button
            ref={(el) => el && (buttonsRef.current[0] = el)}
            onClick={() => setShowRoute(prev => !prev)}
            className="group relative px-10 py-5 bg-gradient-to-br from-background via-primary/5 to-primary/10 border-2 border-primary/30 hover:border-primary/60 hover:bg-gradient-to-br hover:from-background hover:via-primary/8 hover:to-primary/12 text-foreground hover:text-foreground font-bold rounded-lg transition-all duration-300 flex items-center gap-3 hover:shadow-md"
            aria-expanded={showRoute}
          >
            <Route className="w-6 h-6 transition-colors duration-300" />
            <span className="text-xl uppercase tracking-wider transition-colors duration-300">{showRoute ? hideRouteLabel : showRouteLabel}</span>
            {showRoute ? <ChevronUp className="w-6 h-6 transition-colors duration-300" /> : <ChevronDown className="w-6 h-6 transition-colors duration-300" />}
          </button>
        </div>

        {showRoute && (
          <div className="max-w-7xl mx-auto mb-20">
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
                <MapPin className="w-10 h-10 text-primary" />
                {t?.touristRoute?.routeTitle ?? 'Маршрут'}
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
            </div>

            <div
              ref={routeListRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {allRoutePoints.map((point, index) => (
                <div
                  key={index}
                  ref={(el) => (routeCardsRef.current[index] = el)}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={(e) => handlePointClick(point, e)}
                  className={`group relative bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl overflow-hidden border-2 transition-all duration-500 cursor-pointer ${
                    hoveredCard === index
                      ? 'border-primary shadow-2xl shadow-primary/30 scale-105 -translate-y-2'
                      : 'border-border/50 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="absolute top-4 left-4 z-10 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>

                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={point.image}
                      alt={point.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                  </div>

                  <div className="p-6 relative">
                    <h4 className="font-bold text-foreground mb-2 text-xl group-hover:text-primary transition-colors duration-300">
                      {point.name}
                    </h4>
                    <div className="flex items-center gap-2 text-foreground/70 mb-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <p className="text-sm">{point.address}</p>
                    </div>
                    <div className="flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <MapPin className="w-4 h-4" />
                      <span>Нажмите, чтобы открыть карту</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Формf smtp */}
        {showRoute && (
          <div ref={formRef} className="max-w-2xl mx-auto mb-20">
            <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-border/50 shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
                  <Mail className="w-8 h-8 text-primary" />
                  {t.touristRoute.formTitle}
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-4" />
                <p className="text-foreground/70 text-lg">
                  {t.touristRoute.formDescription}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* фио */}
                <div className="space-y-2 form-field">
                  <Label htmlFor="fullName" className="text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    {t.touristRoute.formFullName}
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t.touristRoute.formFullNamePlaceholder}
                    className={`h-12 text-base ${errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    {...register('fullName')}
                    disabled={isSubmitting}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2 form-field">
                  <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {t.touristRoute.formEmail}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className={`h-12 text-base ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    {...register('email')}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* phone */}
                <div className="space-y-2 form-field">
                  <Label htmlFor="phone" className="text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    {t.touristRoute.formPhone}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+375 (XX) XXX-XX-XX"
                    className={`h-12 text-base ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    {...register('phone')}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* SEND */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="form-submit w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      {t.touristRoute.formSubmitting}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t.touristRoute.formSubmit}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* викторины */}
        <div className="flex justify-center mb-12">
          <button
            ref={(el) => el && (buttonsRef.current[1] = el)}
            onClick={() => setShowQuizzes(prev => !prev)}
            className="group relative px-10 py-5 bg-gradient-to-br from-background via-secondary/5 to-secondary/10 border-2 border-secondary/30 hover:border-secondary/60 hover:bg-gradient-to-br hover:from-background hover:via-secondary/8 hover:to-secondary/12 text-foreground hover:text-foreground font-bold rounded-lg transition-all duration-300 flex items-center gap-3 hover:shadow-md"
            aria-expanded={showQuizzes}
          >
            <Award className="w-6 h-6 transition-colors duration-300" />
            <span className="text-xl uppercase tracking-wider transition-colors duration-300">{quizButtonLabel}</span>
            {showQuizzes ? <ChevronUp className="w-6 h-6 transition-colors duration-300" /> : <ChevronDown className="w-6 h-6 transition-colors duration-300" />}
          </button>
        </div>

        {showQuizzes && (
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
                <Award className="w-10 h-10 text-secondary" />
                {t?.touristRoute?.quizzesTitle ?? 'Викторины'}
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent mx-auto" />
              <p className="text-foreground/70 text-lg mt-4">Проверьте свои знания о Минске!</p>
            </div>

            <div className="group bg-gradient-to-br from-card to-card/70 backdrop-blur-sm rounded-2xl p-8 border-2 border-border/50 hover:border-secondary/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-secondary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center text-secondary-foreground font-bold text-xl shadow-lg">
                  1
                </div>
                <h4 className="text-3xl font-bold text-foreground group-hover:text-secondary transition-colors duration-300">
                  {t?.touristRoute?.quiz1Title ?? 'Викторина 1'}
                </h4>
              </div>
              <div className="flex justify-center bg-muted/30 rounded-xl p-4">
                <iframe
                  style={{ maxWidth: '100%' }}
                  src="https://wordwall.net/ru/embed/6d3eb35c0d8648069be9d030deb6e84e?themeId=1&templateId=3&fontStackId=0"
                  width="500"
                  height="380"
                  frameBorder="0"
                  allowFullScreen
                  className="rounded-lg shadow-lg"
                  title="quiz-1"
                />
              </div>
            </div>

            <div className="group bg-gradient-to-br from-card to-card/70 backdrop-blur-sm rounded-2xl p-8 border-2 border-border/50 hover:border-secondary/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-secondary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center text-secondary-foreground font-bold text-xl shadow-lg">
                  2
                </div>
                <h4 className="text-3xl font-bold text-foreground group-hover:text-secondary transition-colors duration-300">
                  {t?.touristRoute?.quiz2Title ?? 'Викторина 2'}
                </h4>
              </div>
              <div className="flex justify-center bg-muted/30 rounded-xl p-4">
                <iframe
                  style={{ maxWidth: '100%' }}
                  src="https://wordwall.net/ru/embed/d3d0ffa410154d14ad840240ab21d1b6?themeId=1&templateId=5&fontStackId=0"
                  width="500"
                  height="380"
                  frameBorder="0"
                  allowFullScreen
                  className="rounded-lg shadow-lg"
                  title="quiz-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* модалка2 */}
      <RoutePointModal
        point={selectedPoint}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default TouristRouteSection;
