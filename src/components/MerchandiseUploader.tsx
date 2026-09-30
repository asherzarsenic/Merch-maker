import React, { useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Check, RefreshCw, Layers } from 'lucide-react';
import { SAMPLE_MERCHANDISE, SampleMerch } from '../utils/sampleData';

interface MerchandiseUploaderProps {
  currentImage: string | null;
  onImageSelected: (base64Data: string, title?: string) => void;
  onReset: () => void;
  isProcessing: boolean;
}

export const MerchandiseUploader: React.FC<MerchandiseUploaderProps> = ({
  currentImage,
  onImageSelected,
  onReset,
  isProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelected(reader.result as string, file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelected(reader.result as string, file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleClick = (sample: SampleMerch) => {
    onImageSelected(sample.thumbnail, sample.name);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Upload Box / Image Display */}
      {!currentImage ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 min-h-[260px] rounded-2xl border-2 border-dashed border-[#3a324d] hover:border-[#f4b8cf]/60 bg-[#1e1929]/70 hover:bg-[#251f33] transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group relative overflow-hidden"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="w-14 h-14 rounded-2xl bg-[#282138] group-hover:bg-[#342b49] border border-[#f4b8cf]/20 group-hover:border-[#f4b8cf]/50 flex items-center justify-center mb-3.5 transition-all shadow-lg shadow-black/30">
            <Upload className="w-6 h-6 text-[#f4b8cf] group-hover:scale-110 transition-transform" />
          </div>

          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-1.5">
            Drop merchandise photo here or <span className="text-[#f4b8cf] underline">browse</span>
          </h3>
          <p className="text-xs text-[#a39ab6] max-w-xs leading-relaxed">
            Supports photos of T-shirts, hoodies, mugs, tote bags, caps, posters, or stickers
          </p>

          {/* Supported format badge */}
          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-[#8e85a0] bg-[#161320] px-2.5 py-1 rounded-full border border-[#2d253f]">
            <span>JPG, PNG, WEBP up to 25MB</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-[260px] rounded-2xl bg-[#171322] border border-[#352c4a] p-3 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex-1 flex items-center justify-center rounded-xl bg-[#110e19] border border-[#262035] overflow-hidden relative">
            <img
              src={currentImage}
              alt="Merchandise Preview"
              className="max-h-[240px] w-full object-contain p-2"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-[#f4b8cf] border border-[#f4b8cf]/30">
              Input Merchandise
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="text-xs text-[#c4b5fd] hover:text-white px-2.5 py-1 rounded-lg bg-[#241e34] hover:bg-[#302845] border border-[#3c3254] transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              Replace Photo
            </button>
            <button
              onClick={onReset}
              disabled={isProcessing}
              className="text-xs text-[#a39ab4] hover:text-red-300 px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-all"
            >
              Clear
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}

      {/* Instant Sample Merchandise Gallery */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-[#a39ab6] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#f4b8cf]" />
            Or test with sample merchandise:
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SAMPLE_MERCHANDISE.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleClick(sample)}
              disabled={isProcessing}
              className="group relative rounded-xl overflow-hidden border border-[#312945] hover:border-[#f4b8cf]/60 bg-[#1a1626] p-1 text-left transition-all hover:scale-[1.03]"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-black/40 mb-1">
                <img
                  src={sample.thumbnail}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
              </div>
              <div className="px-0.5">
                <p className="text-[10px] font-medium text-[#e2dde9] truncate">{sample.name}</p>
                <p className="text-[9px] text-[#8f86a2] truncate">{sample.type}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
