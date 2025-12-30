
import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { ProcessingSettings } from '../types';

interface Props {
  settings: ProcessingSettings;
  onSave: (settings: ProcessingSettings) => void;
  onClose: () => void;
}

export const GridSettingsModal: React.FC<Props> = ({ settings: initialSettings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState<ProcessingSettings>(initialSettings);

  // Helper to handle numeric input without leading zeros and allowing empty state
  const handleNumInput = (value: string, setter: (val: number) => void) => {
    if (value === '') {
      setter(0);
      return;
    }
    // Remove leading zeros unless the value is just "0"
    const cleaned = value.replace(/^0+(?=\d)/, '');
    const parsed = parseInt(cleaned, 10);
    if (!isNaN(parsed)) {
      setter(parsed);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-bold transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
              <Settings className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Custom Grid Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Canvas Size */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Canvas Dimensions (Pixels)</h3>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Width</label>
                <input 
                  type="number" 
                  value={localSettings.canvasWidth === 0 ? '' : localSettings.canvasWidth}
                  placeholder="0"
                  onChange={(e) => handleNumInput(e.target.value, (val) => setLocalSettings(prev => ({ ...prev, canvasWidth: val })))}
                  className={inputClasses} 
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Height</label>
                <input 
                  type="number" 
                  value={localSettings.canvasHeight === 0 ? '' : localSettings.canvasHeight}
                  placeholder="0"
                  onChange={(e) => handleNumInput(e.target.value, (val) => setLocalSettings(prev => ({ ...prev, canvasHeight: val })))}
                  className={inputClasses} 
                />
              </div>
            </div>
          </section>

          {/* Padding Controls */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Safe Zone Padding</h3>
            <div className="grid grid-cols-2 gap-4">
              {(['top', 'bottom', 'left', 'right'] as const).map(side => (
                <div key={side} className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{side}</label>
                  <input 
                    type="number" 
                    value={localSettings.customPadding[side] === 0 ? '' : localSettings.customPadding[side]}
                    placeholder="0"
                    onChange={(e) => handleNumInput(e.target.value, (val) => setLocalSettings(prev => ({ 
                      ...prev, 
                      customPadding: { ...prev.customPadding, [side]: val } 
                    })))}
                    className={inputClasses} 
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-3 font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(localSettings)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            Save & Update Batch
          </button>
        </div>
      </div>
    </div>
  );
};
