import { useState, useRef, useCallback } from 'react';
import { useEditor } from '@/hooks/use-editor';
import { EditorToolbar } from '@/components/editor/editor-toolbar';
import { FileOperations } from '@/components/editor/file-operations';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { Edit } from 'lucide-react';

export default function Editor() {
  const {
    content,
    setContent,
    fileName,
    setFileName,
    wordCount,
    handleFileLoad,
    handleFileSave,
    insertMarkdown,
    undo,
    redo,
    canUndo,
    canRedo
  } = useEditor();

  const [isDragOver, setIsDragOver] = useState(false);
  const editorRef = useRef<any>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const mdFile = files.find(file => 
      file.name.endsWith('.md') || file.name.endsWith('.txt')
    );
    
    if (mdFile) {
      handleFileLoad(mdFile);
    }
  }, [handleFileLoad]);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Edit className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800">Markdown Editor</h1>
          </div>
          
          {/* File Operations */}
          <FileOperations 
            onFileLoad={handleFileLoad}
            onFileSave={handleFileSave}
          />
        </div>
        
        {/* Status */}
        <div className="flex items-center space-x-4">
          {fileName && (
            <div className="text-sm text-slate-500">
              <span>{fileName}</span>
            </div>
          )}
          <div className="text-sm text-slate-500">
            <span>{wordCount}</span> words
          </div>
        </div>
      </header>

      {/* Editor Toolbar */}
      <EditorToolbar 
        onInsertMarkdown={insertMarkdown}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        editorRef={editorRef}
      />

      {/* Main Editor Area */}
      <main 
        className="flex-1 relative overflow-hidden px-5"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drop Zone Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary bg-opacity-10 border-2 border-dashed border-primary z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl text-primary mb-4">📁</div>
              <p className="text-lg font-medium text-primary">Drop your Markdown file here</p>
              <p className="text-sm text-slate-600 mt-2">Supports .md and .txt files</p>
            </div>
          </div>
        )}
        
        {/* Editor */}
        <MarkdownEditor 
          ref={editorRef}
          content={content}
          onChange={setContent}
        />
      </main>
    </div>
  );
}
