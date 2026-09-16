import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { AIModeId } from '../types';
import { AI_MODES } from '../data/modes';

interface AIToolsViewProps {
  onSelectMode: (modeId: AIModeId) => void;
}

export const AIToolsView: React.FC<AIToolsViewProps> = ({ onSelectMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'সবগুলো টুলস' },
    { id: 'coding', label: 'কোডিং ও ডেভেলপমেন্ট' },
    { id: 'web', label: 'ওয়েব ও ফ্রন্টএন্ড' },
    { id: 'creation', label: 'ডিজাইন ও ডেটা' },
    { id: 'learning', label: 'শিক্ষা ও লেখালেখি' },
    { id: 'productivity', label: 'প্রোডাক্টিভিটি' },
  ];

  const toolsList = AI_MODES.filter((m) => m.id !== 'home' && m.id !== 'ai-tools' && m.id !== 'history' && m.id !== 'settings');

  const filteredTools = toolsList.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.banglaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          স্পেশালাইজড এআই মোড ও টুলস
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          আপনার কাজের ধরণ অনুযায়ী প্রস্তুতকৃত ১২+ আধুনিক AI ওয়ার্কস্পেস
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="টুল অনুসন্ধান করুন..."
            className="w-full rounded-xl bg-[#0f172a] border border-slate-800 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onSelectMode(tool.id)}
            className="group flex flex-col justify-between rounded-2xl bg-[#0f172a] hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 p-4 transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {tool.banglaName}
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono">{tool.name}</div>
                </div>
                {tool.badge && (
                  <span className="shrink-0 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    {tool.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300/80 leading-relaxed mb-4">
                {tool.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 capitalize">{tool.category}</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                ওয়ার্কস্পেস খুলুন <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
