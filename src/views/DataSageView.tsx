import React, { useState, useMemo } from 'react';
import {
  LineChart as ChartIcon,
  Upload,
  Table as TableIcon,
  Sparkles,
  BarChart2,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { sendChatMessage } from '../services/ai/aiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

const SAMPLE_CSV = `মাস,বিক্রি_টাকা,অর্ডার_সংখ্যা,লাভ_টাকা
জানুয়ারি,45000,120,9500
ফেব্রুয়ারি,52000,145,11200
মার্চ,61000,170,14500
এপ্রিল,58000,160,13000
মে,72000,195,18200
জুন,85000,230,22500`;

export const DataSageView: React.FC = () => {
  const [rawData, setRawData] = useState(SAMPLE_CSV);
  const [outputAnalysis, setOutputAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'chart' | 'ai'>('table');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse CSV into headers and rows
  const parsedData = useMemo(() => {
    try {
      if (!rawData.trim()) return { headers: [], rows: [] };

      // Check if JSON
      if (rawData.trim().startsWith('[') || rawData.trim().startsWith('{')) {
        const json = JSON.parse(rawData);
        const array = Array.isArray(json) ? json : [json];
        if (array.length === 0) return { headers: [], rows: [] };
        const headers = Object.keys(array[0]);
        const rows = array.map((item) => headers.map((h) => String(item[h] ?? '')));
        return { headers, rows };
      }

      // Parse CSV
      const lines = rawData.trim().split('\n').filter((l) => l.trim().length > 0);
      if (lines.length === 0) return { headers: [], rows: [] };

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const rows = lines.slice(1).map((line) =>
        line.split(',').map((cell) => cell.trim().replace(/^["']|["']$/g, ''))
      );
      return { headers, rows };
    } catch (e) {
      return { headers: [], rows: [] };
    }
  }, [rawData]);

  // Compute numeric columns for chart
  const numericColumns = useMemo(() => {
    if (parsedData.headers.length === 0 || parsedData.rows.length === 0) return [];
    return parsedData.headers
      .map((header, idx) => {
        const isNumeric = parsedData.rows.every(
          (row) => row[idx] !== undefined && !isNaN(Number(row[idx]))
        );
        return isNumeric ? { header, index: idx } : null;
      })
      .filter(Boolean) as { header: string; index: number }[];
  }, [parsedData]);

  const [selectedNumCol, setSelectedNumCol] = useState<number>(1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawData(reader.result as string);
    };
    reader.readAsText(file);
  };

  const handleRunAIAnalysis = async () => {
    if (!rawData.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    const prompt = `Perform a comprehensive data analysis on this dataset:

\`\`\`csv
${rawData.slice(0, 4000)}
\`\`\`

Provide:
1. 📊 ডেটাসেটের সারসংক্ষেপ (Summary & Shape: Rows, Columns, Types)
2. 📈 মূল পরিসংখ্যান (Key Metrics, Min, Max, Average)
3. 🔍 মূল ট্রেন্ড ও অন্তর্দৃষ্টি (Core Trends & Anomalies)
4. 💡 ব্যবসায়িক বা প্রায়োগিক সুপারিশ (Actionable Recommendations)
5. 📋 উপযোগি চার্ট ও এক্সেল/এসকিউএল ফর্মুলা (Recommended Visualizations & Formulas)`;

    try {
      const res = await sendChatMessage({
        mode: 'data-sage',
        messages: [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
      });
      setOutputAnalysis(res.text);
      setActiveTab('ai');
    } catch (err: any) {
      setErrorMessage(err.message || 'ডেটা বিশ্লেষণ ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-emerald-400" />
            ডাটা সেইজ (Data Sage)
          </h1>
          <p className="text-xs text-slate-400">
            CSV ও JSON ডেটাসেট বিশ্লেষণ, কলাম টেবিল এবং ইন্টারঅ্যাক্টিভ চার্ট ভিজ্যুয়ালাইজেশন।
          </p>
        </div>

        {/* Upload Button */}
        <label className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 cursor-pointer transition">
          <Upload className="w-3.5 h-3.5 text-emerald-400" />
          <span>CSV/JSON আপলোড</span>
          <input
            type="file"
            accept=".csv,.json,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Raw Data Input */}
      <div className="rounded-2xl bg-[#0d121f] border border-slate-800 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            CSV বা JSON ডেটা:
          </label>
          <span className="text-[11px] text-slate-500 font-mono">
            {parsedData.rows.length} সারি • {parsedData.headers.length} কলাম
          </span>
        </div>

        <textarea
          rows={5}
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
          placeholder="এখানে CSV বা JSON ডেটা পেস্ট করুন..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
        />

        <div className="flex justify-end pt-1">
          <button
            onClick={handleRunAIAnalysis}
            disabled={isLoading || !rawData.trim()}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 ${
              isLoading || !rawData.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI বিশ্লেষণ করছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI বিশ্লেষণ ও রিপোর্ট পান</span>
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

      {/* Tabs: Table View / Chart View / AI Report */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'table' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>ডেটা টেবিল ({parsedData.rows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'chart' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>ভিজ্যুয়াল চার্ট</span>
          </button>

          {outputAnalysis && (
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'ai' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI রিপোর্ট</span>
            </button>
          )}
        </div>

        {/* Tab 1: Table */}
        {activeTab === 'table' && (
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] overflow-x-auto shadow-md">
            {parsedData.headers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">কোনো বৈধ ডেটা পাওয়া যায়নি</div>
            ) : (
              <table className="w-full text-left text-xs text-slate-200 divide-y divide-slate-800">
                <thead className="bg-slate-900/90 text-emerald-400 font-semibold uppercase tracking-wider">
                  <tr>
                    {parsedData.headers.map((h, i) => (
                      <th key={i} className="px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {parsedData.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap font-mono text-[12px]">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Visual Chart */}
        {activeTab === 'chart' && (
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 space-y-4 shadow-xl">
            {numericColumns.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                চার্ট তৈরির জন্য অন্তত একটি কলামে সংখ্যাবাচক মান প্রয়োজন।
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">কলাম নির্বাচন:</span>
                  <select
                    value={selectedNumCol}
                    onChange={(e) => setSelectedNumCol(Number(e.target.value))}
                    className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs text-white"
                  >
                    {numericColumns.map((col) => (
                      <option key={col.index} value={col.index}>
                        {col.header}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SVG Bar Chart */}
                <div className="space-y-3 pt-2">
                  {(() => {
                    const values = parsedData.rows.map((r) => Number(r[selectedNumCol]) || 0);
                    const maxVal = Math.max(...values, 1);
                    return parsedData.rows.map((row, i) => {
                      const label = row[0] || `সারি ${i + 1}`;
                      const val = Number(row[selectedNumCol]) || 0;
                      const pct = Math.round((val / maxVal) * 100);
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono text-slate-300">
                            <span>{label}</span>
                            <span className="font-bold text-emerald-400">{val.toLocaleString()}</span>
                          </div>
                          <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 3: AI Report */}
        {activeTab === 'ai' && outputAnalysis && (
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-2xl">
            <MarkdownRenderer content={outputAnalysis} />
          </div>
        )}
      </div>
    </div>
  );
};
