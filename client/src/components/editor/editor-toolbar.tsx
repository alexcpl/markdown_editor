import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Undo, 
  Redo, 
  Bold, 
  Italic, 
  Code, 
  Link, 
  AlignLeft, 
  Highlighter 
} from 'lucide-react';

interface EditorToolbarProps {
  onInsertMarkdown: (markdown: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  editorRef: React.RefObject<any>;
}

export function EditorToolbar({ 
  onInsertMarkdown, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo,
  editorRef 
}: EditorToolbarProps) {
  const handleToggleWordWrap = () => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      const currentWrap = editor.getOption(editor.EditorOption.wordWrap);
      editor.updateOptions({ 
        wordWrap: currentWrap === 'on' ? 'off' : 'on' 
      });
    }
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
      <div className="flex items-center space-x-1">
        {/* Editing Tools */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        {/* Markdown Tools */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onInsertMarkdown('**bold**')}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onInsertMarkdown('*italic*')}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onInsertMarkdown('`code`')}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            title="Code (Ctrl+`)"
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onInsertMarkdown('[text](url)')}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            title="Link (Ctrl+K)"
          >
            <Link className="w-4 h-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        {/* View Options */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleWordWrap}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            title="Toggle Word Wrap"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            title="Syntax Highlighting Enabled"
          >
            <Highlighter className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
