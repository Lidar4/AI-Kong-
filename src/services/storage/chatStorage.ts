import { Conversation, UserSettings } from '../../types';

const CONVERSATIONS_KEY = 'ai_bondhu_conversations_v1';
const SETTINGS_KEY = 'ai_bondhu_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  language: 'bn',
  theme: 'dark',
  compactMode: false,
  animations: true,
  voiceLanguage: 'bn-BD',
  activeProvider: 'gemini',
  activeModel: 'gemini-3.8-flash',
  temperature: 0.7,
};

export function getStoredConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load conversations from storage:', e);
    return [];
  }
}

export function saveStoredConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to persist conversations to storage:', e);
  }
}

export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to persist settings:', e);
  }
}

export function exportConversationsAsJson(): void {
  const conversations = getStoredConversations();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `ai_bondhu_history_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importConversationsFromJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'ফাইলটিতে সঠিক ফরম্যাটে চ্যাট হিস্ট্রি পাওয়া যায়নি।' };
    }
    const current = getStoredConversations();
    const mergedMap = new Map<string, Conversation>();
    current.forEach((c) => mergedMap.set(c.id, c));
    parsed.forEach((c) => {
      if (c && c.id && c.title && Array.isArray(c.messages)) {
        mergedMap.set(c.id, c);
      }
    });
    const merged = Array.from(mergedMap.values()).sort((a, b) => b.updatedDate - a.updatedDate);
    saveStoredConversations(merged);
    return { success: true, count: parsed.length };
  } catch (e: any) {
    return { success: false, count: 0, error: e.message || 'JSON ফাইলটি পার্স করা যায়নি।' };
  }
}

export function getStoredConversationById(id: string): Conversation | undefined {
  const all = getStoredConversations();
  return all.find((c) => c.id === id);
}

export function createNewConversation(mode: any = 'chat'): Conversation {
  const newConv: Conversation = {
    id: Date.now().toString(),
    title: 'নতুন কথোপকথন',
    selectedMode: mode,
    messages: [],
    createdDate: Date.now(),
    updatedDate: Date.now(),
  };
  const current = getStoredConversations();
  saveStoredConversations([newConv, ...current]);
  return newConv;
}

export function updateConversationMessages(
  conversationId: string,
  messages: any[]
): void {
  const all = getStoredConversations();
  const updated = all.map((c) => {
    if (c.id === conversationId) {
      return {
        ...c,
        messages,
        updatedDate: Date.now(),
      };
    }
    return c;
  });
  saveStoredConversations(updated);
}

