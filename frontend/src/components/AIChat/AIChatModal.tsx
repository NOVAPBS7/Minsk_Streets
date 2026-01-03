import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';
import { gsap } from 'gsap';
import { 
  initializeDeepSeek, 
  sendMessageToDeepSeek,
  ChatMessage as ChatMessageType,
  saveChatHistory,
  loadChatHistory,
  clearChatHistory
} from '@/lib/deepseek';
import ChatMessage from './ChatMessage';
import ChatLoader from './ChatLoader';
import { toast } from 'sonner';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatModal = ({ isOpen, onClose }: AIChatModalProps) => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // контекст
  const systemContext = language === 'ru' 
    ? `Ты AI помощник на сайте "Улицы Героев" - образовательном проекте о героических улицах Минска, названных в честь защитников Отечества в Великой Отечественной войне.

Основная информация о сайте:
- Сайт посвящен улицам Минска, названным в честь героев ВОВ
- Представлены все улицы Минска названные в честь героев ВОВ
- Содержит информацию о Великой Отечественной войне на территории Беларуси (1941-1944)
- Включает туристический маршрут по улицам Московского района
- Цель: сохранение памяти о героях войны и воспитание патриотизма

Ты должен:
1. Отвечать на вопросы о содержимом сайта, истории улиц и героев
2. Помогать с общими вопросами
3. Отвечать на ${language === 'ru' ? 'русском' : 'белорусском'} языке
4. Быть вежливым и информативным`
    : `Ты AI памочнік на сайце "Вуліцы Герояў" - адукацыйным праекце пра гераічныя вуліцы Мінска, названыя ў гонар абаронцаў Айчыны ў Вялікай Айчыннай вайне.

Асноўная інфармацыя пра сайт:
- Сайт прысвечаны вуліцам Мінска, названым у гонар герояў ВАВ
- Прадстаўлены вуліцы: Рафіева, Волаха, Глаголева, Жукава, Коржа, Купрыянава, Матросава, Окрестина, Смирнова і іншыя
- Змяшчае інфармацыю пра Вялікую Айчынную вайну на тэрыторыі Беларусі (1941-1944)
- Уключае турыстычны маршрут па вуліцах Маскоўскага раёна
- Мэта: захаванне памяці пра герояў вайны і выхаванне патрыятызму

Ты павінен:
1. Адказваць на пытанні пра змест сайта, гісторыю вуліц і герояў
2. Дапамагаць з агульнымі пытаннямі
3. Адказваць на ${language === 'be' ? 'беларускай' : 'рускай'} мове
4. Быць ветлівым і інфарматыўным`;

  // инициализция и зашгрзка истории
  useEffect(() => {
    try {
      initializeDeepSeek();
      setIsInitialized(true);
      
      const history = loadChatHistory();
      if (history.length === 0) {
        const welcomeMsg: ChatMessageType = {
          id: Date.now().toString(),
          role: 'assistant',
          content: t.aiChat.welcomeMessage,
          timestamp: Date.now()
        };
        setMessages([welcomeMsg]);
      } else {
        setMessages(history);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error(t.aiChat.errorNoApiKey);
    }
  }, [t.aiChat.welcomeMessage, t.aiChat.errorNoApiKey]);

  // история
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // GSAP
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0, rotateY: -15 },
        { 
          scale: 1, 
          opacity: 1, 
          rotateY: 0,
          duration: 0.5, 
          ease: 'power3.out' 
        }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const handleModalWheel = (e: React.WheelEvent) => {
    const target = e.currentTarget;
    const messagesContainer = target.querySelector('[data-messages-container]') as HTMLElement;
    
    if (messagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      
      if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        e.stopPropagation();
      }
    } else {
      e.stopPropagation();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isInitialized) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.filter(
        m => m.role !== 'assistant' || m.content !== t.aiChat.welcomeMessage
      );

      const response = await sendMessageToDeepSeek(
        userMessage.content,
        systemContext,
        conversationHistory
      );

      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error.message || t.aiChat.errorSending;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm(t.aiChat.clearConfirm)) {
      clearChatHistory();
      const welcomeMsg: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: t.aiChat.welcomeMessage,
        timestamp: Date.now()
      };
      setMessages([welcomeMsg]);
      toast.success('История чата очищена');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            data-testid="chat-backdrop"
          />

          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            onWheel={handleModalWheel}
          >
            <div
              ref={modalRef}
              className="pointer-events-auto w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden relative"
              style={{
                background: theme === 'dark' ? 'hsl(220, 15%, 12%)' : 'hsl(0, 0%, 100%)',
                borderColor: theme === 'dark' ? 'hsl(220, 15%, 20%)' : 'hsl(220, 20%, 90%)'
              }}
              data-testid="chat-modal"
              onWheel={handleModalWheel}
            >
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: theme === 'dark'
                    ? 'repeating-linear-gradient(0deg, transparent, transparent 35px, hsl(220, 15%, 18%) 35px, hsl(220, 15%, 18%) 36px), repeating-linear-gradient(90deg, transparent, transparent 35px, hsl(220, 15%, 18%) 35px, hsl(220, 15%, 18%) 36px)'
                    : 'repeating-linear-gradient(0deg, transparent, transparent 35px, hsl(220, 20%, 96%) 35px, hsl(220, 20%, 96%) 36px), repeating-linear-gradient(90deg, transparent, transparent 35px, hsl(220, 20%, 96%) 35px, hsl(220, 20%, 96%) 36px)'
                }}
              />
              
              {/* header */}
              <div 
                className="flex items-center justify-between px-6 py-4 border-b relative z-10"
                style={{
                  borderColor: theme === 'dark' ? 'hsl(220, 15%, 20%)' : 'hsl(220, 20%, 90%)',
                  background: theme === 'dark' 
                    ? 'linear-gradient(135deg, hsl(220, 18%, 18%) 0%, hsl(220, 20%, 22%) 100%)'
                    : 'linear-gradient(135deg, hsl(220, 30%, 97%) 0%, hsl(220, 35%, 99%) 100%)'
                }}
              >
                <div className="flex items-center gap-3">
                  <Sparkles 
                    size={24} 
                    style={{ color: theme === 'dark' ? 'hsl(220, 30%, 70%)' : 'hsl(220, 40%, 45%)' }}
                  />
                  <h2 
                    className="text-xl font-bold"
                    style={{ color: theme === 'dark' ? 'hsl(220, 20%, 85%)' : 'hsl(220, 40%, 25%)' }}
                  >
                    {t.aiChat.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    className="p-2 rounded-lg transition-colors"
                    style={{ 
                      color: theme === 'dark' ? 'hsl(220, 20%, 70%)' : 'hsl(220, 30%, 45%)',
                      ':hover': { background: theme === 'dark' ? 'hsl(220, 15%, 25%)' : 'hsl(220, 20%, 92%)' }
                    }}
                    data-testid="clear-chat-button"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg transition-colors"
                    style={{ 
                      color: theme === 'dark' ? 'hsl(220, 20%, 70%)' : 'hsl(220, 30%, 45%)'
                    }}
                    data-testid="close-chat-button"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* sms */}
              <div 
                className="flex-1 overflow-y-auto px-6 py-4 scrollbar-custom overscroll-contain"
                data-messages-container
                onWheel={handleWheel}
              >
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div ref={loaderRef}>
                    <ChatLoader />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* input */}
              <div 
                className="border-t px-6 py-4"
                style={{
                  borderColor: theme === 'dark' ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 90%)'
                }}
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.aiChat.placeholder}
                    disabled={!isInitialized || isLoading}
                    className="flex-1 px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    data-testid="chat-input"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading || !isInitialized}
                    className="px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      background: theme === 'dark' 
                        ? 'linear-gradient(135deg, hsl(220, 20%, 25%) 0%, hsl(220, 25%, 30%) 100%)'
                        : 'linear-gradient(135deg, hsl(220, 35%, 55%) 0%, hsl(220, 40%, 60%) 100%)',
                      color: 'white'
                    }}
                    data-testid="send-message-button"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIChatModal;
