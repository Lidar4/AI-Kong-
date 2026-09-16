import React, { useState } from 'react';
import {
  Globe,
  Play,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Sparkles,
  RefreshCw,
  Code,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { sendChatMessage } from '../services/ai/aiService';

const DEFAULT_WEB_CODE = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>আমার ওয়েব প্রজেক্ট</title>
  <style>
    body {
      margin: 0;
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: #1e293b;
      padding: 32px;
      border-radius: 20px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
      max-width: 420px;
      border: 1px solid #334155;
    }
    h1 {
      color: #34d399;
      margin-top: 0;
      font-size: 24px;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
    }
    button {
      background: #10b981;
      color: white;
      border: none;
      padding: 10px 22px;
      border-radius: 12px;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
      margin-top: 14px;
      transition: all 0.2s;
    }
    button:hover {
      background: #059669;
      transform: translateY(-2px);
    }
    #counter {
      font-weight: bold;
      color: #38bdf8;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>ওয়েব প্রো লাইভ ডেমো 🚀</h1>
    <p>AI বন্ধু দিয়ে যেকোনো আধুনিক সিঙ্গেল পেজ ওয়েবসাইট বা ওয়েব কম্পোনেন্ট তৈরি করুন এবং সরাসরি প্রিভিউ দেখুন।</p>
    <div>ক্লিক সংখ্যা: <span id="counter">0</span></div>
    <button onclick="increment()">ক্লিক করুন</button>
  </div>

  <script>
    let count = 0;
    function increment() {
      count++;
      document.getElementById('counter').innerText = count;
    }
  </script>
</body>
</html>`;

export const WebProView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState(DEFAULT_WEB_CODE);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateWebsite = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    const fullPrompt = `Create a complete, single-file, production-ready HTML5 page for the following request: "${prompt}".
Include all CSS within <style> tags and all JavaScript within <script> tags.
Ensure:
- Modern, clean, responsive UI with beautiful color palette and typography
- Valid HTML5 structure
- Interactive JavaScript functionality
- Return ONLY the complete HTML code wrapped inside \`\`\`html ... \`\`\` block.`;

    try {
      const res = await sendChatMessage({
        mode: 'web-pro',
        messages: [{ id: '1', role: 'user', content: fullPrompt, timestamp: Date.now() }],
      });

      // Extract code from response
      const codeMatch = res.text.match(/```(?:html)?\n([\s\S]*?)```/i);
      if (codeMatch && codeMatch[1]) {
        setCode(codeMatch[1].trim());
      } else if (res.text.includes('<!DOCTYPE') || res.text.includes('<html')) {
        setCode(res.text.trim());
      } else {
        setCode(`<!-- AI Note: ${res.text} -->\n${code}`);
      }
      setActiveTab('preview');
    } catch (err: any) {
      setErrorMessage(err.message || 'ওয়েবসাইট জেনারেট করতে সমস্যা হয়েছে।');
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
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-5 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            ওয়েব প্রো (Web Pro Sandbox)
          </h1>
          <p className="text-xs text-slate-400">
            সম্পূর্ণ এইচটিএমএল/সিএসএস/জেএস ওয়েবসাইট তৈরি এবং লাইভ স্যান্ডবক্স প্রিভিউ।
          </p>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'preview'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>প্রিভিউ</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'code'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>সোর্স কোড</span>
          </button>
        </div>
      </div>

      {/* AI Prompt Input Bar */}
      <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-3 shadow-md space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateWebsite()}
            placeholder="কেমন ওয়েবসাইট বানাতে চান? যেমন: 'একটি আধুনিক রেস্টুরেন্ট ল্যান্ডিং পেজ বানাও'..."
            className="flex-1 rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleGenerateWebsite}
            disabled={isLoading || !prompt.trim()}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 shrink-0 ${
              isLoading || !prompt.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>বিল্ড হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>জেনারেট করুন</span>
              </>
            )}
          </button>
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400 pt-1">
          <span className="shrink-0 text-slate-500">আইডিয়া:</span>
          {['ক্যালকুলেটর অ্যাপ', 'পোর্টফোলিও সাইট', 'টু-ডু লিস্ট', 'কোট জেনারেটর'].map((item, i) => (
            <button
              key={i}
              onClick={() => setPrompt(`একটি সুন্দর ${item} বানাও`)}
              className="whitespace-nowrap hover:text-emerald-400 bg-slate-800/80 px-2 py-0.5 rounded transition"
            >
              {item}
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

      {/* Main Sandbox Stage */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d121f] overflow-hidden shadow-2xl">
        {/* Stage top toolbar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-slate-400 text-[11px]">sandbox://preview</span>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'preview' && (
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  title="ডেস্কটপ ভিউ"
                  className={`p-1 rounded ${
                    previewMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  title="মোবাইল ভিউ"
                  className={`p-1 rounded ${
                    previewMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleCopyCode}
              title="কোড কপি"
              className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে' : 'কোড কপি'}</span>
            </button>
          </div>
        </div>

        {/* Content Body: Preview or Code */}
        {activeTab === 'preview' ? (
          <div className="flex items-center justify-center p-4 bg-slate-950/60 min-h-[480px]">
            <div
              className={`transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-white ${
                previewMode === 'mobile' ? 'w-[360px] h-[580px]' : 'w-full h-[580px]'
              }`}
            >
              <iframe
                title="Web Pro Sandbox"
                srcDoc={code}
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        ) : (
          <div className="p-3">
            <textarea
              rows={22}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full font-mono text-xs sm:text-sm bg-transparent text-slate-200 focus:outline-none resize-y leading-relaxed p-2"
            />
          </div>
        )}
      </div>
    </div>
  );
};
