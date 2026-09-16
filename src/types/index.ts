export type AIModeId =
  | 'home'
  | 'chat'
  | 'ai-chat'
  | 'tools'
  | 'ai-tools'
  | 'code-master'
  | 'web-pro'
  | 'python-lab'
  | 'debug-detective'
  | 'app-builder'
  | 'data-sage'
  | 'design-mate'
  | 'study-coach'
  | 'writing-friend'
  | 'research-guide'
  | 'life-planner'
  | 'language-buddy'
  | 'history'
  | 'settings';

export type FileAttachmentData = Attachment;

export interface AIModeConfig {

  id: AIModeId;
  name: string;
  banglaName: string;
  category: 'core' | 'coding' | 'web' | 'creation' | 'learning' | 'productivity';
  description: string;
  iconName: string;
  badge?: string;
  quickPrompts: string[];
  placeholderText: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
  data?: string; // base64
  text?: string; // extracted text for txt/csv/json
  status: 'ready' | 'processing' | 'error';
}

export interface CodeChangeRecord {
  filePath: string;
  explanation: string;
  timestamp: number;
}

export interface ExecutedPluginRecord {
  name: string;
  title: string;
  icon?: string;
  summary: string;
  details?: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mode?: AIModeId;
  attachments?: Attachment[];
  model?: string;
  isError?: boolean;
  codeChanges?: CodeChangeRecord[];
  executedPlugins?: ExecutedPluginRecord[];
}

export interface Conversation {
  id: string;
  title: string;
  createdDate: number;
  updatedDate: number;
  messages: ChatMessage[];
  selectedMode: AIModeId;
}

export interface AIModelOption {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'anthropic';
  description?: string;
}

export interface ProviderConfig {
  id: 'gemini' | 'openai' | 'anthropic';
  name: string;
  status: 'connected' | 'not_configured' | 'error';
  selectedModel: string;
  models: AIModelOption[];
  hasServerKey?: boolean;
  userApiKey?: string;
}

export interface UserSettings {
  language: 'bn' | 'en';
  theme: 'dark' | 'light';
  compactMode: boolean;
  animations: boolean;
  voiceLanguage: 'bn-BD' | 'en-US';
  activeProvider: 'gemini' | 'openai' | 'anthropic';
  activeModel: string;
  temperature: number;
  customGeminiKey?: string;
  customOpenAIKey?: string;
  customAnthropicKey?: string;
}

export interface SystemHealth {
  status: 'ready' | 'error' | 'loading' | 'ok';
  geminiConfigured: boolean;
  provider?: string;
  model?: string;
  activeModel?: string;
  message?: string;
  timestamp?: number;
}

