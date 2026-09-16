import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  ShieldCheck,
  Cpu,
  Mic,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';
import { UserSettings, SystemHealth } from '../types';
import { getStoredSettings, saveStoredSettings } from '../services/storage/chatStorage';
import { testApiKey, checkSystemHealth } from '../services/ai/aiService';

interface SettingsViewProps {
  systemHealth?: SystemHealth;
  onRefreshHealth: () => void;
}

const DEFAULT_HEALTH: SystemHealth = {
  status: 'ready',
  geminiConfigured: false,
  provider: 'Gemini',
  model: 'gemini-3.8-flash',
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  systemHealth = DEFAULT_HEALTH,
  onRefreshHealth,
}) => {
  const safeHealth = systemHealth || DEFAULT_HEALTH;
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings());
  const [geminiKeyInput, setGeminiKeyInput] = useState(settings.customGeminiKey || '');
  const [showKey, setShowKey] = useState(false);

  // Testing status
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = () => {
    const updated: UserSettings = {
      ...settings,
      customGeminiKey: geminiKeyInput.trim() || undefined,
    };
    setSettings(updated);
    saveStoredSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    onRefreshHealth();
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const keyToTest = geminiKeyInput.trim();
      const res = await testApiKey(keyToTest, 'gemini', settings.activeModel);
      setTestResult({ success: true, message: res.message || 'API সংযোগ সফল হয়েছে!' });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'API সংযোগ পরীক্ষা ব্যর্থ হয়েছে। কী ও নেটওয়ার্ক যাচাই করুন।',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearCustomKey = () => {
    setGeminiKeyInput('');
    const updated = { ...settings, customGeminiKey: undefined };
    setSettings(updated);
    saveStoredSettings(updated);
    setTestResult(null);
    onRefreshHealth();
  };

  const isServerKeyActive = Boolean(safeHealth.geminiConfigured) && !settings.customGeminiKey;


  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-400" />
          সেটিংস ও এআই প্রোভাইডার (Settings & API Keys)
        </h1>
        <p className="text-xs text-slate-400">
          AI প্রোভাইডার কনফিগারেশন, নিরাপত্তা, ভয়েস ইনপুট ও সিস্টেম প্রেফারেন্স।
        </p>
      </div>

      {/* Save Alert */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/40 border border-emerald-800 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {/* Section 1: AI Provider & API Key Manager */}
      <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">AI প্রোভাইডার ও API Key ম্যানেজার</h2>
          </div>
          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            নিরাপদ সার্ভার প্রক্সি
          </span>
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-2.5 rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>নিরাপত্তা নীতি:</strong> আপনার API কী কখনও ক্লায়েন্ট-সাইড ব্রাউজার বান্ডিলে হার্ডকোড করা হয় না। সমস্ত রিকোয়েস্ট সুরক্ষিত ব্যাকএন্ড এন্ডপয়েন্ট (<code className="text-emerald-300">/api/chat</code>) এর মাধ্যমে প্রসেস করা হয়।
          </p>
        </div>

        {/* Gemini Provider Card */}
        <div className="rounded-xl border border-slate-800 bg-[#0d121f] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  Google Gemini API
                  <span className="rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 text-[9px]">
                    সক্রিয়
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isServerKeyActive
                    ? 'সার্ভার এনভায়রনমেন্ট ভেরিয়েবল সংযুক্ত (GEMINI_API_KEY)'
                    : settings.customGeminiKey
                    ? 'ব্যক্তিগত কাস্টম API চাবি কনফিগার করা'
                    : 'AI API সংযুক্ত করা হয়নি'}
                </div>
              </div>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                safeHealth.geminiConfigured || settings.customGeminiKey
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {safeHealth.geminiConfigured || settings.customGeminiKey ? 'Connected' : 'Not Configured'}
            </span>

          </div>

          {/* Key Input */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-semibold text-slate-300">
              কাস্টম Gemini API Key (ঐচ্ছিক):
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder={
                    isServerKeyActive
                      ? 'সার্ভার কী সক্রিয় রয়েছে • চাইলে নিজস্ব কী দিতে পারেন'
                      : 'AIzaSy...'
                  }
                  className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTesting || (!geminiKeyInput.trim() && !safeHealth?.geminiConfigured)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>টেস্ট</span>
                )}
              </button>

              {settings.customGeminiKey && (
                <button
                  type="button"
                  onClick={handleClearCustomKey}
                  className="rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-800 px-2.5 py-1.5 text-xs text-rose-300 transition"
                  title="কী সরান"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {testResult && (
              <div
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs border ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Model selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">ডিফল্ট মডেল:</label>
              <select
                value={settings.activeModel}
                onChange={(e) => setSettings({ ...settings, activeModel: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white"
              >
                <option value="gemini-3.6-flash">Gemini 3.6 Flash (সুপার ফাস্ট ও নির্ভরযোগ্য)</option>
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (লেটেস্ট সংস্করণ)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (উন্নত কোডিং ও বিশ্লেষণ)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (কম্প্যাক্ট)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                ক্রিয়েটিভিটি / Temperature: {settings.temperature}
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Future Architecture Providers (OpenAI & Anthropic) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 opacity-75">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">OpenAI (Architecture Ready)</span>
              <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                পরবর্তী সংস্করণে
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              GPT-4o ও GPT-4o-mini সংযোগ আর্কিটেকচার প্রস্তুত।
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 opacity-75">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Anthropic (Architecture Ready)</span>
              <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                পরবর্তী সংস্করণে
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Claude 3.5 Sonnet ও Haiku প্লাগেবল আর্কিটেকচার।
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Preferences */}
      <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-5 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          অ্যাপ প্রেফারেন্স ও ভাষা
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              ভয়েস ইনপুট ভাষা (Voice Language):
            </label>
            <select
              value={settings.voiceLanguage}
              onChange={(e) =>
                setSettings({ ...settings, voiceLanguage: e.target.value as 'bn-BD' | 'en-US' })
              }
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
            >
              <option value="bn-BD">বাংলা (Bangladesh - bn-BD)</option>
              <option value="en-US">English (United States - en-US)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              ইন্টারফেস ভাষা (Interface Language):
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value as 'bn' | 'en' })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
            >
              <option value="bn">বাংলা (Bengali)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>সেটিংস সংরক্ষণ করুন</span>
        </button>
      </div>

      {/* About Box */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-4 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>সর্বকাজ AI বন্ধু (AI Bondhu Workspace) সম্পর্কে</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          “সর্বকাজ AI বন্ধু” হলো একটি স্বয়ংসম্পূর্ণ, মোবাইল-ফার্স্ট প্রোডাক্টিভিটি ও এআই ওয়ার্কস্পেস। এটি কেবল সাধারণ চ্যাটবট নয়, বরং কোডিং, ফ্রন্টএন্ড ওয়েব ডেভেলপমেন্ট, ডিবাগিং, গবেষণা, লেখালেখি ও দৈনন্দিন কাজের একটি নির্ভরযোগ্য ব্যক্তিগত সহকারী।
        </p>
      </div>
    </div>
  );
};
