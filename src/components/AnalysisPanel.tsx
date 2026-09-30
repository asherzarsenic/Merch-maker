import React from 'react';
import { Sparkles, Palette, Type, ShieldCheck, Tag, Info } from 'lucide-react';
import { MerchAnalysis } from '../types';

interface AnalysisPanelProps {
  analysis: MerchAnalysis | null;
  isLoading: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4 rounded-2xl bg-[#171322] border border-[#302844] animate-pulse flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#241e34]" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-[#241e34] rounded w-1/3" />
          <div className="h-3 bg-[#1e192a] rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="p-4 rounded-2xl bg-[#171322] border border-[#342a48] shadow-lg space-y-3">
      <div className="flex items-center justify-between border-b border-[#282138] pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#f4b8cf]" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            AI Graphic Intelligence
          </h4>
        </div>
        {analysis.graphicType && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c4b5fd]/20 text-[#e9d5ff] border border-[#c4b5fd]/30 font-medium">
            {analysis.graphicType}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Description & Text */}
        <div className="sm:col-span-2 space-y-1.5">
          {analysis.graphicTitle && (
            <p className="font-semibold text-[#ffd6e8] text-sm">{analysis.graphicTitle}</p>
          )}
          {analysis.compositionDescription && (
            <p className="text-[#a49cb5] text-xs leading-relaxed">
              {analysis.compositionDescription}
            </p>
          )}
          {analysis.detectedText && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#ded8e8] bg-[#120f1b] p-2 rounded-xl border border-[#262035]">
              <Type className="w-3.5 h-3.5 text-[#c4b5fd] flex-shrink-0" />
              <span>
                Detected Typography:{' '}
                <strong className="text-white font-mono">"{analysis.detectedText}"</strong>
              </span>
            </div>
          )}
        </div>

        {/* Color Palette & Advice */}
        <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-[#282138] sm:pl-3 pt-2 sm:pt-0">
          {analysis.colorPalette && analysis.colorPalette.length > 0 && (
            <div>
              <span className="text-[10px] text-[#8f86a0] font-medium block mb-1">
                Extracted Palette:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {analysis.colorPalette.slice(0, 5).map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-[#120f1b] px-1.5 py-0.5 rounded border border-[#2b243b]"
                    title={`${c.name}: ${c.hex}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/50"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[9px] font-mono text-[#ded8e8]">{c.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.extractionAdvice && (
            <div className="text-[11px] text-[#c4b5fd] bg-[#1a1429] p-2 rounded-xl border border-[#c4b5fd]/20">
              <span className="font-medium text-[#ffd6e8]">Print Tip: </span>
              {analysis.extractionAdvice}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
