import React, { useState } from 'react';
import { Code2, Play, Copy, Check, Download, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { sendChatMessage } from '../services/ai/aiService';
import { CodeBlock } from '../components/CodeBlock';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

const LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'HTML/CSS',
  'React',
  'SQL',
  'Java',
  'C++',
  'Bash',
  'Go',
  'Rust',
  'PHP',
];

const ACTIONS = [
  { id: 'generate', label: 'কোড লিখুন', desc: 'নতুন কোড জেনারেট করুন' },
  { id: 'explain', label: 'কোড বুঝুন', desc: 'লাইন-বাই-লাইন ব্যাখ্যা' },
  { id: 'refactor', label: 'রিফ্যাক্টর', desc: 'ক্লিন ও মডার্ন কোডে রূপান্তর' },
  { id: 'optimize', label: 'অপটিমাইজ', desc: 'টাইম ও স্পেস জটিলতা কমানো' },
  { id: 'find-bugs', label: 'বাগ খুঁজুন', desc: 'সম্ভাব্য ভুল ও নিরাপত্তা সমস্যা' },
];

export const CodeMasterView: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState('JavaScript');
  const [selectedAction, setSelectedAction] = useState('generate');
  const [inputCode, setInputCode] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRun = async () => {
    if (!inputCode.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    const actionText =
      selectedAction === 'generate'
        ? `Write ${selectedLang} code for this requirement:`
        : selectedAction === 'explain'
        ? `Explain this ${selectedLang} code line-by-line with simple analogies in Bengali:`
        : selectedAction === 'refactor'
        ? `Refactor and clean this ${selectedLang} code according to modern best practices:`
        : selectedAction === 'optimize'
        ? `Analyze and optimize the performance (time and space complexity) of this ${selectedLang} code:`
        : `Detect any syntax, logic, or edge-case bugs in this ${selectedLang} code and fix them:`;

    const prompt = `${actionText}\n\n\`\`\`${selectedLang.toLowerCase()}\n${inputCode}\n\`\`\``;

    try {
      const res = await sendChatMessage({
        mode: 'code-master',
        messages: [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
      });
      setOutput(res.text);
    } catch (err: any) {
      setErrorMessage(err.message || 'কোড প্রসেস করতে ব্যর্থ হয়েছে। API চাবি যাচাই করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertSample = () => {
    if (selectedAction === 'generate') {
      setInputCode('একটি রেসপনসিভ নেভিগেশন বার তৈরি করো যার মধ্যে মোবাইল ড্রয়ার থাকবে এবং ডার্ক মোড সাপোর্ট করবে।');
    } else {
      setInputCode(`function findDuplicates(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !result.includes(arr[i])) {
        result.push(arr[i]);
      }
    }
  }
  return result;
}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            কোড মাস্টার (Code Master)
          </h1>
          <p className="text-xs text-slate-400">
            যেকোনো প্রোগ্রামিং ভাষায় কোড তৈরি, ব্যাখ্যা, রিফ্যাক্টরিং ও বিশ্লেষণ।
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">ভাষা:</label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => setSelectedAction(action.id)}
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition ${
              selectedAction === action.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input / Code Editor Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            {selectedAction === 'generate' ? 'প্রয়োজন বা রিকোয়ারমেন্ট লিখুন:' : 'কোড পেস্ট করুন:'}
          </label>
          <button
            type="button"
            onClick={handleInsertSample}
            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> উদাহরণ কোড যোগ করুন
          </button>
        </div>

        <div className="rounded-2xl bg-[#0d121f] border border-slate-800 overflow-hidden shadow-inner">
          <textarea
            rows={7}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder={
              selectedAction === 'generate'
                ? 'যেমন: একটি React ফর্ম তৈরি করো যেখানে নাম, ইমেইল ও পাসওয়ার্ড ভ্যালিডেশন থাকবে...'
                : 'এখানে আপনার কোড পেস্ট করুন...'
            }
            className="w-full bg-transparent p-3.5 font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-900/60 px-3 py-2">
            <span className="text-[11px] text-slate-500 font-mono">
              {selectedLang} • {inputCode.length} অক্ষর
            </span>

            <button
              type="button"
              onClick={handleRun}
              disabled={isLoading || !inputCode.trim()}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 ${
                isLoading || !inputCode.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>প্রসেস হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>চালান (Execute)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Notice */}
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
              ফলাফল ও সমাধান
            </h3>
          </div>

          <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-4 shadow-xl">
            <MarkdownRenderer content={output} />
          </div>
        </div>
      )}
    </div>
  );
};
