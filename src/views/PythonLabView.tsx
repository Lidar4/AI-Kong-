import React, { useState } from 'react';
import { Terminal, Play, Sparkles, RefreshCw, Copy, Check, Download, AlertCircle } from 'lucide-react';
import { sendChatMessage } from '../services/ai/aiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

const SAMPLE_PYTHON = `def fibonacci_sequence(n):
    """Generate first n Fibonacci numbers."""
    if n <= 0:
        return []
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence[:n]

# Test the function
numbers = fibonacci_sequence(8)
print("Fibonacci numbers:", numbers)
`;

export const PythonLabView: React.FC = () => {
  const [code, setCode] = useState(SAMPLE_PYTHON);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExecute = async (mode: 'run' | 'explain' | 'optimize') => {
    if (!code.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    const taskText =
      mode === 'run'
        ? `Analyze this Python code. Explain step-by-step what happens, show what the EXACT console output would be, and flag any potential runtime warnings or edge cases:`
        : mode === 'explain'
        ? `Explain this Python 3 code in friendly Bengali with simple analogies line-by-line:`
        : `Refactor and optimize this Python code following PEP 8, type hints, and algorithmic efficiency:`;

    const prompt = `${taskText}\n\n\`\`\`python\n${code}\n\`\`\``;

    try {
      const res = await sendChatMessage({
        mode: 'python-lab',
        messages: [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
      });
      setOutput(res.text);
    } catch (err: any) {
      setErrorMessage(err.message || 'Python ল্যাব প্রসেস ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            পাইথন ল্যাব (Python Lab)
          </h1>
          <p className="text-xs text-slate-400">
            পাইথন ৩ কোড এডিটর, সিনট্যাক্স অ্যানালাইসিস ও কার্যকর আউটপুট সিমুলেশন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCode(SAMPLE_PYTHON)}
            className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl transition"
          >
            নমুনা কোড
          </button>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি হয়েছে' : 'কোড কপি'}</span>
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="rounded-2xl bg-[#0d121f] border border-slate-800 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between bg-slate-900/90 px-4 py-2 border-b border-slate-800 text-xs text-slate-400">
          <span className="font-mono text-emerald-400 font-semibold">main.py</span>
          <span className="text-[11px] text-slate-500">Python 3.11</span>
        </div>

        <textarea
          rows={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="# এখানে আপনার Python কোড লিখুন..."
          className="w-full bg-transparent p-4 font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-y leading-relaxed"
        />

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 p-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExecute('explain')}
              disabled={isLoading || !code.trim()}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition"
            >
              ব্যাখ্যা শুনুন
            </button>
            <button
              onClick={() => handleExecute('optimize')}
              disabled={isLoading || !code.trim()}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition"
            >
              অপটিমাইজ করুন
            </button>
          </div>

          <button
            onClick={() => handleExecute('run')}
            disabled={isLoading || !code.trim()}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 ${
              isLoading || !code.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>অ্যানালাইসিস হচ্ছে...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>রান ও অ্যানালাইসিস</span>
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

      {/* Output / Analysis Terminal */}
      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Terminal className="w-4 h-4" /> কনসোল আউটপুট ও বিস্তারিত
            </span>
          </div>

          <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-4 shadow-xl">
            <MarkdownRenderer content={output} />
          </div>
        </div>
      )}
    </div>
  );
};
