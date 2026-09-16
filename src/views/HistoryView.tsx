import React, { useState, useRef } from 'react';
import {
  History,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Download,
  Upload,
  ArrowRight,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Conversation } from '../types';
import {
  exportConversationsAsJson,
  importConversationsFromJson,
  saveStoredConversations,
} from '../services/storage/chatStorage';
import { AI_MODES } from '../data/modes';

interface HistoryViewProps {
  conversations: Conversation[];
  onOpenConversation: (id: string) => void;
  onRefreshConversations: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  conversations,
  onOpenConversation,
  onRefreshConversations,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = conversations.filter((c) =>
    (c.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleStartRename = (c: Conversation) => {
    setEditingId(c.id);
    setEditTitle(c.title || 'নামহীন চ্যাট');
  };

  const handleSaveRename = (id: string) => {
    if (!editTitle.trim()) return;
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, title: editTitle.trim(), updatedDate: Date.now() } : c
    );
    saveStoredConversations(updated);
    setEditingId(null);
    onRefreshConversations();
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই কথোপকথনটি মুছে ফেলতে চান?')) {
      const updated = conversations.filter((c) => c.id !== id);
      saveStoredConversations(updated);
      onRefreshConversations();
    }
  };

  const handleClearAll = () => {
    if (confirm('সতর্কতা: আপনার সকল সংরক্ষিত চ্যাট হিস্ট্রি মুছে যাবে! আপনি কি নিশ্চিত?')) {
      saveStoredConversations([]);
      onRefreshConversations();
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const res = importConversationsFromJson(reader.result as string);
      if (res.success) {
        setImportStatus(`${res.count}টি চ্যাট সফলভাবে রিস্টোর হয়েছে!`);
        onRefreshConversations();
      } else {
        setImportStatus(`এরর: ${res.error}`);
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            আগের কথোপকথন ও ব্যাকআপ (Chat History)
          </h1>
          <p className="text-xs text-slate-400">
            সংরক্ষিত চ্যাট পর্যালোচনা, রিনেম, ব্যাকআপ এক্সপোর্ট ও ডাটা রিস্টোর।
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportConversationsAsJson}
            disabled={conversations.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>JSON এক্সপোর্ট</span>
          </button>

          <label className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>ইম্পোর্ট</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {conversations.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 px-2.5 py-1.5 text-xs font-semibold text-rose-300 transition"
              title="সকল চ্যাট মুছুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Import Status Alert */}
      {importStatus && (
        <div className="rounded-xl bg-emerald-950/40 border border-emerald-800 p-3 text-xs text-emerald-300">
          {importStatus}
        </div>
      )}

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="কথোপকথন খুঁজুন..."
          className="w-full rounded-xl bg-[#0f172a] border border-slate-800 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Conversations List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-10 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-400">
              {search ? 'কোনো মিল পাওয়া যায়নি' : 'এখনও কোনো কথোপকথন সংরক্ষিত নেই'}
            </div>
            <p className="text-xs text-slate-500">
              AI বন্ধুর সাথে চ্যাট শুরু করলেই এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।
            </p>
          </div>
        ) : (
          filtered.map((c) => {
            const modeObj = AI_MODES.find((m) => m.id === c.selectedMode);
            const isEditing = editingId === c.id;

            return (
              <div
                key={c.id}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-[#0f172a] hover:bg-slate-800/80 border border-slate-800 p-3.5 transition shadow-sm"
              >
                <div className="flex items-center gap-3 truncate w-full sm:w-auto">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="truncate flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(c.id)}
                          className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-800 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">
                          {c.title || 'নামহীন চ্যাট'}
                        </span>
                        {modeObj && (
                          <span className="shrink-0 rounded bg-slate-800 text-slate-400 px-1.5 py-0.2 text-[10px]">
                            {modeObj.banglaName}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400">
                      {(c.messages?.length || 0)}টি বার্তা • {new Date(c.updatedDate).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center">
                  {!isEditing && (
                    <button
                      onClick={() => handleStartRename(c)}
                      title="নাম পরিবর্তন"
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(c.id)}
                    title="মুছে ফেলুন"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenConversation(c.id)}
                    className="flex items-center gap-1 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold transition ml-1"
                  >
                    <span>খুলুন</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
