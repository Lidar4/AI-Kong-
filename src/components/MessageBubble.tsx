import React, { useState } from 'react';
import { Bot, User, Copy, Check, RotateCw, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AI_MODES } from '../data/modes';

interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: () => void;
  isLatest?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const modeObj = AI_MODES.find((m) => m.id === message.mode);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const formatTime = (ts: number) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`group relative flex gap-3 my-3 text-left transition-all ${
        isUser ? 'flex-row-reverse pl-8 sm:pl-16' : 'flex-row pr-6 sm:pr-14'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white'
            : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white ring-1 ring-emerald-400/30'
        }`}
      >
        {isUser ? <User className="h-4 w-4 sm:h-5 sm:w-5" /> : <Bot className="h-4 w-4 sm:h-5 sm:w-5" />}
      </div>

      {/* Bubble Container */}
      <div className={`relative max-w-full overflow-hidden rounded-2xl p-4 shadow-sm ${
        isUser
          ? 'bg-indigo-600/90 text-white rounded-tr-xs'
          : message.isError
          ? 'bg-rose-950/40 border border-rose-800/80 text-rose-200 rounded-tl-xs'
          : 'bg-[#0f172a] border border-slate-800 text-slate-100 rounded-tl-xs'
      }`}>
        {/* Header with Mode Name & Time */}
        <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px] opacity-75">
          <span className="font-semibold tracking-wide flex items-center gap-1.5">
            {isUser ? 'আপনি' : 'সর্বকাজ AI বন্ধু'}
            {!isUser && modeObj && (
              <span className="rounded bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 text-[10px] font-medium border border-emerald-500/20">
                {modeObj.banglaName}
              </span>
            )}
          </span>
          <span>{formatTime(message.timestamp)}</span>
        </div>

        {/* Attachments preview if any */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {message.attachments.map((att) => (
              <div key={att.id} className="overflow-hidden rounded-lg border border-slate-700/60 bg-black/30 p-1.5 text-xs">
                {att.data && att.mimeType.startsWith('image/') ? (
                  <img
                    src={att.data}
                    alt={att.name}
                    className="max-h-48 max-w-xs rounded object-contain"
                  />
                ) : (
                  <span className="font-mono text-[11px] text-slate-300">📄 {att.name}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Message Content */}
        {message.isError ? (
          <div className="flex items-start gap-2.5 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-rose-300">{message.content}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-900/60 px-2.5 py-1 text-xs font-semibold text-rose-200 hover:bg-rose-800 transition"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  পুনরায় চেষ্টা করুন (Retry)
                </button>
              )}
            </div>
          </div>
        ) : isUser ? (
          <div className="whitespace-pre-wrap leading-relaxed text-[14.5px]">{message.content}</div>
        ) : (
          <div className="text-[14.5px]">
            <MarkdownRenderer content={message.content} />
          </div>
        )}

        {/* Action Toolbar */}
        {!message.isError && (
          <div className="mt-2.5 flex items-center justify-end gap-1.5 pt-1 border-t border-slate-800/40 text-xs">
            <button
              onClick={handleCopy}
              aria-label="বার্তা কপি করুন"
              title="কপি"
              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="text-[11px]">কপি</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
