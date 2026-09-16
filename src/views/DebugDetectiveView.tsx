import React, { useState } from 'react';
import { Bug, Play, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { sendChatMessage } from '../services/ai/aiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

export const DebugDetectiveView: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [buggyCode, setBuggyCode] = useState('');
  const [environmentLogs, setEnvironmentLogs] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDebug = async () => {
    if ((!errorMessage.trim() && !buggyCode.trim()) || isLoading) return;
    setIsLoading(true);
    setApiError(null);

    const prompt = `Diagnose and fix this bug:

=== ERROR MESSAGE / LOGS ===
${errorMessage || 'No specific error message provided'}

=== CODE ===
\`\`\`
${buggyCode || 'No code snippet provided'}
\`\`\`

=== ENVIRONMENT CONTEXT / LOGS ===
${environmentLogs || 'None'}

Please provide your diagnostic response structured in these exact 5 sections in friendly Bengali:
1. 🎯 সমস্যা (The Problem)
2. 🔍 কারণ (Root Cause)
3. 🛠️ সমাধান (The Fix)
4. 💻 সংশোধিত কোড (Corrected Code)
5. 💡 অতিরিক্ত টিপস ও ব্যাখ্যা (Explanation & Best Practices)`;

    try {
      const res = await sendChatMessage({
        mode: 'debug-detective',
        messages: [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
      });
      setOutput(res.text);
    } catch (err: any) {
      setApiError(err.message || 'ডিবাগিং প্রসেস ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertSample = () => {
    setErrorMessage('TypeError: Cannot read properties of undefined (reading "map")');
    setBuggyCode(`function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}`);
    setEnvironmentLogs('React 18, Next.js frontend during initial data loading before API resolves.');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bug className="w-5 h-5 text-emerald-400" />
            ডিবাগ ডিটেকটিভ (Debug Detective)
          </h1>
          <p className="text-xs text-slate-400">
            কোডের এরর, লগ ও স্ট্যাক ট্রেস ইনপুট দিয়ে ৫টি স্পষ্ট ধাপে নিখুঁত সমাধান পান।
          </p>
        </div>

        <button
          onClick={handleInsertSample}
          className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl transition"
        >
          <Sparkles className="w-3.5 h-3.5" /> নমুনা বাগ লোড করুন
        </button>
      </div>

      {/* 3 Structured Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input 1: Error message */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            এরর মেসেজ বা স্ট্যাক ট্রেস (Error Message):
          </label>
          <textarea
            rows={4}
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            placeholder="যেমন: Uncaught TypeError, 404 Not Found, CORS error, RecursionError..."
            className="w-full rounded-xl bg-[#0d121f] border border-slate-800 p-3 font-mono text-xs text-rose-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Input 3: Context / Logs */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            এনভায়রনমেন্ট / অতিরিক্ত লগ (Environment Context):
          </label>
          <textarea
            rows={4}
            value={environmentLogs}
            onChange={(e) => setEnvironmentLogs(e.target.value)}
            placeholder="যেমন: Node v18, ব্রাউজারে বা টার্মিনালের লগ, কোনো স্পেসিফিক লাইব্রেরি..."
            className="w-full rounded-xl bg-[#0d121f] border border-slate-800 p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Input 2: The code snippet */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          বাগ যুক্ত কোড (Buggy Code):
        </label>
        <div className="rounded-xl bg-[#0d121f] border border-slate-800 overflow-hidden shadow-inner">
          <textarea
            rows={7}
            value={buggyCode}
            onChange={(e) => setBuggyCode(e.target.value)}
            placeholder="// সমস্যাযুক্ত কোডের অংশটি এখানে পেস্ট করুন..."
            className="w-full bg-transparent p-3 font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Trigger button */}
      <div className="flex justify-end">
        <button
          onClick={handleDebug}
          disabled={isLoading || (!errorMessage.trim() && !buggyCode.trim())}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition active:scale-95 ${
            isLoading || (!errorMessage.trim() && !buggyCode.trim())
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>ডিবাগ বিশ্লেষণ চলছে...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>বাগ সমাধান করুন (Start Diagnosis)</span>
            </>
          )}
        </button>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-800 p-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Output in 5 structured sections */}
      {output && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            ডিবাগ সমাধান রিপোর্ট
          </h3>
          <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-5 shadow-2xl">
            <MarkdownRenderer content={output} />
          </div>
        </div>
      )}
    </div>
  );
};
