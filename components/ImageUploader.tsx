
import React, { useRef, useState } from 'react';
import { Upload, FolderOpen, MousePointer2 } from 'lucide-react';

interface Props {
  onFilesAdded: (files: File[]) => void;
}

export const ImageUploader: React.FC<Props> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
    if (files.length > 0) onFilesAdded(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((f: File) => f.type.startsWith('image/'));
      if (files.length > 0) onFilesAdded(files);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50 scale-102 shadow-2xl shadow-indigo-100' 
            : 'border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xl hover:shadow-slate-100'
          }
        `}
      >
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-indigo-50/50">
            <Upload className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Product Images</h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto font-medium">
            Drag and drop your images or select a folder to process multiple items at once.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              <MousePointer2 className="w-4 h-4" />
              Upload File
            </button>
            <button
              onClick={() => folderInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              <FolderOpen className="w-4 h-4" />
              Upload Folder
            </button>
          </div>
          
          <p className="mt-8 text-xs text-slate-400 font-bold uppercase tracking-wider">
            Supports: JPG, PNG, WEBP (Max 2000px optimized)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={folderInputRef}
          type="file"
          {...({ webkitdirectory: "", directory: "" } as any)}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
