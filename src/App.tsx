import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Settings,
  Code2,
  Sparkles,
  Send,
  Paperclip,
  X,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Menu,
  RotateCcw,
  Search,
  ExternalLink,
  Bot,
  User,
  ShieldCheck,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { Conversation, ChatMessage, Attachment, UserSettings, CodeChangeRecord } from './types';
import {
  getStoredConversations,
  getStoredConversationById,
  createNewConversation,
  updateConversationMessages,
  getStoredSettings,
  saveStoredConversations,
  saveStoredSettings,
} from './services/storage/chatStorage';
import { sendChatMessage, checkSystemHealth } from './services/ai/aiService';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { VoiceButton } from './components/VoiceButton';
import { CodeExplorerModal } from './components/CodeExplorerModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => getStoredConversations());
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(() => {
    const list = getStoredConversations();
    return list.length > 0 ? list[0] : null;
  });

  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Modals
  const [codeExplorerOpen, setCodeExplorerOpen] = useState(false);
  const [highlightedCodeFile, setHighlightedCodeFile] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, isSending, scrollToBottom]);

  // Create new conversation
  const handleNewChat = useCallback(() => {
    const newConv = createNewConversation('ai-chat');
    setCurrentConversation(newConv);
    setConversations(getStoredConversations());
    setSidebarOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  // Select conversation
  const handleSelectConversation = (id: string) => {
    const conv = getStoredConversationById(id);
    if (conv) {
      setCurrentConversation(conv);
      setSidebarOpen(false);
    }
  };

  // Delete conversation
  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    saveStoredConversations(updated);

    if (currentConversation?.id === id) {
      if (updated.length > 0) {
        setCurrentConversation(updated[0]);
      } else {
        const newConv = createNewConversation('ai-chat');
        setCurrentConversation(newConv);
        setConversations([newConv]);
      }
    }
  };

  // Clear current chat
  const handleClearCurrentChat = () => {
    if (!currentConversation) return;
    updateConversationMessages(currentConversation.id, []);
    setCurrentConversation({ ...currentConversation, messages: [] });
    setConversations(getStoredConversations());
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        const newAttachment: Attachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          mimeType: file.type || 'text/plain',
          status: 'ready',
          data: isImage ? result : undefined,
          text: !isImage ? result : undefined,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputMessage).trim();
    if ((!text && attachments.length === 0) || isSending) return;

    let activeConv = currentConversation;
    if (!activeConv) {
      activeConv = createNewConversation('ai-chat');
      setCurrentConversation(activeConv);
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: text || '(সংযুক্ত ফাইল পাঠানো হয়েছে)',
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    const updatedMessages = [...(activeConv.messages || []), userMessage];
    updateConversationMessages(activeConv.id, updatedMessages);
    setCurrentConversation({ ...activeConv, messages: updatedMessages });
    setConversations(getStoredConversations());

    setInputMessage('');
    setAttachments([]);
    setIsSending(true);

    try {
      const result = await sendChatMessage({
        messages: updatedMessages,
        mode: 'ai-chat',
        model: settings.activeModel || 'gemini-3.6-flash',
        apiKey: settings.customGeminiKey,
        attachments: userMessage.attachments,
        enableSelfCode: true,
      });

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: result.text,
        timestamp: Date.now(),
        model: result.model,
        codeChanges: result.codeChanges,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      updateConversationMessages(activeConv.id, finalMessages);
      setCurrentConversation({ ...activeConv, messages: finalMessages });
      setConversations(getStoredConversations());
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `⚠️ ক্ষমা করবেন, উত্তর তৈরি করার সময় একটি সমস্যা হয়েছে:\n\n> ${err.message || 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।'}\n\nআপনি চাইলে উপরের **সেটিংস** আইকনে ক্লিক করে আপনার Gemini API কী বা মডেল পরীক্ষা করে নিতে পারেন।`,
        timestamp: Date.now(),
        isError: true,
      };

      const finalMessages = [...updatedMessages, errorMessage];
      updateConversationMessages(activeConv.id, finalMessages);
      setCurrentConversation({ ...activeConv, messages: finalMessages });
      setConversations(getStoredConversations());
    } finally {
      setIsSending(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  // Key press handler (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message text
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text-to-speech
  const handleToggleSpeak = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`_]/g, ''));
      utterance.lang = settings.voiceLanguage || 'bn-BD';
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Open Code Explorer to inspect a file
  const handleInspectCode = (filePath: string) => {
    setHighlightedCodeFile(filePath);
    setCodeExplorerOpen(true);
  };

  const filteredConversations = conversations.filter((c) =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const starterPrompts = [
    {
      title: 'সাধারণ সাহায্য ও পরামর্শ',
      desc: 'পড়াশোনা ও দৈনন্দিন কাজের জন্য একটি ভারসাম্যপূর্ণ ডেইলি রুটিন তৈরি করে দাও।',
      icon: '💬',
    },
    {
      title: 'সেলফ-কোডিং পরীক্ষা (থিম বদল)',
      desc: 'এই ওয়েবসাইটের সোর্স কোড পরীক্ষা করে অ্যাপের ডিজাইন ও কালার আরও আকর্ষণীয় করতে পরিবর্তন করো।',
      icon: '🎨',
    },
    {
      title: 'প্রোগ্রামিং ও টেক সমাধান',
      desc: 'পাইথনে ডাটা ফিল্টারিং এবং রিঅ্যাক্টে স্টেট ম্যানেজমেন্টের মূল পার্থক্য কী উদাহরণসহ বুঝিয়ে দাও।',
      icon: '💻',
    },
    {
      title: 'সেলফ-কোডিং: নতুন ফিচার',
      desc: 'হেডারের পাশে একটি সুন্দর আজকের বাংলা ও ইংরেজি তারিখ প্রদর্শনের কোড অ্যাপে যুক্ত করো।',
      icon: '⚡',
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
      {/* Code Explorer Modal */}
      <CodeExplorerModal
        isOpen={codeExplorerOpen}
        onClose={() => setCodeExplorerOpen(false)}
        highlightedFile={highlightedCodeFile}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
      />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-950/40">
              <Bot className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-100 leading-tight">সর্বকাজ AI বন্ধু</h1>
              <p className="text-[11px] text-emerald-400 font-medium">সেলফ-কোডিং চ্যাটবট</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            নতুন চ্যাট শুরু করুন
          </button>
        </div>

        {/* Search Chats */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="চ্যাট খুঁজুন..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            পূর্বের আলাপচারিতা ({filteredConversations.length})
          </div>

          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              কোনো সংরক্ষিত চ্যাট নেই
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = currentConversation?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-emerald-300 font-medium border border-slate-800'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-6">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="truncate">{conv.title || 'নতুন আলাপ'}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    title="চ্যাট মুছে ফেলুন"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-1.5">
          <button
            onClick={() => {
              setHighlightedCodeFile(null);
              setCodeExplorerOpen(true);
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2.5 transition-colors"
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>সোর্স কোড এক্সপ্লোরার</span>
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2.5 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>চ্যাটবট সেটিংস</span>
          </button>

          <div className="px-2 pt-2 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              অনলাইন
            </span>
            <span className="font-mono text-emerald-500/80">Gemini 3.6 Flash</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-[#090d16] overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-14 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-100">
                  {currentConversation?.title || 'সর্বকাজ AI বন্ধু'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  <Sparkles className="w-2.5 h-2.5" />
                  সেলফ-কোড সক্রিয়
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                সহজ, দ্রুত ও নিজের কোড পরিবর্তন করতে সক্ষম চ্যাটবট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setHighlightedCodeFile(null);
                setCodeExplorerOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              সোর্স কোড
            </button>

            <button
              onClick={handleClearCurrentChat}
              title="বর্তমান চ্যাট মুছুন"
              className="p-2 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              title="সেটিংস"
              className="p-2 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Message Scroll View */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
          {(!currentConversation?.messages || currentConversation.messages.length === 0) ? (
            /* Welcome Empty State */
            <div className="max-w-2xl mx-auto my-auto text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-teal-400/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-xl shadow-emerald-950/30">
                <Bot className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-bold text-slate-100 mb-2">
                স্বাগতম! আমি সর্বকাজ AI বন্ধু
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                একটি সহজ, গোছানো ও শক্তিশালী বাংলা AI চ্যাটবট। আমি আপনার যেকোনো প্রশ্নের উত্তর দিতে পারি এবং আপনার নির্দেশে <span className="text-emerald-400 font-medium">আমার নিজের সোর্স কোডও পরিবর্তন করতে পারি!</span>
              </p>

              {/* Starter Prompt Cards */}
              <div className="grid sm:grid-cols-2 gap-3 text-left">
                {starterPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.desc)}
                    className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 text-left transition-all group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Messages */
            currentConversation.messages.map((msg) => {
              const isUser = msg.role === 'user';
              const hasCodeChanges = msg.codeChanges && msg.codeChanges.length > 0;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`space-y-2 max-w-[85%] sm:max-w-[78%]`}>
                    {/* User Attachment previews */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 border border-slate-700 flex items-center gap-1.5"
                          >
                            <Paperclip className="w-3 h-3 text-emerald-400" />
                            <span className="truncate max-w-[150px]">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-emerald-600 text-slate-950 font-medium rounded-tr-xs shadow-md shadow-emerald-950/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs shadow-md'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}

                      {/* Self-Code Modification Box (when AI changes code) */}
                      {hasCodeChanges && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-semibold text-emerald-300">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span>AI নিজের সোর্স কোড পরিবর্তন করেছে!</span>
                          </div>

                          <div className="space-y-1.5">
                            {msg.codeChanges!.map((change, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-2 rounded-lg bg-slate-950/70 border border-emerald-900/40 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span className="font-mono text-emerald-300 text-xs truncate">
                                    {change.filePath}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleInspectCode(change.filePath)}
                                  className="shrink-0 px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-medium transition-colors"
                                >
                                  কোড দেখুন
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                            <span>পরিবর্তন দেখতে পেজটি রিলোড করুন:</span>
                            <button
                              onClick={() => window.location.reload()}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors"
                            >
                              রিলোড করুন
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar for Message */}
                    <div className={`flex items-center gap-2 text-[11px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="hover:text-slate-300 flex items-center gap-1 transition-colors"
                        title="টেক্সট কপি করুন"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === msg.id ? 'কপি হয়েছে' : 'কপি'}</span>
                      </button>

                      {!isUser && (
                        <button
                          onClick={() => handleToggleSpeak(msg.id, msg.content)}
                          className="hover:text-slate-300 flex items-center gap-1 transition-colors"
                          title="ভয়েসে শুনুন"
                        >
                          {speakingId === msg.id ? (
                            <VolumeX className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                          <span>{speakingId === msg.id ? 'থামান' : 'শুনুন'}</span>
                        </button>
                      )}

                      <span>•</span>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString('bn-BD', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Thinking / Processing indicator */}
          {isSending && (
            <div className="flex gap-3 max-w-3xl mx-auto items-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>AI বন্ধু উত্তর লিখছে এবং প্রয়োজন হলে কোড বিশ্লেষণ করছে...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Container */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Attachment preview chips */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-1">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-center gap-2"
                  >
                    <Paperclip className="w-3 h-3 text-emerald-400" />
                    <span className="truncate max-w-[180px]">{att.name}</span>
                    <button
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Form */}
            <div className="relative flex items-end gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-2 focus-within:border-emerald-500/50 transition-colors shadow-lg">
              {/* File Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="ফাইল বা ছবি সংযুক্ত করুন"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
              />

              {/* Bengali Voice Recognition Button */}
              <div className="shrink-0">
                <VoiceButton
                  language={settings.voiceLanguage || 'bn-BD'}
                  onTranscript={(transcript) => {
                    setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
                  }}
                  disabled={isSending}
                />
              </div>

              {/* Text Area */}
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="কী জানতে বা পরিবর্তন করতে চান লিখুন... (Enter চাপলে পাঠানো হবে)"
                rows={1}
                className="flex-1 max-h-32 min-h-[38px] py-2 px-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={(!inputMessage.trim() && attachments.length === 0) || isSending}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Hint & Disclaimer */}
            <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>সর্বকাজ AI বন্ধু • প্রশ্নের উত্তরের সাথে নিজের সোর্স কোডও পরিবর্তন করতে সক্ষম।</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
