export interface CompressOptions {
  maxEdge?: number;
  quality?: number;
  maxBytes?: number;
}

async function decodeImage(file: File): Promise<{ width: number; height: number; source: CanvasImageSource }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { width: bitmap.width, height: bitmap.height, source: bitmap };
    } catch {
      /* fall through to <img> fallback */
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight, source: img });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not decode image — try a different photo or format'));
    };
    img.src = url;
  });
}

function drawToJpeg(
  source: CanvasImageSource,
  width: number,
  height: number,
  quality: number
): Promise<Blob> {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(source, 0, 0, width, height);
    return canvas.convertToBlob({ type: 'image/jpeg', quality });
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(source, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/jpeg', quality);
  });
}

export async function compressImageForUpload(file: File, opts: CompressOptions = {}): Promise<File> {
  const maxEdge = opts.maxEdge ?? 2000;
  const maxBytes = opts.maxBytes ?? 1.5 * 1024 * 1024;
  const initialQuality = opts.quality ?? 0.85;

  const { width, height, source } = await decodeImage(file);
  const longest = Math.max(width, height);
  const scale = longest > maxEdge ? maxEdge / longest : 1;
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const qualities = [initialQuality, 0.7, 0.55];
  let lastBlob: Blob | null = null;
  for (const q of qualities) {
    const blob = await drawToJpeg(source, targetW, targetH, q);
    lastBlob = blob;
    if (blob.size <= maxBytes) break;
  }
  if (!lastBlob) throw new Error('Compression produced no output');

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'invoice';
  return new File([lastBlob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}
