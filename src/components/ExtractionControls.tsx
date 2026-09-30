import React from 'react';
import { Sparkles, Wand2, Type, Shapes, Minimize2, Sliders, ArrowRight, Loader2 } from 'lucide-react';
import { ExtractionMode } from '../types';

interface ExtractionControlsProps {
  mode: ExtractionMode;
  setMode: (mode: ExtractionMode) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  backgroundStyle: 'white' | 'dark';
  setBackgroundStyle: (bg: 'white' | 'dark') => void;
  onExtract: () => void;
  isExtracting: boolean;
  canExtract: boolean;
}

export const ExtractionControls: React.FC<ExtractionControlsProps> = ({
  mode,
  setMode,
  customPrompt,
  setCustomPrompt,
  backgroundStyle,
  setBackgroundStyle,
  onExtract,
  isExtracting,
  canExtract,
}) => {
  const modes = [
    {
      id: 'full_extraction' as ExtractionMode,
      name: 'Full Graphic',
      desc: 'Complete artwork with all illustrations and text isolated',
      icon: Sparkles,
      tag: 'Recommended',
    },
    {
      id: 'typography_isolated' as ExtractionMode,
      name: 'Typography Only',
      desc: 'Isolates and sharpens slogan, logo text & lettering',
      icon: Type,
      tag: 'Text',
    },
    {
      id: 'vector_style' as ExtractionMode,
      name: 'Clean Vector Style',
      desc: 'Remasters into crisp flat 2D vector-like artwork',
      icon: Shapes,
      tag: 'Crisp',
    },
    {
      id: 'clean_minimal' as ExtractionMode,
      name: 'Core Emblem Art',
      desc: 'Extracts central icon/illustration minus clutter',
      icon: Minimize2,
      tag: 'Minimal',
    },
  ];

  return (
    <div className="flex flex-col space-y-4">
      {/* Mode Selector */}
      <div>
        <label className="text-xs font-semibold text-[#ded8ea] mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-[#f4b8cf]" />
            Extraction Preset
          </span>
          <span className="text-[10px] text-[#9a91ae] font-normal">Powered by Gemini Vision</span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                disabled={isExtracting}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between relative ${
                  isSelected
                    ? 'bg-[#28203c] border-[#f4b8cf] text-white shadow-lg shadow-[#f4b8cf]/10 ring-1 ring-[#f4b8cf]/40'
                    : 'bg-[#1a1626] border-[#312845] hover:border-[#473b62] text-[#c2bad0] hover:text-white'
                }`}
              >
                <div className="flex items-start justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#f4b8cf]' : 'text-[#c4b5fd]'}`} />
                    <span className="text-xs font-semibold">{m.name}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase ${
                      isSelected
                        ? 'bg-[#f4b8cf]/25 text-[#ffd6e8]'
                        : 'bg-[#262035] text-[#8e84a2]'
                    }`}
                  >
                    {m.tag}
                  </span>
                </div>
                <p className="text-[10px] text-[#938ba4] leading-tight mt-0.5">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Canvas Background */}
      <div>
        <label className="text-xs font-medium text-[#ded8ea] mb-1.5 flex items-center justify-between">
          <span>Extraction Canvas Base</span>
          <span className="text-[10px] text-[#9a91ae]">For automated cutout</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setBackgroundStyle('white')}
            disabled={isExtracting}
            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
              backgroundStyle === 'white'
                ? 'bg-[#29223c] border-[#f4b8cf] text-[#ffd6e8] shadow-sm'
                : 'bg-[#181424] border-[#2f2742] text-[#9d94af] hover:text-white'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-white border border-gray-300 shadow-inner" />
            <span>Pure Studio White</span>
          </button>
          <button
            onClick={() => setBackgroundStyle('dark')}
            disabled={isExtracting}
            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
              backgroundStyle === 'dark'
                ? 'bg-[#29223c] border-[#c4b5fd] text-[#e9d5ff] shadow-sm'
                : 'bg-[#181424] border-[#2f2742] text-[#9d94af] hover:text-white'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-black border border-gray-700 shadow-inner" />
            <span>Obsidian Black</span>
          </button>
        </div>
      </div>

      {/* Custom Prompt Tweak */}
      <div>
        <label className="text-xs font-medium text-[#ded8ea] mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sliders className="w-3 h-3 text-[#c4b5fd]" />
            Optional Refinement Instructions
          </span>
          <span className="text-[10px] text-[#8e85a0]">Direct Gemini AI</span>
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="e.g. 'Extract only the cherry blossoms, ignore the circle frame', 'Make edges extra sharp for DTG printing'..."
          disabled={isExtracting}
          rows={2}
          className="w-full bg-[#181424] border border-[#312945] focus:border-[#f4b8cf]/60 focus:outline-none focus:ring-1 focus:ring-[#f4b8cf]/40 rounded-xl p-2.5 text-xs text-white placeholder-[#787088] transition-all resize-none"
        />
      </div>

      {/* Extract Action Button */}
      <button
        onClick={onExtract}
        disabled={!canExtract || isExtracting}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
          !canExtract || isExtracting
            ? 'bg-[#221c32] text-[#716983] border border-[#302845] cursor-not-allowed'
            : 'bg-gradient-to-r from-[#f4b8cf] via-[#e9d5ff] to-[#c4b5fd] text-[#130f1e] hover:opacity-95 hover:shadow-[#f4b8cf]/25 hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        {isExtracting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#130f1e]" />
            <span>Gemini AI is Extracting Graphics...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-[#130f1e]" />
            <span>Extract Merchandise Graphics</span>
            <ArrowRight className="w-4 h-4 text-[#130f1e]" />
          </>
        )}
      </button>
    </div>
  );
};
