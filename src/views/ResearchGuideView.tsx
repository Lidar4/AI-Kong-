import React, { useState } from 'react';
import { BookOpen, Sparkles, RefreshCw, AlertCircle, Compass } from 'lucide-react';
import { sendChatMessage } from '../services/ai/aiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

export const ResearchGuideView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [scope, setScope] = useState('একাডেমিক থিসিস বা রিসার্চ পেপার');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResearch = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    const prompt = `Act as an accomplished Academic & Strategic Research Advisor.
Research Topic: "${topic}"
Target Scope: "${scope}"

Structure your comprehensive research blueprint in Bengali:
1. 🎯 প্রধান গবেষণা প্রশ্ন ও হাইপোথিসিস (Primary Research Question & 3 Sub-Hypotheses)
2. 🔍 গবেষণা পদ্ধতি ও মেথডোলজি (Methodology: Qualitative, Quantitative or Mixed)
3. 📚 লিটারেচার রিভিউ রূপরেখা (Structured Literature Review Themes & Outlines)
4. ⚖️ বিপরীত দৃষ্টিকোণ ও বিতর্ক (Opposing Viewpoints & Critical Debates)
5. 📊 সম্ভাব্য ডেটা সোর্স ও ফিল্ডওয়ার্ক আইডিয়া (Data Collection Vectors & Sources)
6. ⚠️ সীমাবদ্ধতা ও নৈতিক বিষয়সমূহ (Limitations & Ethical Considerations)`;

    try {
      const res = await sendChatMessage({
        mode: 'research-guide',
        messages: [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
      });
      setOutput(res.text);
    } catch (err: any) {
      setErrorMessage(err.message || 'রিসার্চ গাইড তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          রিসার্চ গাইড (Research Guide)
        </h1>
        <p className="text-xs text-slate-400">
          গবেষণার বিষয় বিভাজন, হাইপোথিসিস প্রণয়ন, আউটলাইন ও তুলনামূলক বিশ্লেষণ।
        </p>
      </div>

      {/* Input Form */}
      <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-4 space-y-4 shadow-md">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-200">
            গবেষণার বিষয় বা প্রশ্ন (Research Topic / Question):
          </label>
          <textarea
            rows={3}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="যেমন: বাংলাদেশের ক্ষুদ্র উদ্যোক্তাদের ডিজিটাল পেমেন্ট ব্যবহারে প্রতিবন্ধকতা ও সম্ভাবনা..."
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">গবেষণার ধরণ:</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="একাডেমিক থিসিস বা রিসার্চ পেপার">একাডেমিক থিসিস বা রিসার্চ পেপার</option>
              <option value="ব্যবসায়িক মার্কেট রিসার্চ">ব্যবসায়িক মার্কেট রিসার্চ</option>
              <option value="নীতি নির্ধারণী প্রস্তাবনা">নীতি নির্ধারণী পলিসি পেপার</option>
              <option value="সাধারণ অনুসন্ধান ও ব্লগ প্রবন্ধ">সাধারণ অনুসন্ধান ও ব্লগ প্রবন্ধ</option>
            </select>
          </div>

          <div className="flex items-end justify-end">
            <button
              onClick={handleResearch}
              disabled={isLoading || !topic.trim()}
              className={`w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white transition active:scale-95 ${
                isLoading || !topic.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>রিসার্চ ব্লুপ্রিন্ট তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>রিসার্চ ব্লুপ্রিন্ট তৈরি করুন</span>
                </>
              )}
            </button>
          </div>
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
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            রিসার্চ রূপরেখা ও কার্যপ্রণালী
          </h3>
          <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-5 shadow-2xl">
            <MarkdownRenderer content={output} />
          </div>
        </div>
      )}
    </div>
  );
};
