import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, MessageCircle, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GlassSurface from './GlassSurface';

gsap.registerPlugin(ScrollTrigger);

interface NavigationProps {
  onAIChatOpen?: () => void;
}

const Navigation = ({ onAIChatOpen }: NavigationProps) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // не работает!!!! ПЕРЕДЕЛАТЬ!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      const sections = ['hero', 'wwii-section', 'streets', 'memory', 'tourist-route', 'contacts'];
      const scrollPosition = window.scrollY + 150;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && scrollPosition >= section.offsetTop) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP nav
  useEffect(() => {
    if (!navRef.current || !logoRef.current) return;

    const ctx = gsap.context(() => {
      // logo animation
      gsap.fromTo(logoRef.current,
        { opacity: 0, x: -20, scale: 0.9 },
        { 
          opacity: 1, 
          x: 0, 
          scale: 1,
          duration: 0.8, 
          ease: 'back.out(1.7)'
        }
      );

      navItemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.fromTo(item,
            { opacity: 0, y: -15, scale: 0.95 },
            { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              duration: 0.6, 
              delay: 0.3 + index * 0.05,
              ease: 'power3.out'
            }
          );
        }
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setActiveSection(id);
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: 'hero', label: t.nav.home },
    { id: 'wwii-section', label: t.nav.wwii },
    { id: 'streets', label: t.nav.streets },
    { id: 'memory', label: t.nav.memory },
    { id: 'tourist-route', label: t.nav.route },
    { id: 'contacts', label: t.nav.contacts },
  ];

  return (
    <>
      <motion.nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-[110] transition-all duration-500"
      >
        <GlassSurface
          width="100%"
          height={isScrolled ? 80 : 96}
          borderRadius={0}
          borderWidth={0.05}
          brightness={isScrolled ? 60 : 50}
          opacity={isScrolled ? 0.95 : 0.9}
          blur={12}
          displace={isScrolled ? 2 : 0}
          backgroundOpacity={0}
          saturation={1.2}
          distortionScale={-150}
          redOffset={5}
          greenOffset={15}
          blueOffset={25}
          mixBlendMode="difference"
          className="border-b border-border/30"
          contentClassName="glass-surface__content--no-padding"
          style={{
            borderBottomWidth: isScrolled ? '1px' : '0.5px',
          }}
        >
          <div className="container mx-auto px-4 lg:px-8 w-full h-full">
            <div className="flex items-center justify-between h-full">
            {/* logo / brand */}
            <motion.div
              ref={logoRef}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer px-4 py-2 rounded-xl bg-white/30 dark:bg-white/20 hover:bg-white/40 dark:hover:bg-white/25 border border-white/20 dark:border-white/15 backdrop-blur-sm transition-all duration-300"
            >
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground/80 via-foreground/70 to-foreground/80 bg-clip-text text-transparent relative z-10 [text-shadow:_0_2px_8px_rgba(0,0,0,0.3),_0_1px_3px_rgba(0,0,0,0.5)] dark:[text-shadow:_0_2px_8px_rgba(255,255,255,0.2),_0_1px_3px_rgba(255,255,255,0.3)]">
                Улицы Героев
              </div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
            </motion.div>

            {/* desktop nav */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item, index) => {
                const isActive = activeSection === item.id;
                return (
                  <motion.button
                    key={item.id}
                    ref={(el) => (navItemsRef.current[index] = el)}
                    onClick={() => scrollToSection(item.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    className={`relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 group backdrop-blur-sm ${
                      isActive
                        ? 'text-primary bg-white/40 dark:bg-white/25 border border-white/30 dark:border-white/20'
                        : 'text-foreground/90 hover:text-foreground bg-white/30 dark:bg-white/20 hover:bg-white/40 dark:hover:bg-white/25 border border-white/20 dark:border-white/15'
                    }`}
                  >
                    <span className="relative z-10 [text-shadow:_0_1px_4px_rgba(0,0,0,0.4),_0_0_8px_rgba(0,0,0,0.2)] dark:[text-shadow:_0_1px_4px_rgba(255,255,255,0.3),_0_0_8px_rgba(255,255,255,0.15)]">
                      {item.label}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeSection"
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/15 to-secondary/10 rounded-xl border border-primary/20"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    {/* hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                    
                    <motion.span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: isActive ? '80%' : 0,
                        opacity: isActive ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                );
              })}
              
              {/* AI btn */}
              <motion.button
                onClick={onAIChatOpen}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-4 py-2.5 rounded-xl font-medium text-sm text-foreground/90 hover:text-foreground transition-all duration-300 group flex items-center gap-2 ml-2 bg-white/30 dark:bg-white/20 hover:bg-white/40 dark:hover:bg-white/25 border border-white/20 dark:border-white/15 backdrop-blur-sm"
                data-testid="nav-ai-chat-button"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Sparkles size={16} className="text-primary" />
                </motion.div>
                <span className="[text-shadow:_0_1px_4px_rgba(0,0,0,0.4),_0_0_8px_rgba(0,0,0,0.2)] dark:[text-shadow:_0_1px_4px_rgba(255,255,255,0.3),_0_0_8px_rgba(255,255,255,0.15)]">
                  {t.nav.aiChat}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
              </motion.button>
            </div>

            {/* Language Switcher & Theme Toggle */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden lg:flex gap-2 items-center"
            >
              <motion.button
                onClick={() => setLanguage('ru')}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className={`relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 group backdrop-blur-sm ${
                  language === 'ru'
                    ? 'text-primary bg-white/40 dark:bg-white/25 border border-white/30 dark:border-white/20'
                    : 'text-foreground/90 hover:text-foreground bg-white/30 dark:bg-white/20 hover:bg-white/40 dark:hover:bg-white/25 border border-white/20 dark:border-white/15'
                }`}
              >
                <span className="relative z-10 [text-shadow:_0_1px_4px_rgba(0,0,0,0.4),_0_0_8px_rgba(0,0,0,0.2)] dark:[text-shadow:_0_1px_4px_rgba(255,255,255,0.3),_0_0_8px_rgba(255,255,255,0.15)]">
                  RU
                </span>
                {language === 'ru' && (
                  <motion.div
                    layoutId="activeLang"
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/15 to-secondary/10 rounded-xl border border-primary/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.button>
              <motion.button
                onClick={() => setLanguage('be')}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className={`relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 group backdrop-blur-sm ${
                  language === 'be'
                    ? 'text-primary bg-white/40 dark:bg-white/25 border border-white/30 dark:border-white/20'
                    : 'text-foreground/90 hover:text-foreground bg-white/30 dark:bg-white/20 hover:bg-white/40 dark:hover:bg-white/25 border border-white/20 dark:border-white/15'
                }`}
              >
                <span className="relative z-10 [text-shadow:_0_1px_4px_rgba(0,0,0,0.4),_0_0_8px_rgba(0,0,0,0.2)] dark:[text-shadow:_0_1px_4px_rgba(255,255,255,0.3),_0_0_8px_rgba(255,255,255,0.15)]">
                  BY
                </span>
                {language === 'be' && (
                  <motion.div
                    layoutId="activeLang"
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/15 to-secondary/10 rounded-xl border border-primary/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.button>
              
              <motion.button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2.5 rounded-xl bg-gradient-to-br from-muted to-muted/50 hover:from-primary/10 hover:to-secondary/10 border border-border/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <motion.div
                  animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  {theme === 'dark' ? (
                    <Sun size={20} className="text-yellow-500" />
                  ) : (
                    <Moon size={20} className="text-blue-600 rotate-180" />
                  )}
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 blur-sm"
                  initial={false}
                />
              </motion.button>
            </motion.div>

            {/* Mobile Menu tggl */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="lg:hidden relative p-2.5 rounded-xl bg-muted/50 hover:bg-primary/10 border border-border/50 transition-all duration-300"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
        </GlassSurface>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[105] bg-black/50 backdrop-blur-sm lg:hidden"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-[109] lg:hidden overflow-hidden"
            >
              <GlassSurface
                width="100%"
                height="100%"
                borderRadius={0}
                borderWidth={0.05}
                brightness={50}
                opacity={0.95}
                blur={15}
                displace={3}
                backgroundOpacity={0}
                saturation={1.3}
                distortionScale={-180}
                redOffset={5}
                greenOffset={15}
                blueOffset={25}
                mixBlendMode="difference"
                className="border-l border-border/40 h-full"
                contentClassName="glass-surface__content--no-padding overflow-y-auto"
                style={{ borderRadius: '0' }}
              >
              <div className="pt-24 pb-8 px-6 flex flex-col gap-4 h-full">
                {/* Mobile nav itemds */}
                {navItems.map((item, index) => {
                  const isActive = activeSection === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative text-left text-xl font-semibold py-4 px-4 rounded-xl transition-all duration-300 backdrop-blur-sm ${
                        isActive
                          ? 'text-primary bg-white/40 dark:bg-white/25 border border-white/30 dark:border-white/20 shadow-lg'
                          : 'text-foreground/90 hover:text-foreground bg-white/30 dark:bg-white/20 hover:bg-white/40 dark:hover:bg-white/25 border border-white/20 dark:border-white/15'
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-3 [text-shadow:_0_2px_6px_rgba(0,0,0,0.5),_0_1px_4px_rgba(0,0,0,0.3)] dark:[text-shadow:_0_2px_6px_rgba(255,255,255,0.4),_0_1px_4px_rgba(255,255,255,0.2)]">
                        {isActive && (
                          <motion.div
                            layoutId="mobileActive"
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl"
                          initial={false}
                        />
                      )}
                    </motion.button>
                  );
                })}
                
                {/* AI bttn mobiel */}
                <motion.button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onAIChatOpen?.();
                  }}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navItems.length * 0.05 }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative text-left text-xl font-semibold py-4 px-4 rounded-xl bg-white/30 dark:bg-white/20 hover:bg-white/40 dark:hover:bg-white/25 border border-white/20 dark:border-white/15 transition-all duration-300 flex items-center gap-3 group backdrop-blur-sm"
                  data-testid="mobile-ai-chat-button"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles size={20} className="text-primary" />
                  </motion.div>
                  <span className="[text-shadow:_0_2px_6px_rgba(0,0,0,0.5),_0_1px_4px_rgba(0,0,0,0.3)] dark:[text-shadow:_0_2px_6px_rgba(255,255,255,0.4),_0_1px_4px_rgba(255,255,255,0.2)]">
                    {t.nav.aiChat}
                  </span>
                </motion.button>
                
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3 }}
                  className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4"
                />
                
                {/* lng swtchr mobile */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="flex gap-2"
                >
                  <motion.button
                    onClick={() => setLanguage('ru')}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex-1 text-left text-xl font-semibold py-4 px-4 rounded-xl transition-all duration-300 backdrop-blur-sm ${
                      language === 'ru'
                        ? 'text-primary bg-white/40 dark:bg-white/25 border border-white/30 dark:border-white/20 shadow-lg'
                        : 'text-foreground/90 hover:text-foreground bg-white/30 dark:bg-white/20 hover:bg-white/40 dark:hover:bg-white/25 border border-white/20 dark:border-white/15'
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-3 [text-shadow:_0_2px_6px_rgba(0,0,0,0.5),_0_1px_4px_rgba(0,0,0,0.3)] dark:[text-shadow:_0_2px_6px_rgba(255,255,255,0.4),_0_1px_4px_rgba(255,255,255,0.2)]">
                      {language === 'ru' && (
                        <motion.div
                          layoutId="mobileActiveLang"
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      RU
                    </span>
                    {language === 'ru' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl"
                        initial={false}
                      />
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => setLanguage('be')}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex-1 text-left text-xl font-semibold py-4 px-4 rounded-xl transition-all duration-300 backdrop-blur-sm ${
                      language === 'be'
                        ? 'text-primary bg-white/40 dark:bg-white/25 border border-white/30 dark:border-white/20 shadow-lg'
                        : 'text-foreground/90 hover:text-foreground bg-white/30 dark:bg-white/20 hover:bg-white/40 dark:hover:bg-white/25 border border-white/20 dark:border-white/15'
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-3 [text-shadow:_0_2px_6px_rgba(0,0,0,0.5),_0_1px_4px_rgba(0,0,0,0.3)] dark:[text-shadow:_0_2px_6px_rgba(255,255,255,0.4),_0_1px_4px_rgba(255,255,255,0.2)]">
                      {language === 'be' && (
                        <motion.div
                          layoutId="mobileActiveLang"
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      BY
                    </span>
                    {language === 'be' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl"
                        initial={false}
                      />
                    )}
                  </motion.button>
                </motion.div>
                
                {/* тема */}
                <motion.button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 px-6 py-4 rounded-xl bg-gradient-to-r from-muted to-muted/50 hover:from-primary/10 hover:to-secondary/10 border border-border/50 hover:border-primary/30 transition-all flex items-center justify-center gap-3 font-semibold"
                >
                  <motion.div
                    animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    {theme === 'dark' ? (
                      <Sun size={20} className="text-yellow-500" />
                    ) : (
                      <Moon size={20} className="text-blue-600 rotate-180" />
                    )}
                  </motion.div>
                  <span className="[text-shadow:_0_2px_6px_rgba(0,0,0,0.5),_0_1px_4px_rgba(0,0,0,0.3)] dark:[text-shadow:_0_2px_6px_rgba(255,255,255,0.4),_0_1px_4px_rgba(255,255,255,0.2)]">
                    {theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
                  </span>
                </motion.button>
              </div>
              </GlassSurface>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
