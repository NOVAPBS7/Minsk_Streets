import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import GlassSurface from '../GlassSurface';

interface AIChatButtonProps {
  onClick: () => void;
}

const AIChatButton = ({ onClick }: AIChatButtonProps) => {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-6 right-6 z-50"
      data-testid="ai-chat-button"
    >
      <GlassSurface
        width={56}
        height={56}
        borderRadius={28}
        borderWidth={0.05}
        brightness={50}
        opacity={0.9}
        blur={12}
        displace={2}
        backgroundOpacity={0}
        saturation={1.2}
        distortionScale={-150}
        redOffset={5}
        greenOffset={15}
        blueOffset={25}
        mixBlendMode="difference"
        className="cursor-pointer shadow-lg border border-white/20 dark:border-white/15"
        contentClassName="glass-surface__content--no-padding"
      >
        <button
          onClick={onClick}
          className="w-full h-full flex items-center justify-center rounded-full"
        >
          <MessageCircle 
            className="w-6 h-6 relative z-10 [text-shadow:_0_1px_4px_rgba(0,0,0,0.4),_0_0_8px_rgba(0,0,0,0.2)] dark:[text-shadow:_0_1px_4px_rgba(255,255,255,0.3),_0_0_8px_rgba(255,255,255,0.15)]" 
            style={{ color: theme === 'dark' ? 'hsl(220, 30%, 75%)' : 'hsl(220, 40%, 45%)' }}
          />
        </button>
      </GlassSurface>
    </motion.div>
  );
};

export default AIChatButton;
