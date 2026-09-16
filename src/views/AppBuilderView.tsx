import React, { useState } from 'react';
import { Boxes, Sparkles, Play, RefreshCw, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { sendChatMessage } from '../services/ai/aiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

const STAGES = [
  { id: 1, name: 'ধারণা ও উদ্দেশ্য', en: 'Idea & Goals' },
  { id: 2, name: 'ফিচার তালিকা', en: 'Features' },
  { id: 3, name: 'আর্কিটেকচার ও স্ট্যাক', en: 'Architecture' },
  { id: 4, name: 'ফাইল স্ট্রাকচার', en: 'File Structure' },
  { id: 5, name: 'কোর কোড', en: 'Core Code' },
  { id: 6, name: 'টেস্টিং চেকলিস্ট', en: 'Testing' },
  { id: 7, name: 'ডিপ্লয়মেন্ট গাইড', en: 'Deployment' },
];

export const AppBuilderView: React.FC = () => {
  const [appIdea, setAppIdea] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('Web (React/Vite)');
  const [targetScope, setTargetScope] = useState('MVP (মিনিমাম ভায়াবল প্রোডাক্ট)');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleBuildPlan = async () => {
    if (!appIdea.trim() || isLoading) return;
    setIsLoading(true);
    setApiError(null);

    const prompt = `Architect a complete software application plan for this idea:
App Idea: "${appIdea}"
Target Platform: ${targetPlatform}
Project Scope: ${targetScope}

Structure your response clearly with these exact 7 progressive stages in Bengali:
1. 💡 ধারণা ও উদ্দেশ্য (Idea & Goals)
2. 📋 ফিচার ও রিকোয়ারমেন্টস (Feature Checklist)
3. 🏗️ আর্কিটেকচার ও টেক-স্ট্যাক (System Architecture & Tech Stack)
4. 📁 ফাইল ও ফোল্ডার স্ট্রাকচার (Production-Ready Folder Tree)
5. 💻 কোর কোড ও কনফিগারেশন (Key config files and core entry point code)
6. 🧪 টেস্টিং চেকলিস্ট (Testing & Validation Checklist)
7. 🚀 ডিপ্লয়মেন্ট গাইড (Deployment Instructions for Netlify/Cloudflare/Cloud Run)`;

    try {
      const res = await sendChatMessage({
        mode: 'app-builder',
        messages: [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
      });
      setOutput(res.text);
    } catch (err: any) {
      setApiError(err.message || 'অ্যাপ প্ল্যান তৈরি করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetExample = (idea: string) => {
    setAppIdea(idea);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Boxes className="w-5 h-5 text-emerald-400" />
          অ্যাপ বিল্ডার (App Builder Architect)
        </h1>
        <p className="text-xs text-slate-400">
          একটি প্রাথমিক ধারণা থেকে পূর্ণাঙ্গ সফটওয়্যার আর্কিটেকচার, ফাইল স্ট্রাকচার ও কোড প্ল্যান।
        </p>
      </div>

      {/* 7 Stages Progress Indicator */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center min-w-[620px] gap-2">
          {STAGES.map((st, i) => (
            <React.Fragment key={st.id}>
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 border border-slate-700/60">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                  {st.id}
                </span>
                <span className="font-medium truncate">{st.name}</span>
              </div>
              {i < STAGES.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Input */}
      <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-4 space-y-4 shadow-xl">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            আপনার অ্যাপের ধারণা বা বর্ণনা (App Idea):
          </label>
          <textarea
            rows={4}
            value={appIdea}
            onChange={(e) => setAppIdea(e.target.value)}
            placeholder="যেমন: একটি ব্যক্তিগত ফিনান্স ও বাজেট ট্র্যাকার অ্যাপ যেখানে দৈনিক খরচ ক্যাটাগরি অনুযায়ী এন্ট্রি করা যাবে এবং চার্ট দেখতে পাওয়া যাবে..."
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
          />
        </div>

        {/* Quick idea badges */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs text-slate-400">
          <span className="shrink-0 text-slate-500 text-[11px]">আইডিয়া:</span>
          {[
            'অনলাইন বুকিং সিস্টেম',
            'ছাত্রছাত্রীদের হোমওয়ার্ক ট্র্যাকার',
            'রেস্তোরাঁর ডিজিটাল কিউআর মেনু',
            'রিমোট টিম টাস্কবোর্ড',
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => handleSetExample(item)}
              className="whitespace-nowrap hover:text-emerald-400 bg-slate-800 px-2.5 py-1 rounded-lg transition"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-xs text-slate-400 block mb-1">টার্গেট প্ল্যাটফর্ম:</label>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Web (React/Vite/Tailwind)">Web (React / Vite / Tailwind)</option>
              <option value="Full-Stack (Node.js/Express + React)">Full-Stack (Node.js + React)</option>
              <option value="Mobile (React Native / Expo)">Mobile (React Native / Expo)</option>
              <option value="Python / FastAPI Backend">Python / FastAPI Backend</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">প্রজেক্টের পরিধি (Scope):</label>
            <select
              value={targetScope}
              onChange={(e) => setTargetScope(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="MVP (মিনিমাম ভায়াবল প্রোডাক্ট)">MVP (মিনিমাম ভায়াবল প্রোডাক্ট)</option>
              <option value="প্রোডাকশন স্কেল (Full Production Ready)">প্রোডাকশন স্কেল (Full Production Ready)</option>
              <option value="দ্রুত প্রোটোটাইপ (Quick Prototype)">দ্রুত প্রোটোটাইপ (Quick Prototype)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleBuildPlan}
            disabled={isLoading || !appIdea.trim()}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition active:scale-95 ${
              isLoading || !appIdea.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>আর্কিটেকচার তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>আর্কিটেকচার প্ল্যান তৈরি করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-800 p-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            পূর্ণাঙ্গ আর্কিটেকচার ও ইমপ্লিমেন্টেশন গাইড
          </h3>
          <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-5 shadow-2xl">
            <MarkdownRenderer content={output} />
          </div>
        </div>
      )}
    </div>
  );
};
