import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, CheckCircle } from 'lucide-react';
import { ExecutedPluginRecord } from '../types';

interface PluginExecutionBadgeProps {
  plugins: ExecutedPluginRecord[];
}

export const PluginExecutionBadge: React.FC<PluginExecutionBadgeProps> = ({ plugins }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!plugins || plugins.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {plugins.map((plugin, idx) => {
        const isExpanded = expandedIndex === idx;

        return (
          <div
            key={idx}
            className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 overflow-hidden text-xs transition-all"
          >
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-emerald-500/10 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">{plugin.icon || '⚡'}</span>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-emerald-300">
                      {plugin.title}
                    </span>
                    <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">
                      প্লাগইন সক্রিয়
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5">
                    {plugin.summary}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-slate-400 pl-2">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {isExpanded && plugin.details && (
              <div className="px-3 pb-3 pt-1 border-t border-emerald-500/15 bg-slate-950/60 space-y-2">
                {/* Special rendering for Task Planner */}
                {plugin.name === 'create_task_planner' && plugin.details.milestones ? (
                  <div className="space-y-1.5 mt-1">
                    <div className="text-[11px] text-emerald-400 font-medium flex items-center justify-between">
                      <span>মাইলস্টোন ও কর্মপরিকল্পনা:</span>
                      <span>সময়সীমা: {plugin.details.timeframe}</span>
                    </div>
                    <div className="space-y-1">
                      {plugin.details.milestones.map((m: any, mIdx: number) => (
                        <div
                          key={mIdx}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {mIdx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-slate-200 text-xs">
                                {m.step}
                              </span>
                              {m.priority && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                  {m.priority}
                                </span>
                              )}
                            </div>
                            {m.details && (
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {m.details}
                              </p>
                            )}
                            {m.duration && (
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                সময়: {m.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : plugin.name === 'run_math_or_code' ? (
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="text-slate-400">
                      ইনপুট: <span className="text-emerald-300">{plugin.details.input}</span>
                    </div>
                    <div className="text-slate-200">
                      ফলাফল: <span className="text-emerald-400 font-bold">{plugin.details.result}</span>
                    </div>
                  </div>
                ) : (
                  <pre className="text-[10px] text-slate-300 overflow-x-auto p-2 rounded bg-slate-900 font-mono">
                    {JSON.stringify(plugin.details, null, 2)}
                  </pre>
                )}

                <div className="flex items-center gap-1 text-[10px] text-emerald-400/80 pt-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>অভ্যন্তরীণ স্যান্ডবক্সে এক্সিকিউট করা হয়েছে (No External API)</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
