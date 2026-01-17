'use client';

import { useState, useMemo, useCallback } from 'react';
import { GitBranch, Sparkles, Zap, BookOpen } from 'lucide-react';
import YamlEditor from '@/components/YamlEditor';
import MermaidRenderer from '@/components/MermaidRenderer';
import CodePreview from '@/components/CodePreview';
import { parseYamlConfigs } from '@/lib/yaml-parser';
import { generateMermaidSyntax } from '@/lib/mermaid-generator';
import { EXAMPLE_YAML, SIMPLE_EXAMPLE, CONDITIONAL_EXAMPLE } from '@/lib/examples';

const EXAMPLES = [
  { name: 'Full Example', value: EXAMPLE_YAML },
  { name: 'Simple Flow', value: SIMPLE_EXAMPLE },
  { name: 'Conditional', value: CONDITIONAL_EXAMPLE },
];

export default function Home() {
  const [yamlContent, setYamlContent] = useState(EXAMPLE_YAML);
  const [showCode, setShowCode] = useState(false);

  // Parse YAML and generate Mermaid code
  const { mermaidCode, error } = useMemo(() => {
    if (!yamlContent.trim()) {
      return { mermaidCode: '', error: null };
    }

    try {
      const parsedDags = parseYamlConfigs(yamlContent);

      if (!parsedDags.mainDag && parsedDags.subDags.size === 0) {
        return { mermaidCode: '', error: 'No valid DAG configuration found' };
      }

      const code = generateMermaidSyntax(parsedDags);
      return { mermaidCode: code, error: null };
    } catch (err) {
      return {
        mermaidCode: '',
        error: err instanceof Error ? err.message : 'Parse error',
      };
    }
  }, [yamlContent]);

  const handleReset = useCallback(() => {
    setYamlContent(EXAMPLE_YAML);
  }, []);

  const loadExample = useCallback((example: string) => {
    setYamlContent(example);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white tracking-tight">
                  YAML2DAG
                </h1>
                <p className="text-xs text-zinc-500">
                  YAML → Mermaid DAG Visualization
                </p>
              </div>
            </div>

            {/* Example Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 mr-2">
                <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                Examples:
              </span>
              {EXAMPLES.map((example) => (
                <button
                  key={example.name}
                  onClick={() => loadExample(example.value)}
                  className={`
                    px-3 py-1.5 text-xs rounded-lg transition-all
                    ${yamlContent === example.value
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent'
                    }
                  `}
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        <div className="flex-1 flex max-w-[1800px] mx-auto w-full">
          {/* Left: YAML Editor */}
          <div className="w-[45%] min-w-[400px] border-r border-zinc-800 flex flex-col">
            <YamlEditor
              value={yamlContent}
              onChange={setYamlContent}
              label="YAML Config"
              placeholder={`# Enter DAG configuration
dag_id: "my_dag"
nodes:
  - node_id: "A"

  - node_id: "B"
    deps: ["A"]

# Use --- to separate multiple DAG configs`}
              onReset={handleReset}
            />

            {/* Error Message */}
            {error && (
              <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Mermaid Code Preview */}
            {mermaidCode && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showCode ? 'Hide' : 'Show'} Mermaid Code</span>
                  </button>
                </div>
                {showCode && <CodePreview code={mermaidCode} />}
              </div>
            )}
          </div>

          {/* Right: Mermaid Renderer */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950">
            {/* Renderer Title */}
            <div className="px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-zinc-300">
                  DAG Visualization
                </span>
              </div>
              {mermaidCode && (
                <span className="text-xs text-zinc-500">
                  Live Render
                </span>
              )}
            </div>

            {/* Mermaid Graph Area */}
            <div className="flex-1 overflow-auto p-6 grid-bg">
              <div className="min-h-full flex items-center justify-center">
                <MermaidRenderer
                  code={mermaidCode}
                  className="max-w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900/30">
        <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Supports conditional branching · sub_dag nesting · multiple DAG configs
          </span>
          <span>
            Powered by <span className="text-indigo-400">Mermaid.js</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
