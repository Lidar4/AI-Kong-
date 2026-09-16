import { ChatMessage, Attachment, SystemHealth, CodeChangeRecord, ExecutedPluginRecord } from '../../types';
import { getStoredSettings } from '../storage/chatStorage';

export interface SendMessageOptions {
  messages: ChatMessage[];
  mode: string;
  model?: string;
  apiKey?: string;
  attachments?: Attachment[];
  enableSelfCode?: boolean;
  onThinking?: () => void;
}

export interface SendMessageResult {
  text: string;
  model: string;
  provider: string;
  mode: string;
  codeChanges?: CodeChangeRecord[];
  executedPlugins?: ExecutedPluginRecord[];
}

export async function checkSystemHealth(): Promise<SystemHealth> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      return {
        status: 'error',
        geminiConfigured: false,
        provider: 'Gemini',
        model: 'gemini-3.8-flash',
        message: 'সার্ভার পাওয়া যায়নি বা অফলাইন রয়েছে।',
      };
    }
    const data = await res.json();
    return {
      status: data.geminiConfigured ? 'ready' : 'error',
      geminiConfigured: !!data.geminiConfigured,
      provider: data.provider || 'Gemini',
      model: data.model || 'gemini-3.8-flash',
      message: data.geminiConfigured ? 'AI প্রস্তুত' : 'AI API সংযুক্ত করা হয়নি',
    };
  } catch (err: any) {
    return {
      status: 'error',
      geminiConfigured: false,
      provider: 'Gemini',
      model: 'gemini-3.8-flash',
      message: 'সার্ভারের সাথে নেটওয়ার্ক সংযোগ নেই।',
    };
  }
}

export async function testApiKey(apiKey: string, provider = 'gemini', model = 'gemini-3.8-flash') {
  const res = await fetch('/api/test-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, provider, model }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API পরীক্ষা ব্যর্থ হয়েছে।');
  }
  return data;
}

export async function sendChatMessage(options: SendMessageOptions): Promise<SendMessageResult> {
  const settings = getStoredSettings();

  const formattedMessages = (options.messages || []).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const payload = {
    messages: formattedMessages,
    mode: options.mode,
    model: options.model || settings.activeModel || 'gemini-3.6-flash',
    customApiKey: options.apiKey || settings.customGeminiKey || undefined,
    temperature: settings.temperature,
    enableSelfCode: options.enableSelfCode !== false,
    attachments: (options.attachments || []).map((a) => ({
      name: a.name,
      mimeType: a.mimeType,
      data: a.data,
      text: a.text,
    })),
  };

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.code === 'API_KEY_MISSING') {
      throw new Error(data.error || 'AI API সংযুক্ত করা হয়নি');
    }
    throw new Error(data.error || 'AI সার্ভার থেকে কোনো উত্তর পাওয়া যায়নি।');
  }

  return {
    text: data.text,
    model: data.model,
    provider: data.provider,
    mode: data.mode,
    codeChanges: data.codeChanges || [],
    executedPlugins: data.executedPlugins || [],
  };
}

export async function getWorkspaceFiles(): Promise<Array<{ path: string; size: number; modified: number }>> {
  const res = await fetch('/api/workspace/files');
  if (!res.ok) throw new Error('ফাইল তালিকা লোড করা যায়নি');
  const data = await res.json();
  return data.files || [];
}

export async function getWorkspaceFileContent(path: string): Promise<string> {
  const res = await fetch(`/api/workspace/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error('ফাইলের কনটেন্ট লোড করা যায়নি');
  const data = await res.json();
  return data.content || '';
}

export async function saveWorkspaceFile(path: string, content: string, explanation?: string): Promise<any> {
  const res = await fetch('/api/workspace/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content, explanation }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'ফাইল সেভ করা সম্ভব হয়নি');
  }
  return await res.json();
}

export async function getWorkspaceHistory(): Promise<Array<{ filePath: string; explanation: string; timestamp: number }>> {
  const res = await fetch('/api/workspace/history');
  if (!res.ok) return [];
  const data = await res.json();
  return data.history || [];
}
