import React from 'react';
import {
  Sparkles,
  Code2,
  Globe,
  Bug,
  BookOpen,
  PenTool,
  GraduationCap,
  LineChart,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { AIModeId, Conversation, SystemHealth } from '../types';
import { AI_MODES } from '../data/modes';

interface HomeViewProps {
  onSelectMode: (modeId: AIModeId) => void;
  onSelectPrompt?: (prompt: string, modeId: AIModeId) => void;
  onStartNewChat?: () => void;
  recentConversations?: Conversation[];
  conversations?: Conversation[];
  onOpenConversation: (id: string) => void;
  systemHealth?: SystemHealth;
  onOpenSettings?: () => void;
}

const DEFAULT_HEALTH: SystemHealth = {
  status: 'ready',
  geminiConfigured: false,
  provider: 'Gemini',
  model: 'gemini-3.8-flash',
};

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectMode,
  onSelectPrompt,
  onStartNewChat,
  recentConversations,
  conversations,
  onOpenConversation,
  systemHealth = DEFAULT_HEALTH,
  onOpenSettings = () => {},
}) => {
  const activeConversations = recentConversations || conversations || [];
  const safeHealth = systemHealth || DEFAULT_HEALTH;

  const handlePromptClick = (prompt: string, mode: AIModeId) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt, mode);
    } else if (onSelectMode) {
      onSelectMode(mode);
    }
  };

  const quickActions = [
    { label: 'নতুন Chat', mode: 'ai-chat' as AIModeId, icon: MessageSquare, prompt: 'হ্যালো! আমার কী কী কাজে সাহায্য করতে পারো?' },
    { label: 'Code লিখুন', mode: 'code-master' as AIModeId, icon: Code2, prompt: 'একটা আধুনিক JavaScript ফাংশন লিখে দাও' },
    { label: 'Website বানান', mode: 'web-pro' as AIModeId, icon: Globe, prompt: 'একটা রেসপনসিভ HTML/CSS ল্যান্ডিং পেজ বানাও' },
    { label: 'Debug করুন', mode: 'debug-detective' as AIModeId, icon: Bug, prompt: 'এই কোডের ভুল চিহ্নিত করো' },
    { label: 'Research করুন', mode: 'research-guide' as AIModeId, icon: BookOpen, prompt: 'একটি গবেষণার জন্য রিসার্চ প্রশ্ন তৈরি করো' },
    { label: 'লিখতে সাহায্য নিন', mode: 'writing-friend' as AIModeId, icon: PenTool, prompt: 'একটি প্রফেশনাল ইমেইল ড্রাফট করো' },
    { label: 'পড়াশোনা করুন', mode: 'study-coach' as AIModeId, icon: GraduationCap, prompt: 'আমাকে সহজ ভাষায় এই বিষয়টি বুঝিয়ে দাও' },
    { label: 'Data বিশ্লেষণ করুন', mode: 'data-sage' as AIModeId, icon: LineChart, prompt: 'এই ডেটাসেট বিশ্লেষণ করে সামারি বের করো' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-fadeIn text-left">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#111c35] to-[#090d16] border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>সর্বকাজ AI বন্ধু • ব্যক্তিগত এআই ওয়ার্কস্পেস</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            “আমি আছি—কাজটা বলুন।”
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            তোমার কাজের জন্য এক জায়গায় AI সহকারী — কোডিং, গবেষণা, লেখালেখি, পড়াশোনা, প্ল্যানিং, ওয়েব ওয়ার্ক, ডিবাগিং ও দৈনন্দিন সমাধান।
          </p>

          {/* Quick Prompt Input Action */}
          <div className="pt-2 flex flex-wrap gap-2">
            {quickActions.slice(0, 4).map((action, i) => (
              <button
                key={i}
                onClick={() => onSelectPrompt(action.prompt, action.mode)}
                className="flex items-center gap-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/60 px-3.5 py-2 text-xs font-medium text-slate-200 transition active:scale-95 shadow-sm"
              >
                <action.icon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subtle Ambient Graphic */}
        <div className="absolute right-4 bottom-2 opacity-10 sm:opacity-20 pointer-events-none">
          <Cpu className="w-48 h-48 text-emerald-400" />
        </div>
      </div>

      {/* System Status Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Status Card 1 */}
        <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-4 flex items-center gap-3.5 shadow-sm">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              safeHealth.geminiConfigured
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            {safeHealth.geminiConfigured ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-xs text-slate-400">AI স্ট্যাটাস</div>
            <div className="text-sm font-semibold text-white">
              {safeHealth.geminiConfigured ? 'Ready (প্রস্তুত)' : 'AI API সংযুক্ত করা হয়নি'}
            </div>
          </div>
        </div>

        {/* Status Card 2 */}
        <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">প্রোভাইডার</div>
            <div className="text-sm font-semibold text-white">{safeHealth.provider || 'Gemini'}</div>
          </div>
        </div>

        {/* Status Card 3 */}
        <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-400">সক্রিয় মডেল</div>
            <div className="text-sm font-semibold text-white font-mono">{safeHealth.model || safeHealth.activeModel || 'gemini-3.8-flash'}</div>
          </div>
          <button
            onClick={onOpenSettings}
            className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            পরিবর্তন
          </button>
        </div>
      </div>

      {/* Warning Banner if API key not configured */}
      {!safeHealth.geminiConfigured && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-amber-950/40 border border-amber-800/80 p-4 text-amber-200 shadow-md">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <div className="text-sm font-bold">AI API সংযুক্ত করা হয়নি</div>
              <div className="text-xs text-amber-300/80">
                AI মডেল দিয়ে রিয়েল-টাইম সমাধান পেতে আপনার Gemini API কী সেটিংসে দিন অথবা সার্ভারে সেট করুন।
              </div>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="shrink-0 rounded-xl bg-amber-500 text-slate-950 px-3.5 py-1.5 text-xs font-bold hover:bg-amber-400 transition"
          >
            কী যুক্ত করুন
          </button>
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            দ্রুত কাজ শুরু করুন
          </h2>
          <button
            onClick={() => onSelectMode('ai-tools')}
            className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1"
          >
            সব মোড দেখুন <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(action.prompt, action.mode)}
              className="flex flex-col items-start justify-between rounded-2xl bg-[#0f172a] hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 p-4 text-left transition group active:scale-[0.98] shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition mb-3">
                <action.icon className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300">
                {action.label}
              </div>
              <div className="text-[11px] text-slate-400 truncate w-full mt-1">
                {action.prompt}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Modes Showcase */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-white">জনপ্রিয় এআই মোডসমূহ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {AI_MODES.slice(3, 9).map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="flex flex-col justify-between rounded-2xl bg-[#0f172a] hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 p-4 text-left transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white group-hover:text-emerald-300">
                    {mode.banglaName}
                  </span>
                  {mode.badge && (
                    <span className="rounded bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      {mode.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {mode.description}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                ওয়ার্কস্পেস খুলুন <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Conversations */}
      {activeConversations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white">সাম্প্রতিক কথোপকথন</h2>
            <button
              onClick={() => onSelectMode('history')}
              className="text-xs font-medium text-emerald-400 hover:underline"
            >
              সবগুলো দেখুন
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 rounded-2xl bg-[#0f172a] border border-slate-800 overflow-hidden">
            {activeConversations.slice(0, 4).map((chat) => (
              <div
                key={chat.id}
                onClick={() => onOpenConversation(chat.id)}
                className="flex items-center justify-between p-3.5 hover:bg-slate-800/60 cursor-pointer transition text-left"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs sm:text-sm font-semibold text-white truncate">
                      {chat.title || 'নামহীন চ্যাট'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {(chat.messages?.length || 0)}টি বার্তা • {new Date(chat.updatedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
