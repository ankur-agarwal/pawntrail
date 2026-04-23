const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"];

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function compressImage(file: File): Promise<Blob> {
  if (!ACCEPTED_MIME.includes(file.type)) {
    throw new Error(
      `Unsupported image type: ${file.type}. Use JPEG, PNG, or WebP.`,
    );
  }

  const img = await createImageBitmap(file);
  const maxDim = 2000;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.82 });
}
