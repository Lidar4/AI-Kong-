import React, { useState } from 'react';
import { Palette, Copy, Check, Sparkles, RefreshCw, Eye, Type, AlertCircle } from 'lucide-react';
import { sendChatMessage } from '../services/ai/aiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

const PRESET_PALETTES = [
  {
    name: 'Emerald Workspace',
    colors: ['#090d16', '#0f172a', '#10b981', '#34d399', '#f8fafc'],
    tags: ['Dark', 'Tech', 'Clean'],
  },
  {
    name: 'Twilight Indigo',
    colors: ['#0b0f19', '#1e1b4b', '#6366f1', '#a5b4fc', '#f1f5f9'],
    tags: ['Modern', 'SaaS', 'Vibrant'],
  },
  {
    name: 'Minimal Warm Sand',
    colors: ['#1c1917', '#292524', '#f59e0b', '#fbbf24', '#fafaf9'],
    tags: ['Warm', 'Editorial', 'Premium'],
  },
];

export const DesignMateView: React.FC = () => {
  const [designIdea, setDesignIdea] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleGenerateDesignSystem = async (presetPrompt?: string) => {
    const text = presetPrompt || designIdea;
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    const prompt = `Act as an elite UI/UX Design System Lead.
Create a comprehensive design system for this product: "${text}".

Structure the response with these exact sections in Bengali:
1. 🎨 রঙের প্যালেট (Color Palette):
   - Primary, Secondary, Background, Surface, Accent, Text colors with exact #HEX codes and accessibility ratings.
2. 🔤 টাইপোগ্রাফি স্কেল (Typography Pairing & Scale):
   - Heading font, body font, font-sizes (H1, H2, H3, Body, Small) and line-heights.
3. 📐 স্পেসিং ও লেআউট গ্রিড (Spacing, Border Radii & Shadows)
4. 📱 মোবাইল ও রেসপনসিভ UX নিয়মাবলী (Key UX & Ergonomic Rules)
5. 🖼️ প্রম্পট আইডিয়া (Image / Asset Generation Prompts for modern AI tools)`;

    try {
      const res = await sendChatMessage({
        mode: 'design-mate',
        messages: [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
      });
      setOutput(res.text);
    } catch (err: any) {
      setErrorMessage(err.message || 'ডিজাইন সিস্টেম জেনারেট করা সম্ভব হয়নি।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-emerald-400" />
          ডিজাইন মেট (Design Mate)
        </h1>
        <p className="text-xs text-slate-400">
          UI/UX ডিজাইন আইডিয়া, কালার প্যালেট, টাইপোগ্রাফি ও আধুনিক ডিজাইন সিস্টেম উপদেষ্টা।
        </p>
      </div>

      {/* Preset Curated Color Palettes */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">
          জনপ্রিয় ডিজাইন প্যালেট (ক্লিক করে হেক্স কপি করুন):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_PALETTES.map((palette, i) => (
            <div key={i} className="rounded-2xl bg-[#0f172a] border border-slate-800 p-3 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{palette.name}</span>
                <div className="flex gap-1">
                  {palette.tags.map((t, idx) => (
                    <span key={idx} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Color swatches */}
              <div className="flex h-10 rounded-xl overflow-hidden border border-slate-800">
                {palette.colors.map((hex, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => handleCopy(hex)}
                    title={`ক্লিক করে কপি করুন: ${hex}`}
                    className="flex-1 h-full transition-transform hover:scale-105 relative group flex items-center justify-center"
                    style={{ backgroundColor: hex }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono font-bold bg-black/70 text-white px-1 rounded">
                      {copiedHex === hex ? '✓' : hex.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generator Prompt Box */}
      <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-4 space-y-3 shadow-md">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">
            কী ধরণের অ্যাপ বা ওয়েবসাইটের জন্য ডিজাইন সিস্টেম চান?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={designIdea}
              onChange={(e) => setDesignIdea(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateDesignSystem()}
              placeholder="যেমন: একটি এডুকেশন লার্নিং প্ল্যাটফর্মের জন্য ডার্ক মোড ডিজাইন সিস্টেম..."
              className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleGenerateDesignSystem()}
              disabled={isLoading || !designIdea.trim()}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 shrink-0 ${
                isLoading || !designIdea.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>জেনারেট করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Suggested presets */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs text-slate-400 pt-1">
          <span className="shrink-0 text-slate-500 text-[11px]">আইডিয়া:</span>
          {['Fintech Banking App', 'Doctor Appointment System', 'E-commerce Store', 'Travel Guide'].map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setDesignIdea(s);
                handleGenerateDesignSystem(s);
              }}
              className="whitespace-nowrap hover:text-emerald-400 bg-slate-800 px-2.5 py-0.5 rounded-lg transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-800 p-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Output Design System */}
      {output && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            ডিজাইন সিস্টেম ও স্পেসিফিকেশন
          </h3>
          <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-5 shadow-2xl">
            <MarkdownRenderer content={output} />
          </div>
        </div>
      )}
    </div>
  );
};
