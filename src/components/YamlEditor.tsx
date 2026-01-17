'use client';

import { useCallback, useState } from 'react';
import { FileCode2, Copy, Check, RotateCcw } from 'lucide-react';

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  onReset?: () => void;
}

export default function YamlEditor({
  value,
  onChange,
  placeholder = '# Enter YAML configuration...',
  label = 'YAML Config',
  onReset,
}: YamlEditorProps) {
  const [copied, setCopied] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [value]);

  const lineCount = value.split('\n').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-zinc-300">{label}</span>
          <span className="text-xs text-zinc-500 ml-2">
            {lineCount} lines
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onReset && (
            <button
              onClick={onReset}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Reset to example"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Copy"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-zinc-900/50 border-r border-zinc-800 overflow-hidden pointer-events-none">
          <div className="py-4 text-right pr-3">
            {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
              <div
                key={i}
                className="text-xs text-zinc-600 leading-[1.6] font-mono h-[22.4px]"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Text Editor */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          spellCheck={false}
          className={`
            yaml-editor w-full h-full pl-14 pr-4 py-4
            bg-transparent resize-none
            focus:outline-none
            ${isFocused ? 'ring-1 ring-indigo-500/30' : ''}
          `}
          style={{ lineHeight: '1.6' }}
        />
      </div>
    </div>
  );
}
