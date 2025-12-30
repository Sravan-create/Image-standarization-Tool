
import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, X, Download } from 'lucide-react';
import { StandardizedImage } from '../types';

interface Props {
  images: StandardizedImage[];
  onRemove: (id: string) => void;
}

export const ImageGallery: React.FC<Props> = ({ images, onRemove }) => {
  const handleSingleDownload = (img: StandardizedImage) => {
    if (!img.processedSrc) return;
    const link = document.createElement('a');
    link.href = img.processedSrc;
    link.download = img.name.replace(/\.[^/.]+$/, "") + "_std.jpg";
    link.click();
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20">
      {images.map((img) => (
        <div key={img.id} className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          {/* Status Badge */}
          <div className="absolute top-3 left-3 z-10">
            {img.status === 'completed' && (
              <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg text-emerald-500 ring-1 ring-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {img.status === 'processing' && (
              <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg text-indigo-500">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
            {img.status === 'error' && (
              <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg text-red-500">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Remove Button */}
          <button 
            onClick={() => onRemove(img.id)}
            className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Image Container */}
          <div className="aspect-square bg-slate-50 flex items-center justify-center relative overflow-hidden">
            {img.processedSrc ? (
              <img src={img.processedSrc} alt={img.name} className="w-full h-full object-contain p-2" />
            ) : (
              <img src={img.originalSrc} alt={img.name} className="w-full h-full object-cover opacity-50 blur-[2px]" />
            )}
            
            {/* Quick Actions Overlay */}
            {img.status === 'completed' && (
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => handleSingleDownload(img)}
                  className="bg-white text-slate-900 p-3 rounded-full hover:scale-110 transition-transform shadow-xl"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 bg-white border-t border-slate-50">
            <h4 className="text-xs font-bold text-slate-700 truncate mb-1">{img.name}</h4>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                {img.width ? `${img.width}x${img.height}px` : 'Pending'}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                img.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                img.status === 'processing' ? 'bg-indigo-50 text-indigo-600' :
                'bg-slate-50 text-slate-400'
              }`}>
                {img.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
