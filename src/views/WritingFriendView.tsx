import React, { useState } from 'react';
import { PenTool, Sparkles, Copy, Check, RefreshCw, AlertCircle, Wand2 } from 'lucide-react';
import { sendChatMessage } from '../services/ai/aiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

const TONES = [
  { id: 'polish', label: 'মার্জিত ও নির্ভুল', desc: 'ব্যাকরণ ও বাক্যরীতি ঠিক করা' },
  { id: 'formal', label: 'প্রফেশনাল ও ফরমাল', desc: 'অফিস বা ক্লায়েন্ট কমিউনিকেশন' },
  { id: 'friendly', label: 'সহজ ও বন্ধুসুলভ', desc: 'সোশ্যাল মিডিয়া বা ক্যাজুয়াল' },
  { id: 'academic', label: 'একাডেমিক ও যুক্তিযুক্ত', desc: 'গবেষণা বা প্রবন্ধ' },
  { id: 'youtube', label: 'ইউটিউব টাইটেল ও বিবরণ', desc: 'SEO অপটিমাইজড' },
];

export const WritingFriendView: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedTone, setSelectedTone] = useState('polish');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRewrite = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    const toneDesc = TONES.find((t) => t.id === selectedTone)?.label || 'মার্জিত';
    const prompt = `You are a world-class bilingual (Bengali & English) editor and writer.
Task: Polish and refine the following draft with tone: "${toneDesc}".

Original Draft:
"""
${inputText}
"""

Please provide:
1. ✨ পরিমার্জিত সংস্করণ (Polished Final Draft)
2. 💡 কী কী পরিবর্তন করা হয়েছে (Key Edits & Reasoning)
3. 🎯 বিকল্প আকর্ষণীয় ভার্সন (Alternative Variation)`;

    try {
      const res = await sendChatMessage({
        mode: 'writing-friend',
        messages: [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
      });
      setOutput(res.text);
    } catch (err: any) {
      setErrorMessage(err.message || 'লেখাটি প্রসেস করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <PenTool className="w-5 h-5 text-emerald-400" />
          রাইটিং ফ্রেন্ড (Writing Friend)
        </h1>
        <p className="text-xs text-slate-400">
          লেখালেখি মার্জিত করা, প্রুফরিড, ইমেইল, কভার লেটার ও আকর্ষণীয় কন্টেন্ট তৈরি।
        </p>
      </div>

      {/* Tone Picker */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">লেখার ধরণ বা টোন নির্বাচন করুন:</label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {TONES.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                selectedTone === tone.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tone.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Draft Area */}
      <div className="rounded-2xl bg-[#0d121f] border border-slate-800 p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>আপনার খসড়া লেখা বা বিষয়বস্তু পেস্ট করুন:</span>
          <span>{inputText.length} অক্ষর</span>
        </div>

        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="এখানে আপনার চিঠি, পোস্ট, ইমেইল বা প্রবন্ধের খসড়া লিখুন..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setInputText('ami ekta choto application likhte chai manager k jeno amake 2 diner chuti dey.')}
            className="text-[11px] text-emerald-400 hover:underline"
          >
            নমুনা টেক্সট যোগ করুন
          </button>

          <button
            onClick={handleRewrite}
            disabled={isLoading || !inputText.trim()}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 ${
              isLoading || !inputText.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>পরিমার্জন হচ্ছে...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>পরিমার্জন ও ড্রাফট করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-800 p-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Output Panel */}
      {output && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              পরিমার্জিত সংস্করণ
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-5 shadow-2xl">
            <MarkdownRenderer content={output} />
          </div>
        </div>
      )}
    </div>
  );
};
