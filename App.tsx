
import React, { useState, useCallback } from 'react';
import { LayoutGrid, Settings2, Download, Trash2, Loader2, FileSpreadsheet, Images, X } from 'lucide-react';
import { StandardizedImage, ProcessingSettings, GridType, GRID_PRESETS } from './types';
import { processImage } from './services/imageProcessor';
import JSZip from 'jszip';

import { GridSettingsModal } from './components/GridSettingsModal';
import { ImageUploader } from './components/ImageUploader';
import { ImageGallery } from './components/ImageGallery';

type OutputFormat = 'jpeg' | 'png' | 'webp';

export default function App() {
  const [images, setImages] = useState<StandardizedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [settings, setSettings] = useState<ProcessingSettings>({
    gridType: GridType.CUSTOM,
    canvasWidth: 2000,
    canvasHeight: 2000,
    customPadding: GRID_PRESETS[GridType.CUSTOM]
  });

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const newImages: StandardizedImage[] = newFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      originalSrc: URL.createObjectURL(file),
      processedSrc: null,
      status: 'pending',
      width: 0,
      height: 0,
      file // Temporary storage for processing
    } as any));
    
    setImages(prev => [...prev, ...newImages]);
    setShowSettings(true);
  }, []);

  const handleStartProcessing = async () => {
    setShowSettings(false);
    setIsProcessing(true);
    setProgress(0);

    const updatedImages = [...images];
    const total = updatedImages.length;

    // Parallel processing with batching for high performance
    const batchSize = 4;
    for (let i = 0; i < total; i += batchSize) {
      const batch = updatedImages.slice(i, i + batchSize);
      await Promise.all(batch.map(async (img, idx) => {
        const actualIdx = i + idx;
        if (updatedImages[actualIdx].status === 'completed') return;

        updatedImages[actualIdx].status = 'processing';
        setImages([...updatedImages]);

        try {
          const result = await processImage((img as any).file, settings);
          updatedImages[actualIdx].processedSrc = result.processedSrc;
          updatedImages[actualIdx].width = result.width;
          updatedImages[actualIdx].height = result.height;
          updatedImages[actualIdx].status = 'completed';
        } catch (err) {
          console.error('Processing error:', err);
          updatedImages[actualIdx].status = 'error';
        }
        
        setProgress(Math.round(((actualIdx + 1) / total) * 100));
        setImages([...updatedImages]);
      }));
    }

    setIsProcessing(false);
  };

  const convertDataURLToFormat = async (dataURL: string, format: OutputFormat): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL(`image/${format}`, 0.92));
      };
      img.src = dataURL;
    });
  };

  const handleFinalDownload = async (format: OutputFormat) => {
    setShowDownloadModal(false);
    setIsProcessing(true); // Reuse loader for ZIP generation
    const zip = new JSZip();
    
    for (const img of images) {
      if (img.processedSrc) {
        // Ensure format matches user choice
        const formattedDataURL = await convertDataURLToFormat(img.processedSrc, format);
        const base64Data = formattedDataURL.split(',')[1];
        const ext = format === 'jpeg' ? 'jpg' : format;
        zip.file(img.name.replace(/\.[^/.]+$/, "") + `.${ext}`, base64Data, { base64: true });
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `horeca_standardized_${new Date().getTime()}.zip`;
    link.click();
    setIsProcessing(false);
  };

  const handleExportExcel = () => {
    const headers = "ID,Filename,Original Name,Width,Height,Status\n";
    const rows = images.map(img => 
      `${img.id},${img.name},${img.name},${img.width},${img.height},${img.status}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `standardization_report_${new Date().getTime()}.csv`);
    link.click();
  };

  const clearImages = () => {
    setImages([]);
    setProgress(0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutGrid className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">HORECA Store</h1>
              <p className="text-sm text-slate-500 font-medium">Image Standardization Tool</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {images.length > 0 && (
              <>
                <button 
                  onClick={clearImages}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
                <button 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel Report
                </button>
                <button 
                  onClick={() => setShowDownloadModal(true)}
                  disabled={!images.some(img => img.status === 'completed')}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200"
                >
                  <Download className="w-4 h-4" />
                  Download All (.zip)
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        {images.length === 0 ? (
          <div className="mt-12">
            <ImageUploader onFilesAdded={handleFilesAdded} />
          </div>
        ) : (
          <div className="space-y-6">
            {isProcessing && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-semibold">{progress < 100 ? 'Processing bulk images...' : 'Preparing download package...'}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-400">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-6 px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Queue</span>
                  <span className="text-lg font-bold">{images.length} Images</span>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Grid Mode</span>
                  <span className="text-lg font-bold">Custom</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <button 
                  onClick={() => setShowSettings(true)}
                  className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <Settings2 className="w-5 h-5" />
                </button>
                {!isProcessing && images.some(img => img.status === 'pending') && (
                  <button 
                    onClick={handleStartProcessing}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    Generate Standardized
                    <Images className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <ImageGallery images={images} onRemove={(id) => setImages(prev => prev.filter(img => img.id !== id))} />
          </div>
        )}
      </main>

      {showSettings && (
        <GridSettingsModal 
          settings={settings} 
          onSave={(s) => {
            setSettings(s);
            setShowSettings(false);
          }} 
          onClose={() => setShowSettings(false)}
        />
      )}

      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Select Format</h2>
              <button onClick={() => setShowDownloadModal(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <p className="text-slate-500 mb-8 font-medium">Choose the target format for your standardized batch.</p>
            <div className="grid grid-cols-1 gap-3">
              {(['jpeg', 'png', 'webp'] as OutputFormat[]).map(format => (
                <button
                  key={format}
                  onClick={() => handleFinalDownload(format)}
                  className="w-full py-4 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl font-bold text-slate-700 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 group"
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 p-4 text-center text-slate-400 text-sm">
        &copy; 2026 HORECA Internal Tooling Group. High-performance Image Engine v1.2.0
      </footer>
    </div>
  );
}
