// гибкие настроечки
export const STREETS_CONFIG = {
  // разммеры карточек
  CARD_WIDTH: 200,
  CARD_HEIGHT: 300,
  GAP: 40,
  
  // animation settings
  NUMBER_SIZE: 50,
  EASE: 'sine.inOut' as const,
  
  // тайминги
  INDICATOR_DURATION: 2,
  INDICATOR_EXIT_DURATION: 0.8,
  AUTO_SCROLL_DELAY: 3000,
  
  // прогресс бар
  PROGRESS_WIDTH: 500,
  
  // задержки(беременность)
  START_DELAY: 0.6,
  CARD_DELAY_STEP: 0.05,
  
  // прочая хуйня
  DETAILS_OPACITY_DELAY: 0.4,
  DETAILS_TEXT_DELAY: 0.1,
  DETAILS_TITLE_DELAY: 0.15,
  DETAILS_DESC_DELAY: 0.3,
  DETAILS_CTA_DELAY: 0.35,
  
  // длительность анимации
  TEXT_DURATION: 0.7,
  DESC_DURATION: 0.4,
  CTA_DURATION: 0.4,
  CARD_OPACITY_DURATION: 0.3,
} as const;

