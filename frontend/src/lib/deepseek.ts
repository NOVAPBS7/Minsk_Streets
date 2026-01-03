const API_URL = import.meta.env.VITE_API_URL || '';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const initializeDeepSeek = () => {
  return true;
};

export const sendMessageToDeepSeek = async (
  message: string,
  systemContext: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/deepseek/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        systemContext,
        conversationHistory: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending message to DeepSeek API:', error);
    throw error;
  }
};

export const saveChatHistory = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem('ai-chat-history', JSON.stringify(messages));
  } catch (error) {
    console.error('РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ РёСЃС‚РѕСЂРёРё С‡Р°С‚Р°:', error);
  }
};

export const loadChatHistory = (): ChatMessage[] => {
  try {
    const history = localStorage.getItem('ai-chat-history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РёСЃС‚РѕСЂРёРё С‡Р°С‚Р°:', error);
    return [];
  }
};

export const clearChatHistory = () => {
  try {
    localStorage.removeItem('ai-chat-history');
  } catch (error) {
    console.error('РћС€РёР±РєР° РѕС‡РёСЃС‚РєРё РёСЃС‚РѕСЂРёРё С‡Р°С‚Р°:', error);
  }
};