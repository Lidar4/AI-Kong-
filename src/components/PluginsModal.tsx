import React from 'react';
import { X, Cpu, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface PluginsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const PluginsModal: React.FC<PluginsModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  if (!isOpen) return null;

  const plugins = [
    {
      id: 'task_planner',
      name: 'স্মার্ট প্ল্যানার ও রোডম্যাপ',
      icon: '📋',
      badge: 'ChatGPT-স্টাইল প্ল্যানিং',
      description: 'যেকোনো লক্ষ্য, প্রজেক্ট, দৈনন্দিন রুটিন বা পড়ার সিলেবাসের জন্য ধাপে ধাপে মাইলস্টোন, প্রায়োরিটি ও সময়সীমা নির্ধারণ করে দেয়া।',
      samplePrompt: 'একটি আধুনিক ফুল-স্ট্যাক ওয়েবসাইট শেখার জন্য ৩০ দিনের একটি পূর্ণাঙ্গ স্টেপ-বাই-স্টেপ রোডম্যাপ ও টাস্ক প্ল্যান তৈরি করে দাও।',
      features: ['মাইলস্টোন ট্র্যাকিং', 'প্রায়োরিটি লেভেল', 'সময়সীমা অনুমান'],
    },
    {
      id: 'math_runner',
      name: 'গণিত ও কোড রানার',
      icon: '🧮',
      badge: 'স্যান্ডবক্স ইঞ্জিন',
      description: 'জটিল গাণিতিক হিসাব, অ্যালগরিদম ও জাভাস্ক্রিপ্ট স্ক্রিপ্ট কোনো বাহ্যিক API ছাড়াই ব্যাকএন্ডে নিরাপদ স্যান্ডবক্সে এক্সিকিউট করে নির্ভুল ফলাফল বের করা।',
      samplePrompt: 'Math.sin(Math.PI / 4) * 100 এবং ফিবোনাচ্চি সিরিজের প্রথম ১০টি পদ কোড রান করে নির্ভুল ফলাফল হিসাব করে দাও।',
      features: ['অ্যালগরিদম এক্সিকিউশন', 'ফর্মুলা সলভার', 'জিরো এপিআই রিকোয়ারমেন্ট'],
    },
    {
      id: 'text_analyzer',
      name: 'টেক্সট ও ডেটা অ্যানালাইজার',
      icon: '📊',
      badge: 'ইনসাইট ইঞ্জিন',
      description: 'যেকোনো টেক্সট, রচনা বা JSON/CSV ডেটার দৈর্ঘ্য, শব্দ সংখ্যা, রিডিং টাইম এবং স্ট্রাকচারাল ভ্যালিডেশন তাৎক্ষণিক চেক করা।',
      samplePrompt: 'এই লেখার মোট শব্দ সংখ্যা, অক্ষর সংখ্যা এবং এটি পড়তে আনুমানিক কত মিনিট লাগবে তা অ্যানালাইজ করে দাও: "তথ্যপ্রযুক্তি এবং কৃত্রিম বুদ্ধিমত্তা বর্তমান যুগে প্রতিটি পেশায় বৈপ্লবিক পরিবর্তন আনছে।"',
      features: ['শব্দ ও অক্ষর কাউন্ট', 'রিডিং টাইম এস্টিমেট', 'JSON ফরম্যাট ভ্যালিডেশন'],
    },
    {
      id: 'smart_converter',
      name: 'স্মার্ট মেজারমেন্ট কনভার্টার',
      icon: '🔄',
      badge: 'ইউনিট ক্যালকুলেটর',
      description: 'দৈর্ঘ্য, ওজন, তাপমাত্রা, ডিজিটাল স্টোরেজ (GB/MB/KB) সহ বিভিন্ন এককের মধ্যকার দ্রুত নির্ভুল রূপান্তর।',
      samplePrompt: '২৫ মাইলকে কিলোমিটারে এবং ৮৫ ফারেনহাইটকে সেলসিয়াসে কনভার্ট করে মান ও হিসাব বুঝিয়ে দাও।',
      features: ['দৈর্ঘ্য ও ওজন রূপান্তর', 'ডিজিটাল ডাটা কনভার্সন', 'সেলসিয়াস/ফারেনহাইট ক্যালকুলেশন'],
    },
    {
      id: 'self_code',
      name: 'সেলফ-কোড আর্কিটেকচার',
      icon: '⚡',
      badge: 'সরাসরি কোড এডিটর',
      description: 'এই ওয়েবসাইটের সোর্স কোড (src/App.tsx ইত্যাদি) নিজে পড়ে নেওয়া এবং ব্যবহারকারীর ইচ্ছা অনুযায়ী বাটন, রঙ বা ফিচার সরাসরি কোড লিখে পরিবর্তন করা।',
      samplePrompt: 'অ্যাপের সোর্স কোড পরীক্ষা করে উপরের ব্যানারে একটি সুন্দর "স্মার্ট বাংলা চ্যাটবট" স্ট্যাটাস ব্যাজ যোগ করো।',
      features: ['ফাইল রিড ও রাইট', 'অটোমেটিক বিল্ড ফ্রেন্ডলি', 'রিয়েল-টাইম লাইভ আপডেট'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-slate-100">
                  প্লাগইন ও টুলস হাব
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                  ৫টি বিল্ট-ইন প্লাগইন
                </span>
              </div>
              <p className="text-xs text-slate-400">
                কোনো এক্সটার্নাল API ছাড়াই চ্যাটবটের ভেতর স্বয়ংক্রিয়ভাবে কাজ করে
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plugin List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 divide-y divide-slate-800/60">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="pt-3.5 first:pt-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{plugin.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-200">
                        {plugin.name}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                        {plugin.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {plugin.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectPrompt(plugin.samplePrompt);
                    onClose();
                  }}
                  className="shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 transition-all active:scale-95"
                >
                  <span>পরীক্ষা করুন</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Badges / capabilities */}
              <div className="mt-2.5 flex flex-wrap gap-1.5 pl-8 sm:pl-9">
                {plugin.features.map((feat, fIdx) => (
                  <span
                    key={fIdx}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800/80"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>AI স্বয়ংক্রিয়ভাবে কথা অনুযায়ী উপযুক্ত প্লাগইন ডেকে নেয়</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            ঠিক আছে
          </button>
        </div>
      </div>
    </div>
  );
};
