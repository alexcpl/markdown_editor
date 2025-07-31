import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen, Save } from 'lucide-react';

interface FileOperationsProps {
  onFileLoad: (file: File) => void;
  onFileSave: () => void;
}

export function FileOperations({ onFileLoad, onFileSave }: FileOperationsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileLoad(file);
    }
    // Reset input value to allow loading the same file again
    e.target.value = '';
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center space-x-2 ml-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.txt"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {/* Load File Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLoadClick}
        className="text-slate-700 border-slate-300 hover:bg-slate-50"
      >
        <FolderOpen className="w-4 h-4 mr-2" />
        Load File
      </Button>
      
      {/* Save File Button */}
      <Button
        size="sm"
        onClick={onFileSave}
        className="bg-primary hover:bg-blue-700"
      >
        <Save className="w-4 h-4 mr-2" />
        Save as MD
      </Button>
    </div>
  );
}
