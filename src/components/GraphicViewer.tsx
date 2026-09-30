import React, { useState } from 'react';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Split,
  Eye,
  Sliders,
  Check,
  Sparkles,
} from 'lucide-react';
import { BackgroundPreview } from '../types';

interface GraphicViewerProps {
  originalImage: string;
  extractedImage: string;
  transparentImage: string | null;
  bgPreview: BackgroundPreview;
  setBgPreview: (bg: BackgroundPreview) => void;
  threshold: number;
  setThreshold: (val: number) => void;
  feather: number;
  setFeather: (val: number) => void;
  isApplyingTransparency: boolean;
  onApplyTransparency: () => void;
}

export const GraphicViewer: React.FC<GraphicViewerProps> = ({
  originalImage,
  extractedImage,
  transparentImage,
  bgPreview,
  setBgPreview,
  threshold,
  setThreshold,
  feather,
  setFeather,
  isApplyingTransparency,
  onApplyTransparency,
}) => {
  const [viewMode, setViewMode] = useState<'extracted' | 'split' | 'side_by_side'>('extracted');
  const [sliderPos, setSliderPos] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showTransparencySettings, setShowTransparencySettings] = useState(false);

  // Active image to display in extracted slot
  const displayImage = bgPreview === 'transparent' && transparentImage ? transparentImage : extractedImage;

  // Background styling mapping
  const getBgClass = () => {
    switch (bgPreview) {
      case 'transparent':
        return 'bg-transparency-grid';
      case 'black':
        return 'bg-[#000000]';
      case 'white':
        return 'bg-[#ffffff]';
      case 'pale_pink':
        return 'bg-[#fce7f3]';
      case 'lilac':
        return 'bg-[#ede9fe]';
      default:
        return 'bg-[#0e0c15]';
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#171322] border border-[#342b47] overflow-hidden shadow-xl">
      {/* Top Toolbar */}
      <div className="p-3 border-b border-[#2a223a] bg-[#120f1b] flex flex-wrap items-center justify-between gap-2">
        {/* Left View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#1a1626] p-1 rounded-xl border border-[#2e2642]">
          <button
            onClick={() => setViewMode('extracted')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'extracted'
                ? 'bg-[#2b223e] text-[#f4b8cf] border border-[#f4b8cf]/40 shadow-sm'
                : 'text-[#9c94ad] hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Isolated Graphic</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'split'
                ? 'bg-[#2b223e] text-[#c4b5fd] border border-[#c4b5fd]/40 shadow-sm'
                : 'text-[#9c94ad] hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Before / After Slider</span>
          </button>
          <button
            onClick={() => setViewMode('side_by_side')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'side_by_side'
                ? 'bg-[#2b223e] text-white border border-[#483a65] shadow-sm'
                : 'text-[#9c94ad] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>

        {/* Center/Right: Background preview colors */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#938aa3] font-medium hidden sm:inline">Preview On:</span>
          <div className="flex items-center gap-1 bg-[#1a1626] p-1 rounded-xl border border-[#2e2642]">
            <button
              onClick={() => setBgPreview('transparent')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
                bgPreview === 'transparent'
                  ? 'bg-[#2d2443] text-[#ffd6e8] border border-[#f4b8cf]/40'
                  : 'text-[#968da6] hover:text-white'
              }`}
              title="Transparent Background Checkerboard"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-transparency-grid border border-gray-500" />
              <span>Alpha</span>
            </button>
            <button
              onClick={() => setBgPreview('black')}
              className={`p-1.5 rounded-md transition-all ${
                bgPreview === 'black' ? 'ring-2 ring-[#c4b5fd]' : 'opacity-70 hover:opacity-100'
              }`}
              title="Black Background"
            >
              <div className="w-3 h-3 rounded-full bg-black border border-gray-700" />
            </button>
            <button
              onClick={() => setBgPreview('white')}
              className={`p-1.5 rounded-md transition-all ${
                bgPreview === 'white' ? 'ring-2 ring-[#c4b5fd]' : 'opacity-70 hover:opacity-100'
              }`}
              title="White Background"
            >
              <div className="w-3 h-3 rounded-full bg-white border border-gray-300" />
            </button>
            <button
              onClick={() => setBgPreview('pale_pink')}
              className={`p-1.5 rounded-md transition-all ${
                bgPreview === 'pale_pink' ? 'ring-2 ring-[#f4b8cf]' : 'opacity-70 hover:opacity-100'
              }`}
              title="Pale Pink Background"
            >
              <div className="w-3 h-3 rounded-full bg-[#fce7f3] border border-pink-300" />
            </button>
            <button
              onClick={() => setBgPreview('lilac')}
              className={`p-1.5 rounded-md transition-all ${
                bgPreview === 'lilac' ? 'ring-2 ring-[#c4b5fd]' : 'opacity-70 hover:opacity-100'
              }`}
              title="Lilac Background"
            >
              <div className="w-3 h-3 rounded-full bg-[#ede9fe] border border-purple-300" />
            </button>
          </div>

          {/* Transparency Slider Toggle */}
          <button
            onClick={() => setShowTransparencySettings(!showTransparencySettings)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              showTransparencySettings
                ? 'bg-[#29203a] border-[#f4b8cf]/50 text-[#f4b8cf]'
                : 'bg-[#1a1626] border-[#2e2642] text-[#a49bb6] hover:text-white'
            }`}
            title="Fine-tune Transparency Cutout"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#1a1626] p-1 rounded-xl border border-[#2e2642] text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
              className="p-1 text-[#9b93ab] hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-[#e4dee9] px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(250, z + 25))}
              className="p-1 text-[#9b93ab] hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Optional Transparency Sliders Bar */}
      {showTransparencySettings && (
        <div className="p-3 bg-[#13101c] border-b border-[#2a223c] grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
          <div>
            <div className="flex justify-between text-[11px] text-[#a8a0b9] mb-1">
              <span>Color Key Threshold</span>
              <span className="font-mono text-[#f4b8cf]">{threshold}</span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-full accent-[#f4b8cf]"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-[#a8a0b9] mb-1">
              <span>Edge Feather / Smoothing</span>
              <span className="font-mono text-[#c4b5fd]">{feather}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={feather}
              onChange={(e) => setFeather(parseInt(e.target.value))}
              className="w-full accent-[#c4b5fd]"
            />
          </div>
          <div>
            <button
              onClick={onApplyTransparency}
              disabled={isApplyingTransparency}
              className="w-full py-2 px-3 rounded-lg bg-[#271f3a] hover:bg-[#34294d] border border-[#f4b8cf]/40 text-[#ffd6e8] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f4b8cf]" />
              <span>Update Transparency Cutout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas Viewport */}
      <div className="flex-1 min-h-[380px] sm:min-h-[460px] p-4 flex items-center justify-center overflow-auto relative">
        {/* Mode 1: Solo Extracted Graphic */}
        {viewMode === 'extracted' && (
          <div
            className={`w-full h-full min-h-[360px] rounded-xl border border-[#372e4b] flex items-center justify-center relative overflow-hidden transition-all ${getBgClass()}`}
          >
            <img
              src={displayImage}
              alt="Isolated Extracted Graphic"
              style={{ transform: `scale(${zoomLevel / 100})` }}
              className="max-h-[420px] max-w-full object-contain drop-shadow-2xl transition-transform duration-200"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-mono text-[#ffd6e8] border border-[#f4b8cf]/40">
              Extracted Graphic Clean Cut
            </div>
          </div>
        )}

        {/* Mode 2: Split Before / After Slider */}
        {viewMode === 'split' && (
          <div
            className={`w-full h-full min-h-[360px] rounded-xl border border-[#372e4b] relative overflow-hidden select-none ${getBgClass()}`}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
              setSliderPos((x / rect.width) * 100);
            }}
          >
            {/* After (Extracted Graphic) on bottom */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={displayImage}
                alt="Extracted Graphic"
                style={{ transform: `scale(${zoomLevel / 100})` }}
                className="max-h-[420px] max-w-full object-contain"
              />
            </div>

            {/* Before (Original Merch) on top, clipped */}
            <div
              className="absolute inset-0 bg-[#0f0d16] flex items-center justify-center overflow-hidden border-r-2 border-[#f4b8cf] shadow-2xl"
              style={{ width: `${sliderPos}%` }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ width: '100%', minWidth: '100%' }}
              >
                <img
                  src={originalImage}
                  alt="Original Merch"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                  className="max-h-[420px] max-w-full object-contain p-4"
                />
              </div>
            </div>

            {/* Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#f4b8cf] shadow-lg pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#181426] border-2 border-[#f4b8cf] shadow-lg flex items-center justify-center">
                <Split className="w-3 h-3 text-[#f4b8cf]" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-[#c4b5fd] border border-[#c4b5fd]/30">
              Original Merchandise
            </div>
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-[#f4b8cf] border border-[#f4b8cf]/30">
              Extracted Graphic
            </div>
          </div>
        )}

        {/* Mode 3: Side-by-Side Dual View */}
        {viewMode === 'side_by_side' && (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Original Card */}
            <div className="rounded-xl bg-[#110e19] border border-[#2f2742] p-3 flex flex-col items-center justify-center relative overflow-hidden">
              <img
                src={originalImage}
                alt="Original Merchandise"
                style={{ transform: `scale(${zoomLevel / 100})` }}
                className="max-h-[340px] max-w-full object-contain"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-[#c4b5fd] border border-[#c4b5fd]/30">
                1. Original Merchandise Photo
              </div>
            </div>

            {/* Extracted Graphic Card */}
            <div
              className={`rounded-xl border border-[#f4b8cf]/40 p-3 flex flex-col items-center justify-center relative overflow-hidden ${getBgClass()}`}
            >
              <img
                src={displayImage}
                alt="Extracted Graphic"
                style={{ transform: `scale(${zoomLevel / 100})` }}
                className="max-h-[340px] max-w-full object-contain"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-[#f4b8cf] border border-[#f4b8cf]/30">
                2. Remastered Extracted Graphic
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
