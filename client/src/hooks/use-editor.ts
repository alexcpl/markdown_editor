import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EditorHistory {
  content: string;
  timestamp: number;
}

export function useEditor() {
  const [content, setContent] = useState(`# Welcome to Markdown Editor

Start typing your markdown content here...

## Features
- Load and save markdown files
- Real-time editing with syntax highlighting  
- Word count tracking
- Undo/Redo functionality
- Drag and drop file support

## Example Commands
\`\`\`bash
# Example command
echo 'Hello, World!'
npm install package-name
git commit -m "Update documentation"
\`\`\`

**Bold text** and *italic text* are supported.

[Links](https://example.com) and \`inline code\` work too.
`);
  
  const [fileName, setFileName] = useState<string>('');
  const [history, setHistory] = useState<EditorHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { toast } = useToast();

  // Calculate word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Add to history
  const addToHistory = useCallback((newContent: string) => {
    setHistory(prev => {
      const newEntry = { content: newContent, timestamp: Date.now() };
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newEntry);
      
      // Limit history to 100 entries
      if (newHistory.length > 100) {
        newHistory.shift();
        setHistoryIndex(prev => Math.max(0, prev));
        return newHistory;
      }
      
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [historyIndex]);

  // Set content with history tracking
  const setContentWithHistory = useCallback((newContent: string) => {
    if (newContent !== content) {
      addToHistory(content); // Save current state before changing
      setContent(newContent);
    }
  }, [content, addToHistory]);

  // Initialize history with initial content
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ content, timestamp: Date.now() }]);
      setHistoryIndex(0);
    }
  }, []);

  // File operations
  const handleFileLoad = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        addToHistory(content); // Save current state before loading
        setContent(text);
        setFileName(file.name);
        toast({
          title: "File loaded successfully",
          description: `Loaded ${file.name}`,
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error loading file",
        description: "There was an error reading the file.",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  }, [content, addToHistory, toast]);

  const handleFileSave = useCallback(() => {
    try {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "File saved successfully",
        description: `Saved as ${fileName || 'document.md'}`,
      });
    } catch (error) {
      toast({
        title: "Error saving file",
        description: "There was an error saving the file.",
        variant: "destructive",
      });
    }
  }, [content, fileName, toast]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex].content);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex].content);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Insert markdown
  const insertMarkdown = useCallback((markdown: string) => {
    // This will be handled by the editor component
    // For now, we'll append to content as fallback
    const newContent = content + markdown;
    setContentWithHistory(newContent);
  }, [content, setContentWithHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            handleFileSave();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleFileSave]);

  return {
    content,
    setContent: setContentWithHistory,
    fileName,
    setFileName,
    wordCount,
    handleFileLoad,
    handleFileSave,
    insertMarkdown,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
