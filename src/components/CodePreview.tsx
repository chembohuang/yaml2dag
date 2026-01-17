'use client';

import { useState, useCallback } from 'react';
import { Code2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface CodePreviewProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodePreview({
  code,
  language = 'mermaid',
  title = 'Mermaid Code',
}: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [code]);

  const lineCount = code.split('\n').length;
  const previewLines = isExpanded ? code : code.split('\n').slice(0, 8).join('\n');
  const hasMore = lineCount > 8;

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-zinc-400">{title}</span>
          <span className="text-xs text-zinc-600">
            {lineCount} lines
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="relative">
        <pre className="p-3 text-xs font-mono text-zinc-400 overflow-x-auto">
          <code>{previewLines}</code>
        </pre>

        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-1.5 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 flex items-center justify-center gap-1 transition-colors border-t border-zinc-800"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Expand ({lineCount - 8} more lines)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
