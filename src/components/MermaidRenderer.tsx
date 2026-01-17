'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  code: string;
  className?: string;
}

export default function MermaidRenderer({ code, className = '' }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: '#d4d4f7',
        primaryTextColor: '#333',
        primaryBorderColor: '#7c7cba',
        lineColor: '#71717a',
        secondaryColor: '#ffffcc',
        tertiaryColor: '#fff',
        background: '#1a1a2e',
        mainBkg: '#d4d4f7',
        nodeBorder: '#7c7cba',
        clusterBkg: '#ffffcc',
        clusterBorder: '#999',
        edgeLabelBackground: 'transparent',
        fontFamily: 'Geist, system-ui, sans-serif',
      },
      flowchart: {
        curve: 'basis',
        padding: 20,
        nodeSpacing: 50,
        rankSpacing: 80,
        htmlLabels: true,
        useMaxWidth: true,
      },
      securityLevel: 'loose',
    });
    setIsInitialized(true);
  }, []);

  // Render Mermaid graph
  useEffect(() => {
    if (!isInitialized || !containerRef.current || !code.trim()) {
      return;
    }

    const renderMermaid = async () => {
      try {
        setError(null);
        const id = `mermaid-${Date.now()}`;

        // Validate syntax
        const isValid = await mermaid.parse(code);
        if (!isValid) {
          throw new Error('Invalid Mermaid syntax');
        }

        // Render SVG
        const { svg } = await mermaid.render(id, code);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err instanceof Error ? err.message : 'Render failed');
      }
    };

    // Debounced render
    const timer = setTimeout(renderMermaid, 300);
    return () => clearTimeout(timer);
  }, [code, isInitialized]);

  if (!code.trim()) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-zinc-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
          <p className="text-sm">Enter YAML config to see DAG visualization</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-red-400 max-w-md">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm font-medium mb-2">Render Error</p>
          <p className="text-xs text-red-300/70 font-mono">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-output flex items-center justify-center p-8 ${className}`}
    />
  );
}
