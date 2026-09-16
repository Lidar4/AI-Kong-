import React, { useState } from 'react';
import { Check, Copy, Code, Download } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, filename }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const handleDownload = () => {
    const ext = language === 'html' ? 'html' : language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : 'txt';
    const name = filename || `code_${Date.now()}.${ext}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-800 bg-[#0d121f] text-sm shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-3.5 py-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Code className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-mono uppercase font-semibold text-emerald-400/90">{language || 'code'}</span>
          {filename && <span className="text-slate-500 font-mono">({filename})</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            aria-label="কোড ডাউনলোড করুন"
            title="ডাউনলোড"
            className="flex items-center gap-1 rounded px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">ডাউনলোড</span>
          </button>
          <button
            onClick={handleCopy}
            aria-label="কোড কপি করুন"
            title="কপি"
            className="flex items-center gap-1 rounded px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>কপি</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="relative overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-slate-200">
        <pre className="flex">
          <div className="select-none pr-3 text-right text-slate-600 border-r border-slate-800/60 mr-3">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <code className="flex-1 overflow-x-auto whitespace-pre">{code}</code>
        </pre>
      </div>
    </div>
  );
};
