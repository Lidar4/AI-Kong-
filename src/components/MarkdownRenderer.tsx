import React from 'react';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Split content by code blocks
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(renderTextMarkdown(textBefore, `text-${lastIndex}`));
    }

    const language = match[1] || 'plaintext';
    const code = match[2];
    parts.push(<CodeBlock key={`code-${match.index}`} language={language} code={code} />);

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    parts.push(renderTextMarkdown(remainingText, `text-${lastIndex}`));
  }

  return <div className="space-y-2 leading-relaxed text-slate-200">{parts}</div>;
};

function renderTextMarkdown(text: string, keyPrefix: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={`${keyPrefix}-empty-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`${keyPrefix}-h3-${i}`} className="text-base font-bold text-emerald-400 mt-3 mb-1">
          {formatInline(line.replace('### ', ''))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`${keyPrefix}-h2-${i}`} className="text-lg font-bold text-teal-300 mt-4 mb-2 pb-1 border-b border-slate-800">
          {formatInline(line.replace('## ', ''))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`${keyPrefix}-h1-${i}`} className="text-xl font-extrabold text-white mt-4 mb-2">
          {formatInline(line.replace('# ', ''))}
        </h1>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`${keyPrefix}-quote-${i}`} className="border-l-4 border-emerald-500/80 bg-slate-900/60 px-3.5 py-2 my-2 text-slate-300 italic rounded-r-lg">
          {formatInline(line.replace(/^>\s*/, ''))}
        </blockquote>
      );
      i++;
      continue;
    }

    // Unordered List
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* ') || lines[i].startsWith('• '))) {
        listItems.push(lines[i].replace(/^[-*•]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`${keyPrefix}-ul-${i}`} className="list-disc list-inside space-y-1 my-2 pl-2 text-slate-300">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-normal">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list (1. , 2. )
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`${keyPrefix}-ol-${i}`} className="list-decimal list-inside space-y-1.5 my-2 pl-2 text-slate-300">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-normal">
              {formatInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={`${keyPrefix}-hr-${i}`} className="my-4 border-slate-800" />);
      i++;
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`${keyPrefix}-p-${i}`} className="leading-relaxed">
        {formatInline(line)}
      </p>
    );
    i++;
  }

  return <div key={keyPrefix}>{elements}</div>;
}

function formatInline(text: string): React.ReactNode {
  // Formats inline code `code`, bold **text**, and links
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-[12.5px] text-emerald-300 border border-slate-700/60">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-200">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
