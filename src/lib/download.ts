export type DownloadFormat = "png" | "jpg" | "webp";

interface DownloadOptions {
  url: string;
  filename: string;
  format?: DownloadFormat;
  quality?: number;
}

function getMimeType(format: DownloadFormat): string {
  switch (format) {
    case "jpg": return "image/jpeg";
    case "webp": return "image/webp";
    default: return "image/png";
  }
}

async function fetchImageAsBlob(url: string): Promise<Blob> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  return res.blob();
}

async function convertFormat(blob: Blob, format: DownloadFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Cannot create canvas context"));

      if (format === "jpg") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("Canvas conversion failed"));
        },
        getMimeType(format),
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image for conversion"));
    img.src = URL.createObjectURL(blob);
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadImage(options: DownloadOptions): Promise<void> {
  const { url, filename, format = "png", quality = 0.95 } = options;

  const rawBlob = await fetchImageAsBlob(url);
  const finalBlob = format === "png" && rawBlob.type === "image/png"
    ? rawBlob
    : await convertFormat(rawBlob, format, quality);

  const ext = format === "jpg" ? "jpeg" : format;
  const safeName = filename.replace(/[^a-zA-Z0-9-_]/g, "-").substring(0, 60);
  const timestamp = Date.now();
  const fullName = `vizzy-${safeName}-${timestamp}.${ext}`;

  triggerDownload(finalBlob, fullName);
}

export async function downloadAllImages(
  assets: { url: string; title: string }[],
  format: DownloadFormat = "png",
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    try {
      await downloadImage({ url: asset.url, filename: asset.title || `vizzy-asset-${i}`, format });
    } catch {
      const a = document.createElement("a");
      a.href = asset.url;
      a.download = `vizzy-${asset.title || `asset-${i}`}.${format}`;
      a.click();
    }
    onProgress?.(i + 1, assets.length);
    if (i < assets.length - 1) await new Promise((r) => setTimeout(r, 400));
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
