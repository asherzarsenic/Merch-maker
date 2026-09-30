export interface MerchAnalysis {
  graphicTitle?: string;
  graphicType?: string;
  detectedText?: string | null;
  colorPalette?: Array<{ name: string; hex: string }>;
  compositionDescription?: string;
  merchandiseType?: string;
  extractionAdvice?: string;
  recommendedPrompt?: string;
}

export interface MerchGraphicItem {
  id: string;
  title: string;
  createdAt: number;
  originalImage: string; // data URL or URL
  extractedImage: string | null; // data URL of extracted graphic
  transparentImage?: string | null; // processed transparent cutout
  analysis?: MerchAnalysis | null;
  extractionMode: string;
  customPrompt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestedAction?: string;
}

export type ExtractionMode =
  | 'full_extraction'
  | 'typography_isolated'
  | 'vector_style'
  | 'clean_minimal'
  | 'custom';

export type BackgroundPreview = 'transparent' | 'black' | 'white' | 'pale_pink' | 'lilac';

export type PodProductType =
  | 'tshirt'
  | 'hoodie'
  | 'mug'
  | 'tote'
  | 'sticker'
  | 'cap'
  | 'poster'
  | 'phonecase';

export interface PodProductSpec {
  id: PodProductType;
  name: string;
  category: string;
  baseCost: number;
  recommendedRetail: number;
  printWidthInches: number;
  printHeightInches: number;
  recommendedPixels: string; // e.g. "3600 x 4800 px"
  colors: Array<{ name: string; hex: string; isDark: boolean }>;
}

