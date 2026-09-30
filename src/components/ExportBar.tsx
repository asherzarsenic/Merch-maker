import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Sparkles,
  FileImage,
  Layers,
  Printer,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadGraphicFile, copyImageToClipboard } from '../utils/imageProcessing';

interface ExportBarProps {
  extractedImage: string;
  transparentImage: string | null;
  graphicTitle: string;
  onOpenPodStudio?: () => void;
}

export const ExportBar: React.FC<ExportBarProps> = ({
  extractedImage,
  transparentImage,
  graphicTitle,
  onOpenPodStudio,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp' | 'svg'>('png');
  const [scale, setScale] = useState<number>(1);
  const [useTransparent, setUseTransparent] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const activeImage = useTransparent && transparentImage ? transparentImage : extractedImage;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fire festive celebration confetti with pink & lilac color palette
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f4b8cf', '#ffd6e8', '#c4b5fd', '#ffffff', '#e9d5ff'],
      });

      const cleanTitle = (graphicTitle || 'merch-graphic')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      await downloadGraphicFile(
        activeImage,
        `${cleanTitle}-extracted-${scale}x`,
        format,
        scale,
        useTransparent ? 'transparent' : '#ffffff'
      );
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyImageToClipboard(activeImage);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-[#171322] border border-[#342b47] shadow-xl flex flex-wrap items-center justify-between gap-3">
      {/* Left Format & Scale Pickers */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Format Selector */}
        <div className="flex items-center gap-1 bg-[#120f1a] p-1 rounded-xl border border-[#2b243d]">
          {(['png', 'jpeg', 'webp', 'svg'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                format === fmt
                  ? 'bg-[#29223c] text-[#f4b8cf] border border-[#f4b8cf]/40 shadow-sm'
                  : 'text-[#968da5] hover:text-white'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Resolution Scale */}
        <div className="flex items-center gap-1 bg-[#120f1a] p-1 rounded-xl border border-[#2b243d]">
          {[
            { val: 1, label: '1x (1K)' },
            { val: 2, label: '2x (2K)' },
            { val: 4, label: '4x (4K Ultra)' },
          ].map((s) => (
            <button
              key={s.val}
              onClick={() => setScale(s.val)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                scale === s.val
                  ? 'bg-[#29223c] text-[#c4b5fd] border border-[#c4b5fd]/40 shadow-sm'
                  : 'text-[#968da5] hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Alpha / Transparent toggle */}
        {transparentImage && format === 'png' && (
          <label className="flex items-center gap-2 cursor-pointer bg-[#120f1a] px-3 py-1.5 rounded-xl border border-[#2b243d] hover:border-[#f4b8cf]/40 transition-all">
            <input
              type="checkbox"
              checked={useTransparent}
              onChange={(e) => setUseTransparent(e.target.checked)}
              className="accent-[#f4b8cf] w-3.5 h-3.5 rounded"
            />
            <span className="text-xs text-[#ded8e8] font-medium">Transparent PNG</span>
          </label>
        )}
      </div>

      {/* Right Download, Copy & POD Studio Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {/* Open in POD Studio */}
        {onOpenPodStudio && (
          <button
            onClick={onOpenPodStudio}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff007f]/20 to-[#c4b5fd]/20 hover:from-[#ff007f]/30 hover:to-[#c4b5fd]/30 border border-[#ff007f]/40 text-[#ffd6e8] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-[#ff007f]" />
            <span>Open in POD Studio</span>
          </button>
        )}

        {/* Copy to Clipboard */}
        <button
          onClick={handleCopy}
          className="px-3.5 py-2.5 rounded-xl bg-[#221c32] hover:bg-[#2d2542] border border-[#392f4e] text-[#d6cfe0] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          title="Copy Graphic to Clipboard"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-300">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#c4b5fd]" />
              <span className="hidden sm:inline">Copy Graphic</span>
            </>
          )}
        </button>

        {/* Main Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f4b8cf] via-[#e9d5ff] to-[#c4b5fd] text-[#130f1e] text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all hover:opacity-95 hover:shadow-lg hover:shadow-[#f4b8cf]/20 active:scale-95"
        >
          <Download className="w-4 h-4 text-[#130f1e]" />
          <span>
            {isDownloading
              ? 'Exporting File...'
              : `Download ${format.toUpperCase()} (${scale}x)`}
          </span>
        </button>
      </div>
    </div>
  );
};

