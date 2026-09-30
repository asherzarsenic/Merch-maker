import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Download,
  Share2,
  DollarSign,
  Maximize2,
  RotateCw,
  Move,
  CheckCircle2,
  Layers,
  Palette,
  Sliders,
  ExternalLink,
  Copy,
  Info,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PodProductType, PodProductSpec, MerchGraphicItem } from '../types';

interface PodStudioProps {
  graphicItem: MerchGraphicItem | null;
  extractedImageUrl: string | null;
  transparentImageUrl: string | null;
  onClose?: () => void;
}

const POD_PRODUCTS: PodProductSpec[] = [
  {
    id: 'tshirt',
    name: 'Classic Heavyweight Tee',
    category: 'Apparel',
    baseCost: 9.95,
    recommendedRetail: 28.0,
    printWidthInches: 12,
    printHeightInches: 16,
    recommendedPixels: '3600 x 4800 px (300 DPI)',
    colors: [
      { name: 'Obsidian Black', hex: '#111015', isDark: true },
      { name: 'Pure White', hex: '#f8f8fa', isDark: false },
      { name: 'Pale Pink', hex: '#f9d5e5', isDark: false },
      { name: 'Lilac Dusk', hex: '#d8cdfa', isDark: false },
      { name: 'Hot Magenta', hex: '#ff007f', isDark: true },
      { name: 'Heather Gray', hex: '#9e9ca6', isDark: false },
      { name: 'Deep Navy', hex: '#161b2e', isDark: true },
    ],
  },
  {
    id: 'hoodie',
    name: 'Oversized Streetwear Hoodie',
    category: 'Apparel',
    baseCost: 21.5,
    recommendedRetail: 58.0,
    printWidthInches: 14,
    printHeightInches: 16,
    recommendedPixels: '4200 x 4800 px (300 DPI)',
    colors: [
      { name: 'Obsidian Black', hex: '#111015', isDark: true },
      { name: 'Oatmeal Sand', hex: '#e8e2d5', isDark: false },
      { name: 'Pale Pink', hex: '#f9d5e5', isDark: false },
      { name: 'Lilac Cloud', hex: '#d8cdfa', isDark: false },
      { name: 'Charcoal Wash', hex: '#26242c', isDark: true },
    ],
  },
  {
    id: 'mug',
    name: 'Ceramic Studio Mug 11oz',
    category: 'Drinkware',
    baseCost: 4.85,
    recommendedRetail: 18.0,
    printWidthInches: 8.5,
    printHeightInches: 3.5,
    recommendedPixels: '2550 x 1050 px (300 DPI)',
    colors: [
      { name: 'Glossy White', hex: '#fdfdfe', isDark: false },
      { name: 'Matte Black', hex: '#16151a', isDark: true },
      { name: 'Soft Blush', hex: '#f8d9e8', isDark: false },
    ],
  },
  {
    id: 'tote',
    name: 'Heavyweight Canvas Tote',
    category: 'Accessories',
    baseCost: 8.2,
    recommendedRetail: 24.0,
    printWidthInches: 12,
    printHeightInches: 12,
    recommendedPixels: '3600 x 3600 px (300 DPI)',
    colors: [
      { name: 'Natural Ecru', hex: '#eee7d8', isDark: false },
      { name: 'Black Canvas', hex: '#18161e', isDark: true },
      { name: 'Dusty Lilac', hex: '#ded4f7', isDark: false },
    ],
  },
  {
    id: 'sticker',
    name: 'Die-Cut Holographic Sticker',
    category: 'Stationery',
    baseCost: 1.45,
    recommendedRetail: 6.0,
    printWidthInches: 4,
    printHeightInches: 4,
    recommendedPixels: '1200 x 1200 px (300 DPI)',
    colors: [
      { name: 'Holographic White Border', hex: '#fdfcf7', isDark: false },
      { name: 'Matte Vinyl', hex: '#221f2d', isDark: true },
    ],
  },
  {
    id: 'cap',
    name: 'Embroidered Dad Cap',
    category: 'Headwear',
    baseCost: 12.0,
    recommendedRetail: 32.0,
    printWidthInches: 4.5,
    printHeightInches: 2.2,
    recommendedPixels: '1350 x 660 px (300 DPI)',
    colors: [
      { name: 'Washed Black', hex: '#201e26', isDark: true },
      { name: 'Baby Pink', hex: '#fbe2ee', isDark: false },
      { name: 'Lavender Mist', hex: '#e2d9fb', isDark: false },
      { name: 'Pure White', hex: '#f9f9fb', isDark: false },
    ],
  },
  {
    id: 'poster',
    name: 'Museum-Grade Matte Poster',
    category: 'Home & Living',
    baseCost: 6.5,
    recommendedRetail: 30.0,
    printWidthInches: 18,
    printHeightInches: 24,
    recommendedPixels: '5400 x 7200 px (300 DPI)',
    colors: [
      { name: 'Archival Matte White', hex: '#fefefe', isDark: false },
      { name: 'Fine Black Frame', hex: '#14121a', isDark: true },
    ],
  },
];

export const PodStudio: React.FC<PodStudioProps> = ({
  graphicItem,
  extractedImageUrl,
  transparentImageUrl,
}) => {
  const activeGraphic = transparentImageUrl || extractedImageUrl || graphicItem?.transparentImage || graphicItem?.extractedImage;

  const [selectedProduct, setSelectedProduct] = useState<PodProductSpec>(POD_PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState(POD_PRODUCTS[0].colors[0]);

  // Transform controls for graphic on mockup
  const [scale, setScale] = useState<number>(0.75);
  const [posX, setPosX] = useState<number>(0); // -50 to 50 %
  const [posY, setPosY] = useState<number>(-5); // -50 to 50 %
  const [rotation, setRotation] = useState<number>(0); // degrees
  const [blendMode, setBlendMode] = useState<'normal' | 'multiply' | 'dtg'>('dtg');

  // Profit calculation
  const [retailPrice, setRetailPrice] = useState<number>(POD_PRODUCTS[0].recommendedRetail);
  const [podProvider, setPodProvider] = useState<'printful' | 'printify' | 'gelato'>('printful');
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [isExportingMockup, setIsExportingMockup] = useState<boolean>(false);
  const [isExportingPrintFile, setIsExportingPrintFile] = useState<boolean>(false);

  const mockupRef = useRef<HTMLDivElement>(null);

  // Update color selection when product changes
  useEffect(() => {
    setSelectedColor(selectedProduct.colors[0]);
    setRetailPrice(selectedProduct.recommendedRetail);
  }, [selectedProduct]);

  const profit = Math.max(0, retailPrice - selectedProduct.baseCost);
  const profitMarginPercent = Math.round((profit / retailPrice) * 100);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f4b8cf', '#c4b5fd', '#ff007f', '#ffffff'],
    });
  };

  // Export High-Res Mockup Image (Canvas Render)
  const handleDownloadMockup = async () => {
    if (!activeGraphic) return;
    setIsExportingMockup(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1600;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw studio background
      ctx.fillStyle = '#100e17';
      ctx.fillRect(0, 0, 1600, 1600);

      // Draw garment base shape
      ctx.fillStyle = selectedColor.hex;
      ctx.beginPath();
      if (selectedProduct.id === 'tshirt') {
        // T-Shirt shape
        ctx.roundRect(350, 300, 900, 1100, [60, 60, 20, 20]);
      } else if (selectedProduct.id === 'mug') {
        ctx.roundRect(450, 450, 700, 800, [30, 30, 50, 50]);
      } else {
        ctx.roundRect(400, 350, 800, 1000, 40);
      }
      ctx.fill();

      // Load and draw graphic with scale & offsets
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = activeGraphic;
      });

      ctx.save();
      const centerX = 800 + (posX * 8);
      const centerY = 800 + (posY * 8);
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);

      const targetW = 600 * scale;
      const targetH = (img.naturalHeight / img.naturalWidth) * targetW;

      if (blendMode === 'multiply' && !selectedColor.isDark) {
        ctx.globalCompositeOperation = 'multiply';
      }
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();

      // Download
      const link = document.createElement('a');
      link.download = `${selectedProduct.id}-mockup-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      triggerConfetti();
    } catch (e) {
      console.error('Failed to export mockup:', e);
    } finally {
      setIsExportingMockup(false);
    }
  };

  // Export 300 DPI Print-Ready File
  const handleDownloadPrintReady = async () => {
    if (!activeGraphic) return;
    setIsExportingPrintFile(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = activeGraphic;
      });

      const canvas = document.createElement('canvas');
      // Full print dimension calculation (e.g. 12" x 16" at 300 DPI)
      const targetW = selectedProduct.printWidthInches * 300;
      const targetH = selectedProduct.printHeightInches * 300;
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw high resolution centered graphic with scale
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const drawW = targetW * scale;
      const drawH = (img.naturalHeight / img.naturalWidth) * drawW;
      const drawX = (targetW - drawW) / 2 + (posX * targetW * 0.01);
      const drawY = (targetH - drawH) / 2 + (posY * targetH * 0.01);

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      const link = document.createElement('a');
      link.download = `POD-PrintReady-300DPI-${selectedProduct.id}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      triggerConfetti();
    } catch (e) {
      console.error('Failed to export print-ready file:', e);
    } finally {
      setIsExportingPrintFile(false);
    }
  };

  // Copy API Payload for Printful / Printify webhook
  const handleCopyApiPayload = () => {
    const payload = {
      provider: podProvider,
      product: selectedProduct.name,
      productId: selectedProduct.id,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      printWidthInches: selectedProduct.printWidthInches,
      printHeightInches: selectedProduct.printHeightInches,
      placement: {
        scale,
        offsetXPercent: posX,
        offsetYPercent: posY,
        rotation,
      },
      pricing: {
        baseCost: selectedProduct.baseCost,
        retailPrice,
        profitMargin: profit,
      },
      fileUrl: activeGraphic?.substring(0, 100) + '...',
    };

    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  return (
    <div className="w-full bg-[#120f1b] border border-[#2e2640] rounded-2xl overflow-hidden shadow-2xl flex flex-col my-4">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 border-b border-[#292238] bg-gradient-to-r from-[#1b152b] via-[#211936] to-[#171224] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f4b8cf] via-[#ff007f] to-[#c4b5fd] p-[1.5px] shadow-lg shadow-[#ff007f]/20">
            <div className="w-full h-full bg-[#130f1e] rounded-[10px] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#f4b8cf]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Print on Demand Studio
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#ff007f]/20 text-[#ffd6e8] border border-[#ff007f]/40 font-semibold">
                Live POD Engine
              </span>
            </div>
            <p className="text-xs text-[#9d94af]">
              Turn your extracted graphics into store-ready apparel & merchandise in real time
            </p>
          </div>
        </div>

        {/* Profit Quick Badge */}
        <div className="flex items-center gap-3 bg-[#191426] px-3.5 py-2 rounded-xl border border-[#342a4a]">
          <div className="text-right">
            <span className="text-[10px] text-[#938aa4] block uppercase font-mono">Net Profit / Item</span>
            <span className="text-sm font-bold text-[#f4b8cf]">${profit.toFixed(2)}</span>
          </div>
          <div className="h-6 w-px bg-[#322947]" />
          <div className="text-right">
            <span className="text-[10px] text-[#938aa4] block uppercase font-mono">Margin</span>
            <span className="text-xs font-semibold text-[#c4b5fd]">+{profitMarginPercent}%</span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[#292238]">
        {/* Left Column: Product & Color Picker */}
        <div className="lg:col-span-3 p-4 space-y-5 bg-[#141021]">
          {/* Product Type Selector */}
          <div>
            <label className="text-xs font-semibold text-[#ded8ea] mb-2 flex items-center justify-between">
              <span>Select Merchandise Blank</span>
              <span className="text-[10px] text-[#9a91ae] font-normal">{POD_PRODUCTS.length} Items</span>
            </label>
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
              {POD_PRODUCTS.map((prod) => {
                const isSelected = selectedProduct.id === prod.id;
                return (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#29203d] border-[#f4b8cf] text-white shadow-md shadow-[#f4b8cf]/10 ring-1 ring-[#f4b8cf]/40'
                        : 'bg-[#191526] border-[#2c243e] hover:border-[#403559] text-[#b8b0c8]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{prod.name}</div>
                      <div className="text-[10px] text-[#8e85a0]">{prod.category} • Print: {prod.printWidthInches}"×{prod.printHeightInches}"</div>
                    </div>
                    <span className="text-[10px] font-mono text-[#f4b8cf] bg-[#221a33] px-2 py-0.5 rounded-md border border-[#362b4e]">
                      ${prod.baseCost.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Garment Color Swatches */}
          <div>
            <label className="text-xs font-semibold text-[#ded8ea] mb-2 flex items-center justify-between">
              <span>Garment Color</span>
              <span className="text-[10px] text-[#f4b8cf]">{selectedColor.name}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedProduct.colors.map((c) => {
                const isSelected = selectedColor.name === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center relative ${
                      isSelected ? 'ring-2 ring-[#f4b8cf] ring-offset-2 ring-offset-[#141021] scale-110' : 'border-black/40 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 ${c.isDark ? 'text-white' : 'text-black'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing & Profit Calculator */}
          <div className="p-3 rounded-xl bg-[#1a1429] border border-[#302644] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#ded8ea] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#f4b8cf]" />
                Store Retail Pricing
              </span>
              <span className="text-xs font-bold text-[#f4b8cf]">${retailPrice.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={Math.ceil(selectedProduct.baseCost + 2)}
              max={Math.ceil(selectedProduct.baseCost * 3.5)}
              step={1}
              value={retailPrice}
              onChange={(e) => setRetailPrice(Number(e.target.value))}
              className="w-full accent-[#f4b8cf] cursor-pointer h-1.5 bg-[#2a223c] rounded-lg"
            />
            <div className="flex items-center justify-between text-[11px] text-[#938aa4] pt-1">
              <span>Base Cost: ${selectedProduct.baseCost.toFixed(2)}</span>
              <span className="text-[#ffd6e8] font-bold font-mono">Profit: +${profit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Center Column: Live 2D Mockup Canvas */}
        <div className="lg:col-span-5 p-4 sm:p-6 bg-[#161223] flex flex-col items-center justify-center relative">
          {/* Mockup Preview Card */}
          <div
            ref={mockupRef}
            className="w-full max-w-[380px] aspect-square rounded-2xl relative flex items-center justify-center overflow-hidden shadow-2xl border border-[#2b223c]"
            style={{
              backgroundColor: '#0c0a12',
              backgroundImage: 'radial-gradient(circle at 50% 40%, #1f182e 0%, #0d0a14 100%)',
            }}
          >
            {/* Merch Base Blank Render */}
            <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
              {/* Dynamic SVG Garment Blank */}
              {selectedProduct.id === 'tshirt' && (
                <svg viewBox="0 0 400 450" className="w-full h-full drop-shadow-2xl">
                  {/* T-Shirt Body */}
                  <path
                    d="M 130 50 C 160 80, 240 80, 270 50 L 370 120 L 330 190 L 290 160 L 290 420 L 110 420 L 110 160 L 70 190 L 30 120 Z"
                    fill={selectedColor.hex}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="3"
                  />
                  {/* Collar */}
                  <path
                    d="M 130 50 C 160 80, 240 80, 270 50 C 240 70, 160 70, 130 50"
                    fill="none"
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth="4"
                  />
                  {/* Subtle fabric fold shadows */}
                  <path
                    d="M 110 180 Q 200 230 290 180"
                    fill="none"
                    stroke={selectedColor.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}
                    strokeWidth="8"
                  />
                </svg>
              )}

              {selectedProduct.id === 'hoodie' && (
                <svg viewBox="0 0 400 450" className="w-full h-full drop-shadow-2xl">
                  <path
                    d="M 130 60 C 160 100, 240 100, 270 60 L 380 130 L 330 230 L 290 190 L 290 430 L 110 430 L 110 190 L 70 230 L 20 130 Z"
                    fill={selectedColor.hex}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="3"
                  />
                  {/* Kangaroo pocket */}
                  <path
                    d="M 140 320 L 260 320 L 280 400 L 120 400 Z"
                    fill="none"
                    stroke={selectedColor.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}
                    strokeWidth="3"
                  />
                </svg>
              )}

              {selectedProduct.id === 'mug' && (
                <svg viewBox="0 0 350 350" className="w-full h-full drop-shadow-2xl">
                  <rect x="80" y="80" width="180" height="210" rx="15" fill={selectedColor.hex} stroke="rgba(0,0,0,0.3)" strokeWidth="3" />
                  <path d="M 260 120 C 320 120, 320 230, 260 230" fill="none" stroke={selectedColor.hex} strokeWidth="24" strokeLinecap="round" />
                  <ellipse cx="170" cy="80" rx="90" ry="15" fill={selectedColor.isDark ? '#2a2636' : '#ffffff'} stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
                </svg>
              )}

              {selectedProduct.id === 'tote' && (
                <svg viewBox="0 0 350 400" className="w-full h-full drop-shadow-2xl">
                  <rect x="70" y="140" width="210" height="240" rx="10" fill={selectedColor.hex} stroke="rgba(0,0,0,0.3)" strokeWidth="3" />
                  <path d="M 120 140 C 120 40, 230 40, 230 140" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="12" />
                </svg>
              )}

              {selectedProduct.id === 'sticker' && (
                <div className="w-48 h-48 rounded-full border-4 border-white/90 shadow-2xl bg-gradient-to-tr from-pink-200 via-purple-200 to-indigo-100 p-2 flex items-center justify-center" />
              )}

              {selectedProduct.id === 'cap' && (
                <svg viewBox="0 0 350 300" className="w-full h-full drop-shadow-2xl">
                  <path d="M 70 180 C 70 80, 280 80, 280 180 Z" fill={selectedColor.hex} stroke="rgba(0,0,0,0.3)" strokeWidth="3" />
                  <path d="M 50 180 Q 175 140 300 180 Q 250 240 50 180 Z" fill={selectedColor.hex} stroke="rgba(0,0,0,0.4)" strokeWidth="3" />
                </svg>
              )}

              {selectedProduct.id === 'poster' && (
                <div className="w-56 h-72 bg-white rounded-md shadow-2xl border-8 border-[#15121c] p-2 flex items-center justify-center" />
              )}
            </div>

            {/* Live Interactive Graphic Print Overlay */}
            {activeGraphic ? (
              <div
                className="absolute transition-transform cursor-grab active:cursor-grabbing flex items-center justify-center"
                style={{
                  transform: `translate(${posX * 2.5}px, ${posY * 2.5}px) rotate(${rotation}deg) scale(${scale})`,
                  mixBlendMode: blendMode === 'multiply' && !selectedColor.isDark ? 'multiply' : 'normal',
                }}
              >
                <img
                  src={activeGraphic}
                  alt="Print Artwork"
                  className="max-w-[170px] max-h-[220px] object-contain pointer-events-none drop-shadow-md select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="text-center p-4 text-xs text-[#8d84a0]">
                Extract or upload a graphic first to preview on merchandise
              </div>
            )}

            {/* Print Area Boundary Indicator */}
            <div className="absolute inset-x-20 top-24 bottom-24 border border-dashed border-[#f4b8cf]/25 rounded-lg pointer-events-none flex items-start justify-end p-1">
              <span className="text-[8px] font-mono uppercase text-[#f4b8cf]/60 bg-[#120e1e]/80 px-1 rounded">
                Print Area
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#9087a2] mt-3 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>300 DPI High-Density Print Simulation Active</span>
          </div>
        </div>

        {/* Right Column: Print Spec, Positioning & Direct POD Integration */}
        <div className="lg:col-span-4 p-4 space-y-4 bg-[#141021]">
          {/* Position & Scale Sliders */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#ded8ea] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#f4b8cf]" />
                Artwork Placement & Sizing
              </span>
              <button
                onClick={() => {
                  setScale(0.75);
                  setPosX(0);
                  setPosY(-5);
                  setRotation(0);
                }}
                className="text-[10px] text-[#f4b8cf] hover:underline"
              >
                Reset Center
              </button>
            </label>

            {/* Scale Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-[#a199b4] mb-1">
                <span>Print Scale</span>
                <span className="font-mono text-[#ffd6e8]">{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.4"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-[#f4b8cf] cursor-pointer h-1.5 bg-[#29213a] rounded-lg"
              />
            </div>

            {/* Vertical Shift */}
            <div>
              <div className="flex justify-between text-[11px] text-[#a199b4] mb-1">
                <span>Chest Placement (Y-Axis)</span>
                <span className="font-mono text-[#ffd6e8]">{posY}px</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
                className="w-full accent-[#c4b5fd] cursor-pointer h-1.5 bg-[#29213a] rounded-lg"
              />
            </div>

            {/* Blend Mode Toggle */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => setBlendMode('dtg')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium border ${
                  blendMode === 'dtg'
                    ? 'bg-[#2b2140] border-[#f4b8cf] text-[#ffd6e8]'
                    : 'bg-[#1a1527] border-[#312746] text-[#8e84a2]'
                }`}
              >
                DTG Direct Ink
              </button>
              <button
                onClick={() => setBlendMode('multiply')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium border ${
                  blendMode === 'multiply'
                    ? 'bg-[#2b2140] border-[#c4b5fd] text-[#e9d5ff]'
                    : 'bg-[#1a1527] border-[#312746] text-[#8e84a2]'
                }`}
              >
                Fabric Multiply
              </button>
            </div>
          </div>

          <div className="h-px bg-[#2a223a]" />

          {/* POD Provider Direct Spec Sheet */}
          <div className="p-3 rounded-xl bg-[#1a1429] border border-[#302644] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>POD Print Provider</span>
              <div className="flex items-center gap-1">
                {(['printful', 'printify', 'gelato'] as const).map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setPodProvider(prov)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize ${
                      podProvider === prov
                        ? 'bg-[#f4b8cf] text-black font-bold'
                        : 'bg-[#261f36] text-[#9f96b2] hover:text-white'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-[#9a91ae] space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Print Spec:</span>
                <span className="text-white">{selectedProduct.recommendedPixels}</span>
              </div>
              <div className="flex justify-between">
                <span>Print Dimensions:</span>
                <span className="text-white">{selectedProduct.printWidthInches}" × {selectedProduct.printHeightInches}"</span>
              </div>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleDownloadPrintReady}
              disabled={!activeGraphic || isExportingPrintFile}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#f4b8cf] via-[#ff007f] to-[#c4b5fd] text-[#130f1e] font-bold text-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ff007f]/20 active:scale-[0.99] disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#130f1e]" />
              <span>Download 300 DPI Print File</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadMockup}
                disabled={!activeGraphic || isExportingMockup}
                className="py-2 px-2.5 rounded-xl bg-[#231b34] hover:bg-[#2e2444] border border-[#3c3055] text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#f4b8cf]" />
                <span>Save Mockup</span>
              </button>

              <button
                onClick={handleCopyApiPayload}
                className="py-2 px-2.5 rounded-xl bg-[#231b34] hover:bg-[#2e2444] border border-[#3c3055] text-[#ffd6e8] text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                {copiedPayload ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#c4b5fd]" />
                    <span>Copy POD JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
