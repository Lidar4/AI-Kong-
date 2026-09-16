import React, { useRef } from 'react';
import { Paperclip, X, FileText, Image as ImageIcon, FileSpreadsheet, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { Attachment } from '../types';

interface FileAttachmentProps {
  attachments: Attachment[];
  onAddAttachment: (attachment: Attachment) => void;
  onRemoveAttachment: (id: string) => void;
  disabled?: boolean;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const attachmentId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const isImage = file.type.startsWith('image/');
      const isText =
        file.type.includes('text') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.json') ||
        file.name.endsWith('.js') ||
        file.name.endsWith('.ts') ||
        file.name.endsWith('.py') ||
        file.name.endsWith('.html') ||
        file.name.endsWith('.css');

      const newAtt: Attachment = {
        id: attachmentId,
        name: file.name,
        size: file.size,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        mimeType: file.type || 'application/octet-stream',
        status: 'processing',
      };

      onAddAttachment(newAtt);

      try {
        if (isImage) {
          const reader = new FileReader();
          reader.onload = () => {
            onAddAttachment({
              ...newAtt,
              data: reader.result as string,
              status: 'ready',
            });
          };
          reader.readAsDataURL(file);
        } else if (isText) {
          const reader = new FileReader();
          reader.onload = () => {
            onAddAttachment({
              ...newAtt,
              text: reader.result as string,
              status: 'ready',
            });
          };
          reader.readAsText(file);
        } else {
          // Binary or unsupported doc fallback
          onAddAttachment({
            ...newAtt,
            text: `[ফাইলটির টেক্সট কনটেন্ট সরাসরি রিড করা সম্ভব হয়নি: ${file.name} (${Math.round(file.size / 1024)} KB)]`,
            status: 'ready',
          });
        }
      } catch (err) {
        onAddAttachment({
          ...newAtt,
          status: 'error',
        });
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (type: string, mime: string) => {
    if (mime.startsWith('image/')) return <ImageIcon className="w-3.5 h-3.5 text-sky-400" />;
    if (type === 'CSV' || type === 'XLSX') return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />;
    if (type === 'JSON' || type === 'JS' || type === 'TS' || type === 'PY') return <FileCode className="w-3.5 h-3.5 text-amber-400" />;
    return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".txt,.csv,.json,.js,.ts,.py,.html,.css,.md,image/*"
        className="hidden"
        id="file-attachment-input"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        aria-label="ফাইল সংযুক্ত করুন"
        title="ফাইল বা ছবি সংযুক্ত করুন (TXT, CSV, JSON, Images)"
        className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition active:scale-95"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-800/80">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 rounded-lg bg-slate-800/90 border border-slate-700/70 px-2.5 py-1 text-xs text-slate-200"
            >
              {getFileIcon(att.type, att.mimeType)}
              <span className="max-w-[130px] truncate font-medium">{att.name}</span>
              <span className="text-[10px] text-slate-400">({formatSize(att.size)})</span>

              {att.status === 'processing' && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" title="প্রসেস হচ্ছে" />
              )}
              {att.status === 'ready' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {att.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}

              <button
                type="button"
                onClick={() => onRemoveAttachment(att.id)}
                aria-label={`মুছুন ${att.name}`}
                className="ml-1 text-slate-400 hover:text-rose-400 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
