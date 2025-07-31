import { forwardRef, useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const MarkdownEditor = forwardRef<any, MarkdownEditorProps>(
  ({ content, onChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useEffect(() => {
      if (containerRef.current && !editorRef.current) {
        // Configure Monaco Editor
        monaco.editor.defineTheme('markdown-theme', {
          base: 'vs',
          inherit: true,
          rules: [
            { token: 'keyword.markdown', foreground: '2563eb', fontStyle: 'bold' },
            { token: 'string.markdown', foreground: '059669' },
            { token: 'comment.markdown', foreground: '6b7280', fontStyle: 'italic' },
          ],
          colors: {
            'editor.background': '#ffffff',
            'editor.foreground': '#1e293b',
            'editor.lineHighlightBackground': '#f8fafc',
            'editor.selectionBackground': '#dbeafe',
          }
        });

        // Create editor
        editorRef.current = monaco.editor.create(containerRef.current, {
          value: content,
          language: 'markdown',
          theme: 'markdown-theme',
          fontFamily: "'Fira Code', 'Monaco', monospace",
          fontSize: 14,
          lineHeight: 1.6,
          wordWrap: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 24, bottom: 24 },
          lineNumbers: 'off',
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 0,
          renderLineHighlight: 'line',
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        });

        // Set up change listener
        editorRef.current.onDidChangeModelContent(() => {
          if (editorRef.current) {
            onChange(editorRef.current.getValue());
          }
        });

        // Expose editor through ref
        if (ref && typeof ref === 'object') {
          ref.current = {
            getEditor: () => editorRef.current,
            focus: () => editorRef.current?.focus(),
            insertText: (text: string) => {
              if (editorRef.current) {
                const selection = editorRef.current.getSelection();
                if (selection) {
                  editorRef.current.executeEdits('', [{
                    range: selection,
                    text: text,
                  }]);
                }
              }
            }
          };
        }
      }

      return () => {
        if (editorRef.current) {
          editorRef.current.dispose();
          editorRef.current = null;
        }
      };
    }, []);

    // Update content when prop changes
    useEffect(() => {
      if (editorRef.current && editorRef.current.getValue() !== content) {
        editorRef.current.setValue(content);
      }
    }, [content]);

    return (
      <div 
        ref={containerRef} 
        className="w-full h-full bg-white"
      />
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';
