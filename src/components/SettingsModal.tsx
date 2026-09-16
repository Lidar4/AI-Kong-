import React, { useState } from 'react';
import { X, Key, Cpu, Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { UserSettings } from '../types';
import { testApiKey } from '../services/ai/aiService';
import { saveStoredSettings } from '../services/storage/chatStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [apiKey, setApiKey] = useState(settings.customGeminiKey || '');
  const [activeModel, setActiveModel] = useState(settings.activeModel || 'gemini-3.6-flash');
  const [voiceLang, setVoiceLang] = useState(settings.voiceLanguage || 'bn-BD');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'অনুগ্রহ করে একটি API Key লিখুন।' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      await testApiKey(apiKey.trim(), 'gemini', activeModel);
      setTestResult({ success: true, message: 'API Key সঠিক এবং কার্যকর!' });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'API পরীক্ষা ব্যর্থ হয়েছে।' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const updated: UserSettings = {
      ...settings,
      customGeminiKey: apiKey.trim() || undefined,
      activeModel,
      voiceLanguage: voiceLang,
    };
    saveStoredSettings(updated);
    onUpdateSettings(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">চ্যাটবট সেটিংস</h2>
              <p className="text-xs text-slate-400">মডেল ও এআই কনফিগারেশন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Model Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              AI মডেল নির্বাচন
            </label>
            <select
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/60 text-sm"
            >
              <option value="gemini-3.6-flash">Gemini 3.6 Flash (সুপার ফাস্ট, সেলফ-কোডিংয়ের জন্য সেরা)</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (লেটেস্ট মডেল)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (উন্নত জটিল যুক্তি)</option>
            </select>
          </div>

          {/* Custom API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                কাস্টম Gemini API Key (ঐচ্ছিক)
              </label>
              <span className="text-[11px] text-emerald-400">সার্ভার কি ডিফল্টভাবে সক্রিয়</span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy... (সার্ভার কী ব্যবহার করতে ফাঁকা রাখুন)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 text-xs font-mono"
                />
              </div>
              {apiKey && (
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {testing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  যাচাই
                </button>
              )}
            </div>
            {testResult && (
              <div
                className={`mt-2 p-2 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {testResult.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {testResult.message}
              </div>
            )}
          </div>

          {/* Voice Language */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              ভয়েস ইনপুট ভাষা
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVoiceLang('bn-BD')}
                className={`p-2 rounded-xl text-xs border text-center transition-colors ${
                  voiceLang === 'bn-BD'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                🇧🇩 বাংলা (bn-BD)
              </button>
              <button
                type="button"
                onClick={() => setVoiceLang('en-US')}
                className={`p-2 rounded-xl text-xs border text-center transition-colors ${
                  voiceLang === 'en-US'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                🇺🇸 English (en-US)
              </button>
            </div>
          </div>

          {/* Self-Code Feature highlight */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-emerald-300">সেলফ-কোডিং সিস্টেম সক্রিয়</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                এই চ্যাটবট নিজের কোড নিজে পড়তে ও পরিবর্তন করতে পারে। চ্যাটে গিয়ে যেকোনো ডিজাইন বা কোড পরিবর্তনের অনুরোধ করলেই সে সরাসরি তা আপডেট করে দেবে।
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            বাতিল
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-lg shadow-emerald-900/30 transition-colors"
          >
            সংরক্ষণ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
