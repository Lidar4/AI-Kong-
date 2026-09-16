import React, { useEffect, useRef } from 'react';
import { ChatMessage, AIModeId, Attachment, Conversation } from '../types';
import { MessageBubble } from '../components/MessageBubble';
import { MessageComposer } from '../components/MessageComposer';
import { AI_MODES } from '../data/modes';
import { Sparkles, Trash2, Bot } from 'lucide-react';

interface ChatViewProps {
  messages?: ChatMessage[];
  conversation?: Conversation;
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  isLoading?: boolean;
  isSending?: boolean;
  activeMode?: AIModeId;
  onChangeMode?: (mode: AIModeId) => void;
  status?: 'Ready' | 'Thinking' | 'Generating' | 'Error';
  onClearChat?: () => void;
  onRetryLast?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  conversation,
  onSendMessage,
  isLoading = false,
  isSending = false,
  activeMode,
  onChangeMode = () => {},
  status,
  onClearChat = () => {},
  onRetryLast,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeMessages = messages || conversation?.messages || [];
  const isBusy = Boolean(isLoading || isSending);
  const currentMode = activeMode || conversation?.selectedMode || 'chat';
  const currentStatus = status || (isBusy ? 'Generating' : 'Ready');
  const activeModeObj = AI_MODES.find((m) => m.id === currentMode) || AI_MODES[1];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages, isBusy]);

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto overflow-hidden">
      {/* Top chat bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-[#090d16]/70 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Bot className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white leading-none">
              {activeModeObj.banglaName}
            </h2>
            <span className="text-[10px] text-slate-400">
              {activeModeObj.description}
            </span>
          </div>
        </div>

        {activeMessages.length > 0 && (
          <button
            onClick={onClearChat}
            title="নতুন চ্যাট শুরু করুন"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/60 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">চ্যাট মুছুন</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4">
        {activeMessages.length === 0 ? (
          /* Empty state with helpful prompt cards */
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto space-y-5 px-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg ring-4 ring-emerald-500/10">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{activeModeObj.banglaName}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {activeModeObj.description}
              </p>
            </div>

            {activeModeObj.quickPrompts.length > 0 && (
              <div className="w-full space-y-2 pt-2">
                <div className="text-[11px] font-semibold text-slate-400 text-left px-1">
                  প্রস্তাবিত প্রশ্ন বা প্রম্পট:
                </div>
                <div className="space-y-1.5">
                  {activeModeObj.quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => onSendMessage(prompt, [])}
                      className="w-full rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 p-2.5 text-left text-xs text-slate-200 transition active:scale-[0.99] flex items-center justify-between group"
                    >
                      <span className="truncate">{prompt}</span>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          activeMessages.map((msg, index) => (
            <MessageBubble
              key={msg.id || index}
              message={msg}
              onRetry={index === activeMessages.length - 1 && msg.isError ? onRetryLast : undefined}
            />
          ))
        )}

        {isBusy && (
          <div className="flex items-center gap-3 text-slate-400 text-xs py-2 px-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI বন্ধু ভাবছে এবং উত্তর প্রস্তুত করছে...</span>
          </div>
        )}
      </div>

      {/* Message Composer Area */}
      <div className="shrink-0 border-t border-slate-800/80 bg-[#090d16]">
        <MessageComposer
          onSendMessage={onSendMessage}
          isLoading={isBusy}
          activeMode={currentMode}
          onChangeMode={onChangeMode}
          status={currentStatus}
          onClearChat={onClearChat}
        />
      </div>
    </div>
  );
};
