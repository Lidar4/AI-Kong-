import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ChevronDown, RefreshCw } from 'lucide-react';
import { AIModeId, Attachment } from '../types';
import { AI_MODES } from '../data/modes';
import { VoiceButton } from './VoiceButton';
import { FileAttachment } from './FileAttachment';

interface MessageComposerProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  activeMode: AIModeId;
  onChangeMode: (mode: AIModeId) => void;
  status: 'Ready' | 'Thinking' | 'Generating' | 'Error';
  placeholder?: string;
  onClearChat?: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  isLoading,
  activeMode,
  onChangeMode,
  status,
  placeholder,
  onClearChat,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeModeObj = AI_MODES.find((m) => m.id === activeMode) || AI_MODES[1];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!text.trim() && attachments.length === 0) || isLoading) return;

    onSendMessage(text.trim(), attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleAddAttachment = (att: Attachment) => {
    setAttachments((prev) => {
      const idx = prev.findIndex((a) => a.id === att.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = att;
        return next;
      }
      return [...prev, att];
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-3 pt-1">
      {/* Top micro-bar: Mode indicator & Status indicator */}
      <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-400">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowModeDropdown(!showModeDropdown)}
            aria-expanded={showModeDropdown}
            aria-label="মোড পরিবর্তন করুন"
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 text-slate-300 hover:bg-slate-700 transition active:scale-95 border border-slate-700/60"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-emerald-300">{activeModeObj.banglaName}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Mode Dropdown Menu */}
          {showModeDropdown && (
            <div className="absolute bottom-full mb-2 left-0 z-50 w-64 max-h-72 overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 p-1.5 shadow-2xl">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                মোড নির্বাচন করুন
              </div>
              {AI_MODES.filter((m) => m.id !== 'home' && m.id !== 'history' && m.id !== 'settings').map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    onChangeMode(mode.id);
                    setShowModeDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${
                    activeMode === mode.id
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate">
                    <div>{mode.banglaName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{mode.name}</div>
                  </div>
                  {mode.badge && (
                    <span className="rounded bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 text-[10px]">
                      {mode.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status chip */}
        <div className="flex items-center gap-2">
          {onClearChat && (
            <button
              onClick={onClearChat}
              title="নতুন চ্যাট শুরু করুন"
              className="text-[11px] text-slate-400 hover:text-slate-200 transition px-1.5 py-0.5 rounded hover:bg-slate-800/60"
            >
              নতুন বার্তা
            </button>
          )}
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800">
            <span
              className={`h-2 w-2 rounded-full ${
                status === 'Thinking' || status === 'Generating'
                  ? 'bg-amber-400 animate-pulse'
                  : status === 'Error'
                  ? 'bg-rose-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span>
              {status === 'Thinking'
                ? 'ভাবছি...'
                : status === 'Generating'
                ? 'লিখছি...'
                : status === 'Error'
                ? 'ত্রুটি'
                : 'প্রস্তুত'}
            </span>
          </span>
        </div>
      </div>

      {/* Main Composer Box */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl focus-within:border-emerald-500/70 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all"
      >
        <div className="px-3 pt-2.5">
          <textarea
            ref={textareaRef}
            id="chat-message-input"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder || activeModeObj.placeholderText || 'বাংলা, Banglish বা ইংরেজিতে লিখুন...'}
            className="w-full resize-none bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none max-h-44 leading-relaxed"
          />
        </div>

        {/* File preview inside composer */}
        <div className="px-3">
          <FileAttachment
            attachments={attachments}
            onAddAttachment={handleAddAttachment}
            onRemoveAttachment={handleRemoveAttachment}
            disabled={isLoading}
          />
        </div>

        {/* Bottom actions row */}
        <div className="flex items-center justify-between px-2.5 py-2 border-t border-slate-800/60 mt-1">
          <div className="flex items-center gap-1">
            {/* Voice Input */}
            <VoiceButton onTranscript={handleVoiceTranscript} disabled={isLoading} />
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-slate-500">
              Enter ↵ পাঠাতে, Shift+Enter নতুন লাইন
            </span>
            <button
              type="submit"
              id="chat-send-btn"
              disabled={isLoading || (!text.trim() && attachments.length === 0)}
              aria-label="বার্তা পাঠান"
              className={`flex h-9 w-9 items-center justify-center rounded-xl font-medium transition active:scale-95 ${
                !text.trim() && attachments.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
              }`}
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
