import React, { useState, useEffect } from 'react';
import { X, FileCode, Check, Copy, RefreshCw, Sparkles, Folder, File, AlertCircle } from 'lucide-react';
import { getWorkspaceFiles, getWorkspaceFileContent, getWorkspaceHistory } from '../services/ai/aiService';

interface CodeExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightedFile?: string | null;
}

export const CodeExplorerModal: React.FC<CodeExplorerModalProps> = ({
  isOpen,
  onClose,
  highlightedFile,
}) => {
  const [files, setFiles] = useState<Array<{ path: string; size: number; modified: number }>>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{ filePath: string; explanation: string; timestamp: number }>>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    loadFiles();
    loadHistory();
  }, [isOpen]);

  useEffect(() => {
    if (highlightedFile) {
      setSelectedFile(highlightedFile);
      loadFileContent(highlightedFile);
    }
  }, [highlightedFile]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const fileList = await getWorkspaceFiles();
      setFiles(fileList);
      if (!selectedFile && fileList.length > 0) {
        const initial = highlightedFile || (fileList.find((f) => f.path === 'src/App.tsx')?.path || fileList[0].path);
        setSelectedFile(initial);
        loadFileContent(initial);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const hist = await getWorkspaceHistory();
      setHistory(hist);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFileContent = async (path: string) => {
    try {
      setLoading(true);
      const content = await getWorkspaceFileContent(path);
      setFileContent(content);
    } catch (err) {
      console.error(err);
      setFileContent('// এই ফাইলটির কনটেন্ট লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = (path: string) => {
    setSelectedFile(path);
    loadFileContent(path);
  };

  const handleCopy = () => {
    if (!fileContent) return;
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (!isOpen) return null;

  const modifiedPaths = new Set(history.map((h) => h.filePath));
  const filteredFiles = files.filter((f) => f.path.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                প্রজেক্ট সোর্স কোড এক্সপ্লোরার
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  সেলফ-কোড সক্রিয়
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                AI বন্ধু সরাসরি যে কোড পরিবর্তন করে তা এখানে দেখুন ও যাচাই করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReload}
              title="নতুন কোড কার্যকর করতে রিলোড করুন"
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              অ্যাপ রিলোড
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Sidebar */}
          <div className="w-72 border-r border-slate-800 bg-slate-950/60 flex flex-col">
            <div className="p-3 border-b border-slate-800">
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="ফাইল খুঁজুন..."
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* AI Change Log Header */}
            {history.length > 0 && (
              <div className="px-3 py-2 bg-emerald-950/20 border-b border-emerald-900/30">
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI দ্বারা পরিবর্তিত ফাইল ({history.length})
                </div>
              </div>
            )}

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile === file.path;
                const isModifiedByAI = modifiedPaths.has(file.path);

                return (
                  <button
                    key={file.path}
                    onClick={() => handleSelectFile(file.path)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <File className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{file.path}</span>
                    </div>
                    {isModifiedByAI && (
                      <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        AI
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* Viewer Header */}
            <div className="px-4 py-2.5 border-b border-slate-850 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="font-mono text-emerald-400 font-medium">{selectedFile || 'ফাইল নির্বাচন করুন'}</span>
                {modifiedPaths.has(selectedFile) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    AI এই ফাইলে কোড পরিবর্তন করেছে
                  </span>
                )}
              </div>

              <button
                onClick={handleCopy}
                disabled={!fileContent}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'কপি হয়েছে' : 'কোড কপি'}
              </button>
            </div>

            {/* Code Body */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 bg-slate-950 leading-relaxed select-text">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  কোড লোড হচ্ছে...
                </div>
              ) : (
                <pre className="whitespace-pre">
                  <code>{fileContent}</code>
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div>
            💡 চ্যাটবটকে সরাসরি বলতে পারেন: <span className="text-emerald-400 font-mono">"এই অ্যাপের কালার পরিবর্তন করো"</span> বা <span className="text-emerald-400 font-mono">"হোমপেজের লেখা পরিবর্তন করো"</span>।
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
