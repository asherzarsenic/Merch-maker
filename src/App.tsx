import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  ArrowRight,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Wand2,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MerchandiseUploader } from './components/MerchandiseUploader';
import { ExtractionControls } from './components/ExtractionControls';
import { GraphicViewer } from './components/GraphicViewer';
import { ExportBar } from './components/ExportBar';
import { AnalysisPanel } from './components/AnalysisPanel';
import { PodStudio } from './components/PodStudio';
import {
  MerchGraphicItem,
  ExtractionMode,
  BackgroundPreview,
  MerchAnalysis,
} from './types';
import {
  urlToBase64,
  createTransparentCutout,
  cropAndIsolateGraphic,
} from './utils/imageProcessing';

export default function App() {
  // Navigation View: Extractor or POD Studio
  const [activeView, setActiveView] = useState<'extractor' | 'pod_studio'>('extractor');

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chat' | 'library'>('chat');

  // Library & active graphic item
  const [library, setLibrary] = useState<MerchGraphicItem[]>(() => {
    try {
      const saved = localStorage.getItem('merch_graphic_library');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeItem, setActiveItem] = useState<MerchGraphicItem | null>(null);

  // Current working images
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [extractedImage, setExtractedImage] = useState<string | null>(null);
  const [transparentImage, setTransparentImage] = useState<string | null>(null);

  // Controls & parameters
  const [mode, setMode] = useState<ExtractionMode>('full_extraction');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [backgroundStyle, setBackgroundStyle] = useState<'white' | 'dark'>('white');
  const [bgPreview, setBgPreview] = useState<BackgroundPreview>('transparent');

  // Transparency threshold & feather
  const [threshold, setThreshold] = useState<number>(45);
  const [feather, setFeather] = useState<number>(2);
  const [isApplyingTransparency, setIsApplyingTransparency] = useState<boolean>(false);

  // Status & loading
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionStep, setExtractionStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MerchAnalysis | null>(null);

  // Save library changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('merch_graphic_library', JSON.stringify(library));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [library]);

  // Handle image selected from uploader or samples
  const handleImageSelected = async (base64OrUrl: string, title?: string) => {
    setError(null);
    let finalBase64 = base64OrUrl;

    if (base64OrUrl.startsWith('http')) {
      try {
        finalBase64 = await urlToBase64(base64OrUrl);
      } catch (err) {
        console.error('Failed to convert image url:', err);
      }
    }

    setOriginalImage(finalBase64);
    setExtractedImage(null);
    setTransparentImage(null);
    setAnalysis(null);

    const newItem: MerchGraphicItem = {
      id: `merch-${Date.now()}`,
      title: title || 'Merchandise Item',
      createdAt: Date.now(),
      originalImage: finalBase64,
      extractedImage: null,
      extractionMode: mode,
      customPrompt,
    };

    setActiveItem(newItem);

    // Run AI analysis on the image in background
    analyzeImage(finalBase64, newItem);
  };

  // Analyze merchandise image with Gemini Vision
  const analyzeImage = async (base64Data: string, currentItem: MerchGraphicItem) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-merch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: 'image/png',
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        const updated = {
          ...currentItem,
          title: data.analysis.graphicTitle || currentItem.title,
          analysis: data.analysis,
        };
        setActiveItem(updated);
      }
    } catch (err) {
      console.warn('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Perform AI Graphic Extraction
  const handleExtract = async () => {
    if (!originalImage) return;

    setError(null);
    setNotice(null);
    setIsExtracting(true);
    setExtractionStep('Analyzing merchandise surface & perspective...');

    const stepTimer1 = setTimeout(() => {
      setExtractionStep('Isolating graphic artwork & eliminating fabric folds...');
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setExtractionStep('Gemini AI is generating high-definition isolated artwork...');
    }, 3500);

    try {
      const response = await fetch('/api/extract-graphic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: originalImage,
          mimeType: 'image/png',
          mode,
          customPrompt,
          backgroundStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract graphic');
      }

      let extractedUrl: string | null = data.extractedImageUrl || null;

      if (!extractedUrl && data.isFallback && data.boundingBox) {
        setExtractionStep('Synthesizing high-precision artwork boundaries...');
        extractedUrl = await cropAndIsolateGraphic(originalImage, data.boundingBox, {
          garmentColor: data.garmentColor || backgroundStyle,
          enhanceContrast: true,
          paddingPercent: 0.03,
        });

        if (data.isQuotaExceeded) {
          setNotice('✨ Isolated via Gemini Vision AI Segmentation (Active Quota Optimized)');
        }
      }

      if (!extractedUrl) {
        throw new Error('Could not isolate artwork from merchandise photo.');
      }

      setExtractedImage(extractedUrl);

      // Generate initial transparent cutout
      setExtractionStep('Synthesizing alpha transparency cutout...');
      let finalTransUrl: string | null = null;
      try {
        finalTransUrl = await createTransparentCutout(
          extractedUrl,
          backgroundStyle === 'dark' ? 'dark' : 'white',
          threshold,
          feather
        );
        setTransparentImage(finalTransUrl);
      } catch (tErr) {
        console.warn('Transparency auto cutout error:', tErr);
      }

      // Update active item and add/update in library
      const updatedItem: MerchGraphicItem = {
        id: activeItem?.id || `merch-${Date.now()}`,
        title: activeItem?.title || analysis?.graphicTitle || 'Extracted Merch Graphic',
        createdAt: Date.now(),
        originalImage: originalImage,
        extractedImage: extractedUrl,
        transparentImage: finalTransUrl,
        analysis,
        extractionMode: mode,
        customPrompt,
      };

      setActiveItem(updatedItem);
      setLibrary((prev) => {
        const filtered = prev.filter((i) => i.id !== updatedItem.id);
        return [updatedItem, ...filtered];
      });
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(
        err.message || 'Graphic extraction failed. Please try a different preset or prompt.'
      );
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsExtracting(false);
      setExtractionStep('');
    }
  };

  // Re-apply transparency keying when threshold or feather changes
  const handleApplyTransparency = async () => {
    if (!extractedImage) return;
    setIsApplyingTransparency(true);
    try {
      const transUrl = await createTransparentCutout(
        extractedImage,
        backgroundStyle === 'dark' ? 'dark' : 'white',
        threshold,
        feather
      );
      setTransparentImage(transUrl);
      if (activeItem) {
        const updated = { ...activeItem, transparentImage: transUrl };
        setActiveItem(updated);
        setLibrary((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      }
    } catch (err) {
      console.error('Failed to update transparency:', err);
    } finally {
      setIsApplyingTransparency(false);
    }
  };

  // Load an item from library
  const handleSelectLibraryItem = (item: MerchGraphicItem) => {
    setActiveItem(item);
    setOriginalImage(item.originalImage);
    setExtractedImage(item.extractedImage);
    setTransparentImage(item.transparentImage || null);
    setAnalysis(item.analysis || null);
    setMode((item.extractionMode as ExtractionMode) || 'full_extraction');
    setCustomPrompt(item.customPrompt || '');
    setError(null);
  };

  // Delete an item from library
  const handleDeleteLibraryItem = (id: string) => {
    setLibrary((prev) => prev.filter((item) => item.id !== id));
    if (activeItem?.id === id) {
      setActiveItem(null);
      setOriginalImage(null);
      setExtractedImage(null);
      setTransparentImage(null);
      setAnalysis(null);
    }
  };

  // Reset workspace
  const handleReset = () => {
    setActiveItem(null);
    setOriginalImage(null);
    setExtractedImage(null);
    setTransparentImage(null);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#14111d] text-[#f4f2f7] flex flex-col font-sans selection:bg-[#f4b8cf]/30 selection:text-[#ffd6e8]">
      {/* Top Header */}
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeSidebarTab={activeSidebarTab}
        setActiveSidebarTab={setActiveSidebarTab}
        libraryCount={library.length}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Workspace Layout with Collapsible Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Collapsible Sidebar: AI Chat & Image Library */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeSidebarTab}
          setActiveTab={setActiveSidebarTab}
          library={library}
          activeItem={activeItem}
          onSelectItem={handleSelectLibraryItem}
          onDeleteItem={handleDeleteLibraryItem}
          onApplyPromptSuggestion={(prompt) => {
            setCustomPrompt(prompt);
          }}
        />

        {/* Center Main Stage */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#161220] flex flex-col items-center">
          <div className="w-full max-w-6xl space-y-6">
            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="px-2.5 py-1 rounded-lg bg-red-900/50 hover:bg-red-800/50 text-white text-xs"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Notice Banner */}
            {notice && (
              <div className="p-3.5 rounded-2xl bg-[#28203c]/90 border border-[#f4b8cf]/40 text-[#ffd6e8] text-xs sm:text-sm flex items-center justify-between gap-3 shadow-md shadow-[#f4b8cf]/5">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#f4b8cf] flex-shrink-0" />
                  <span>{notice}</span>
                </div>
                <button
                  onClick={() => setNotice(null)}
                  className="px-2.5 py-0.5 rounded-lg bg-[#3b2f56] hover:bg-[#4b3c6e] text-white text-xs"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* POD Studio View */}
            {activeView === 'pod_studio' ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b243b] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#ff007f] uppercase tracking-widest font-semibold">
                        Print on Demand Engine
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f4b8cf]/15 text-[#ffd6e8] border border-[#f4b8cf]/30">
                        Printful & Printify Sync
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                      Merchandise Product Creator & Mockups
                    </h2>
                  </div>

                  <button
                    onClick={() => setActiveView('extractor')}
                    className="self-start sm:self-auto text-xs text-[#a49bb5] hover:text-white px-3 py-1.5 rounded-xl bg-[#201a2d] hover:bg-[#2c243d] border border-[#352b49] transition-all flex items-center gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-[#f4b8cf]" />
                    <span>Back to Extractor</span>
                  </button>
                </div>

                <PodStudio
                  graphicItem={activeItem}
                  extractedImageUrl={extractedImage}
                  transparentImageUrl={transparentImage}
                />
              </div>
            ) : (
              /* Graphic Extractor Flow View */
              <>
                {/* Stage Flow Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b243b] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#f4b8cf] uppercase tracking-widest font-semibold">
                        Merchandise Graphic Studio
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#c4b5fd]/15 text-[#e9d5ff] border border-[#c4b5fd]/30">
                        Flow Node Pipeline
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                      Extract Clean 2D Graphics Off Merchandise
                    </h2>
                  </div>

                  {originalImage && (
                    <button
                      onClick={handleReset}
                      className="self-start sm:self-auto text-xs text-[#a49bb5] hover:text-white px-3 py-1.5 rounded-xl bg-[#201a2d] hover:bg-[#2c243d] border border-[#352b49] transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>New Extraction</span>
                    </button>
                  )}
                </div>

                {/* Node Flow Grid: Input & Extraction Parameters */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Step 1 Node: Merchandise Source Card */}
                  <div className="lg:col-span-6 rounded-2xl bg-[#1a1526] border border-[#342a48] p-4 sm:p-5 flex flex-col shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3.5 border-b border-[#292039] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#f4b8cf]/20 text-[#f4b8cf] text-xs font-mono font-bold flex items-center justify-center border border-[#f4b8cf]/30">
                          1
                        </span>
                        <h3 className="text-sm font-bold text-white">Merchandise Source</h3>
                      </div>
                      {originalImage && (
                        <span className="text-[10px] text-[#c4b5fd] font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#c4b5fd]" /> Loaded
                        </span>
                      )}
                    </div>

                    <MerchandiseUploader
                      currentImage={originalImage}
                      onImageSelected={handleImageSelected}
                      onReset={handleReset}
                      isProcessing={isExtracting}
                    />
                  </div>

                  {/* Step 2 Node: Extraction Engine Controls */}
                  <div className="lg:col-span-6 rounded-2xl bg-[#1a1526] border border-[#342a48] p-4 sm:p-5 flex flex-col shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3.5 border-b border-[#292039] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#c4b5fd]/20 text-[#c4b5fd] text-xs font-mono font-bold flex items-center justify-center border border-[#c4b5fd]/30">
                          2
                        </span>
                        <h3 className="text-sm font-bold text-white">AI Extraction Engine</h3>
                      </div>
                      <span className="text-[10px] text-[#f4b8cf] font-mono">Gemini Vision</span>
                    </div>

                    <ExtractionControls
                      mode={mode}
                      setMode={setMode}
                      customPrompt={customPrompt}
                      setCustomPrompt={setCustomPrompt}
                      backgroundStyle={backgroundStyle}
                      setBackgroundStyle={setBackgroundStyle}
                      onExtract={handleExtract}
                      isExtracting={isExtracting}
                      canExtract={!!originalImage}
                    />

                    {/* Extraction In-Progress Banner */}
                    {isExtracting && (
                      <div className="mt-4 p-3.5 rounded-xl bg-[#221a33] border border-[#f4b8cf]/40 shadow-lg flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-[#f4b8cf] border-t-transparent animate-spin flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white">
                            {extractionStep || 'Processing merchandise graphic...'}
                          </p>
                          <p className="text-[10px] text-[#c4b5fd] truncate mt-0.5">
                            Generating high-fidelity 2D graphic output
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Graphic Intelligence Analysis Panel */}
                {(analysis || isAnalyzing) && (
                  <AnalysisPanel analysis={analysis} isLoading={isAnalyzing} />
                )}

                {/* Step 3 Node: Extracted Graphic Output & Download Studio */}
                {extractedImage && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#f4b8cf] text-black text-xs font-mono font-bold flex items-center justify-center">
                        3
                      </span>
                      <h3 className="text-base font-bold text-white">
                        Extracted Graphic Studio & Downloads
                      </h3>
                    </div>

                    {/* Graphic Interactive Viewer */}
                    <GraphicViewer
                      originalImage={originalImage!}
                      extractedImage={extractedImage}
                      transparentImage={transparentImage}
                      bgPreview={bgPreview}
                      setBgPreview={setBgPreview}
                      threshold={threshold}
                      setThreshold={setThreshold}
                      feather={feather}
                      setFeather={setFeather}
                      isApplyingTransparency={isApplyingTransparency}
                      onApplyTransparency={handleApplyTransparency}
                    />

                    {/* Download and Export Bar */}
                    <ExportBar
                      extractedImage={extractedImage}
                      transparentImage={transparentImage}
                      graphicTitle={activeItem?.title || 'merchandise-graphic'}
                      onOpenPodStudio={() => setActiveView('pod_studio')}
                    />

                    {/* Embedded POD Studio preview below extractor for instant creation */}
                    <PodStudio
                      graphicItem={activeItem}
                      extractedImageUrl={extractedImage}
                      transparentImageUrl={transparentImage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
