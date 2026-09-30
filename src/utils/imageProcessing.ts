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
export function createTransparentCutout(
  imageSource: string,
  keyColor: 'white' | 'dark' = 'white',
  threshold: number = 40,
  feather: number = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context failed'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample corners to identify background tone
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (keyColor === 'white') {
          // Check closeness to pure white / light gray
          const distance = Math.sqrt(
            Math.pow(255 - r, 2) + Math.pow(255 - g, 2) + Math.pow(255 - b, 2)
          );
          if (distance < threshold) {
            // Full transparent
            data[i + 3] = 0;
          } else if (distance < threshold + feather * 10) {
            // Smooth alpha falloff
            const alphaFactor = (distance - threshold) / (feather * 10);
            data[i + 3] = Math.min(255, Math.floor(255 * alphaFactor));
          }
        } else if (keyColor === 'dark') {
          // Check closeness to black / dark obsidian
          const distance = Math.sqrt(
            Math.pow(r, 2) + Math.pow(g, 2) + Math.pow(b, 2)
          );
          if (distance < threshold) {
            data[i + 3] = 0;
          } else if (distance < threshold + feather * 10) {
            const alphaFactor = (distance - threshold) / (feather * 10);
            data[i + 3] = Math.min(255, Math.floor(255 * alphaFactor));
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
