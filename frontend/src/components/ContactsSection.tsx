import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Mail, Github, Clock, Users, Building2, ExternalLink } from 'lucide-react';
import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RoutePointModal, { RoutePoint } from './RoutePointModal';
import Card3D from './Card3D';
import './Card3D.css';

const ContactsBackground3D = lazy(() => import('./ContactsBackground3D'));

gsap.registerPlugin(ScrollTrigger);

const DiscordIcon = ({ className }: { className?: string }) => (
<svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/> </svg>
);

const ContactsSection = () => {
  const { t } = useLanguage();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedGymInfo, setSelectedGymInfo] = useState<RoutePoint | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contactCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const contacts = [
    {
      icon: Mail,
      label: t.contacts.email,
      value: 'contact@novapbs.ru',
      href: 'mailto:contact@novapbs.ru',
    },
    {
      icon: DiscordIcon,
      label: 'Discord',
      value: 'NOVAPBS',
      href: 'https://discord.gg/Yaegups6',
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'NOVAPBS7',
      href: 'https://github.com/NOVAPBS7',
    },
  ];

  const additionalInfo = [
    { icon: Clock, label: '-', value: '-' },
    { icon: Users, label: '-', value: '-' },
    { icon: Building2, label: '-', value: '-' },
  ];

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );

      contactCardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay: 0.1 + index * 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [t.contacts]);

  const gymnasiumInfo: RoutePoint = {
    name: t.contacts.null,
    address: 'null',
    image: 'null',
    additionalInfo: additionalInfo.map(info => ({
      icon: info.icon,
      label: info.label,
      value: info.value,
    })),
  };

  return (
    <section
      ref={sectionRef}
      id="contacts"
      className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-background/70 to-background"
    >
      <Suspense fallback={null}>
        <ContactsBackground3D />
      </Suspense>

      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute -top-20 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground cursor-default"
          >
            {t.contacts.title}
          </h2>
          <div className="w-24 h-1.5 bg-foreground rounded-full mx-auto" />
        </div>

        <div className="max-w-7xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contacts.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <Card3D
                  key={index}
                  index={index}
                  isHovered={hoveredCard === index}
                  onHoverChange={(h) => setHoveredCard(h ? index : null)}
                >
                  <div
                    ref={(el) => (contactCardsRef.current[index] = el)}
                    className="group relative rounded-2xl border transition-all duration-500 overflow-hidden cursor-pointer backdrop-blur-xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10"
                  >
                    <a
                      href={contact.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-10"
                    />
                    <div className="relative p-8 pb-6 z-0 pointer-events-none">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative p-4 rounded-xl bg-primary/10 border border-primary/20">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-bold text-lg">{contact.label}</h3>
                          <p className="text-sm opacity-70 break-words">{contact.value}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5 text-primary text-xs font-medium opacity-0 group-hover:opacity-100">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Открыть</span>
                    </div>
                  </div>
                </Card3D>
              );
            })}
          </div>
        </div>
      </div>

      <RoutePointModal
        point={selectedGymInfo}
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setTimeout(() => setSelectedGymInfo(null), 300);
        }}
      />
    </section>
  );
};

export default ContactsSection;
