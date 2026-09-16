import React, { useState } from 'react';
import { Languages, ArrowRightLeft, Sparkles, Copy, Check, RefreshCw, AlertCircle, BookOpen } from 'lucide-react';
import { sendChatMessage } from '../services/ai/aiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

export const LanguageBuddyView: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [direction, setDirection] = useState<'bn2en' | 'en2bn' | 'banglish2bn'>('banglish2bn');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    let instruction = '';
    if (direction === 'banglish2bn') {
      instruction = `Convert and refine this Banglish (Bengali in English letters) text into proper, natural Bengali script (বাংলা লিপি), and also provide its accurate English translation:`;
    } else if (direction === 'bn2en') {
      instruction = `Translate this Bengali text into high-quality, idiomatic, natural English. Provide:
1. 🔤 প্রাকৃতিক ইংরেজি অনুবাদ (Natural English Translation)
2. 💼 প্রফেশনাল/ফরমাল বিকল্প (Formal Alternative)
3. 💡 মূল শব্দার্থ ও ব্যাকরণ টিপস (Key Vocabulary & Grammar Notes)`;
    } else {
      instruction = `Translate this English text into natural, grammatically correct Bengali (বাংলা). Provide:
1. 🔤 প্রাকৃতিক বাংলা অনুবাদ (Natural Bengali Translation)
2. 💡 গুরুত্বপূর্ণ শব্দের অর্থ ও ব্যাকরণ ব্যাখ্যা (Vocabulary & Grammar Rules)`;
    }

    const prompt = `${instruction}\n\n"${inputText}"`;

    try {
      const res = await sendChatMessage({
        mode: 'language-buddy',
        messages: [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
      });
      setOutput(res.text);
    } catch (err: any) {
      setErrorMessage(err.message || 'অনুবাদ সম্পন্ন করতে সমস্যা হয়েছে।');
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
          <Languages className="w-5 h-5 text-emerald-400" />
          ল্যাঙ্গুয়েজ বাডি (Language Buddy)
        </h1>
        <p className="text-xs text-slate-400">
          বাংলা ↔ ইংরেজি অনুবাদ, Banglish বোঝা, ব্যাকরণ বিশ্লেষণ ও শব্দভাণ্ডার সমৃদ্ধকরণ।
        </p>
      </div>

      {/* Direction Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setDirection('banglish2bn')}
          className={`whitespace-nowrap px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
            direction === 'banglish2bn'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Banglish ➔ শুদ্ধ বাংলা ও ইংরেজি
        </button>

        <button
          onClick={() => setDirection('bn2en')}
          className={`whitespace-nowrap px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
            direction === 'bn2en'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          বাংলা ➔ English
        </button>

        <button
          onClick={() => setDirection('en2bn')}
          className={`whitespace-nowrap px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
            direction === 'en2bn'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          English ➔ বাংলা
        </button>
      </div>

      {/* Input Box */}
      <div className="rounded-2xl bg-[#0d121f] border border-slate-800 p-4 space-y-3 shadow-md">
        <label className="text-xs font-semibold text-slate-200">
          {direction === 'banglish2bn'
            ? 'Banglish বাক্য বা অনুচ্ছেদ লিখুন:'
            : direction === 'bn2en'
            ? 'বাংলা বাক্য লিখুন:'
            : 'English বাক্য লিখুন:'}
        </label>

        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            direction === 'banglish2bn'
              ? 'যেমন: ami ajke office theke ektu deri kore ferbo, karon ekti meeting ache...'
              : direction === 'bn2en'
              ? 'যেমন: আমি নিয়মিত নতুন কিছু শিখতে ভালোবাসি...'
              : 'E.g.: Consistency is more important than short-term intensity...'
          }
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() =>
              setInputText(
                direction === 'banglish2bn'
                  ? 'kalke sokale amader sathe dekha hobe kina janio.'
                  : direction === 'bn2en'
                  ? 'কঠিন পরিশ্রমের কোনো বিকল্প নেই।'
                  : 'Practice makes a person confident.'
              )
            }
            className="text-[11px] text-emerald-400 hover:underline"
          >
            নমুনা বাক্য যোগ করুন
          </button>

          <button
            onClick={handleTranslate}
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
                <span>অনুবাদ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>অনুবাদ ও রূপান্তর করুন</span>
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

      {/* Output */}
      {output && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              অনুবাদ ও ব্যাকরণ নোট
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
