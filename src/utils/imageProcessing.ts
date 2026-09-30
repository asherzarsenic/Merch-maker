/**
 * Image processing utilities for Merchandise Graphic Extractor
 */

// Convert a File object to base64 string
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Convert an external Image URL (e.g. from sample) to base64 data URL
export async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    // Fallback: draw onto canvas
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 800;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load image from URL'));
      img.src = url;
    });
  }
}

// Remove background (e.g. white or dark key) to produce true transparent PNG
export function cropAndIsolateGraphic(
  imageSource: string,
  boundingBox: [number, number, number, number], // [ymin, xmin, ymax, xmax] 0-1000 or 0-1
  options?: {
    garmentColor?: 'dark' | 'white' | 'auto';
    paddingPercent?: number;
    enhanceContrast?: boolean;
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const nw = img.naturalWidth || img.width;
      const nh = img.naturalHeight || img.height;

      // Check if 0-1000 scale or 0-1 scale
      const is1000Scale = boundingBox.some((v) => v > 1);
      let [ymin, xmin, ymax, xmax] = boundingBox;
      if (is1000Scale) {
        ymin /= 1000;
        xmin /= 1000;
        ymax /= 1000;
        xmax /= 1000;
      }

      // Clamp valid ranges
      ymin = Math.max(0, Math.min(1, ymin));
      xmin = Math.max(0, Math.min(1, xmin));
      ymax = Math.max(0, Math.min(1, ymax));
      xmax = Math.max(0, Math.min(1, xmax));

      // Add slight safety padding
      const pad = options?.paddingPercent ?? 0.03;
      const boxW = Math.max(0.05, xmax - xmin);
      const boxH = Math.max(0.05, ymax - ymin);

      const left = Math.max(0, xmin - boxW * pad) * nw;
      const top = Math.max(0, ymin - boxH * pad) * nh;
      const width = Math.min(nw - left, (boxW + boxW * pad * 2) * nw);
      const height = Math.min(nh - top, (boxH + boxH * pad * 2) * nh);

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(120, Math.round(width));
      canvas.height = Math.max(120, Math.round(height));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context failed'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, left, top, width, height, 0, 0, canvas.width, canvas.height);

      if (options?.enhanceContrast) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        // Moderate auto-contrast and vibrancy boost for print clarity
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.15 + 128));
          data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.15 + 128));
          data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.15 + 128));
        }
        ctx.putImageData(imgData, 0, 0);
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = imageSource;
  });
}

// Remove background (e.g. white or dark key) to produce true transparent PNG
export function createTransparentCutout(
  imageSource: string,
  keyColor: 'white' | 'dark' | 'auto' = 'white',
  threshold: number = 40,
  feather: number = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context failed'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample border pixels to detect dominant background color
      let avgR = 0, avgG = 0, avgB = 0, sampleCount = 0;
      const stepX = Math.max(1, Math.floor(w / 20));
      const stepY = Math.max(1, Math.floor(h / 20));

      // Sample top and bottom rows
      for (let x = 0; x < w; x += stepX) {
        const topIdx = (0 * w + x) * 4;
        const botIdx = ((h - 1) * w + x) * 4;
        avgR += data[topIdx] + data[botIdx];
        avgG += data[topIdx + 1] + data[botIdx + 1];
        avgB += data[topIdx + 2] + data[botIdx + 2];
        sampleCount += 2;
      }
      // Sample left and right columns
      for (let y = 0; y < h; y += stepY) {
        const leftIdx = (y * w + 0) * 4;
        const rightIdx = (y * w + (w - 1)) * 4;
        avgR += data[leftIdx] + data[rightIdx];
        avgG += data[leftIdx + 1] + data[rightIdx + 1];
        avgB += data[leftIdx + 2] + data[rightIdx + 2];
        sampleCount += 2;
      }

      avgR = Math.round(avgR / sampleCount);
      avgG = Math.round(avgG / sampleCount);
      avgB = Math.round(avgB / sampleCount);

      // Target background RGB based on keyColor
      let targetR = 255, targetG = 255, targetB = 255;
      if (keyColor === 'dark') {
        targetR = 0; targetG = 0; targetB = 0;
      } else if (keyColor === 'auto') {
        targetR = avgR; targetG = avgG; targetB = avgB;
      }

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Color distance in RGB space
        const distance = Math.sqrt(
          Math.pow(targetR - r, 2) + Math.pow(targetG - g, 2) + Math.pow(targetB - b, 2)
        );

        if (distance < threshold) {
          data[i + 3] = 0; // Completely transparent
        } else if (distance < threshold + feather * 12) {
          const alphaFactor = (distance - threshold) / (feather * 12);
          data[i + 3] = Math.min(255, Math.floor(255 * alphaFactor));

          // De-fringing: remove garment background color bleed from edges
          if (data[i + 3] > 0) {
            data[i] = Math.min(255, Math.max(0, Math.round((r - targetR * (1 - alphaFactor)) / Math.max(0.01, alphaFactor))));
            data[i + 1] = Math.min(255, Math.max(0, Math.round((g - targetG * (1 - alphaFactor)) / Math.max(0.01, alphaFactor))));
            data[i + 2] = Math.min(255, Math.max(0, Math.round((b - targetB * (1 - alphaFactor)) / Math.max(0.01, alphaFactor))));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = imageSource;
  });
}

// Download image with desired format and resolution
export async function downloadGraphicFile(
  imageSource: string,
  filename: string = 'extracted-graphic',
  format: 'png' | 'jpeg' | 'webp' | 'svg' = 'png',
  scale: number = 1,
  backgroundColor?: string
) {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = (img.naturalWidth || img.width) * scale;
      const targetHeight = (img.naturalHeight || img.height) * scale;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context error'));
        return;
      }

      // Smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (backgroundColor && format !== 'png') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      } else if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      if (format === 'svg') {
        // Create an embedded high-res SVG container
        const svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${targetWidth}" height="${targetHeight}" viewBox="0 0 ${targetWidth} ${targetHeight}">
            <image href="${canvas.toDataURL('image/png')}" width="${targetWidth}" height="${targetHeight}" />
          </svg>
        `.trim();
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const link = document.createElement('a');
        link.download = `${filename}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        resolve();
      } else {
        const mimeType =
          format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, 0.95);
        const link = document.createElement('a');
        link.download = `${filename}.${format === 'jpeg' ? 'jpg' : format}`;
        link.href = dataUrl;
        link.click();
        resolve();
      }
    };
    img.onerror = (err) => reject(err);
    img.src = imageSource;
  });
}

// Copy image to system clipboard
export async function copyImageToClipboard(imageSource: string): Promise<boolean> {
  try {
    const response = await fetch(imageSource);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.error('Failed to copy image to clipboard:', err);
    return false;
  }
}
