import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  ensureValidAccessToken,
} from './supabaseClient';

export interface CompressedImageResult {
  blob: Blob;
  width: number;
  height: number;
  previewUrl: string;
}

/**
 * Kompresuje i optymalizuje plik graficzny po stronie przeglądarki do formatu WebP (lub JPEG),
 * zmniejszając rozdzielczość maksymalnie do 1600px na dłuższym boku, usuwając zbędne metadane
 * i redukując rozmiar z kilku MB do ~200-400 KB.
 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82,
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Nie udało się utworzyć kontekstu 2D dla obrazu.'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Sprawdź wsparcie WebP, jeśli nie - zapisz jako JPEG
      const mimeType = 'image/webp';
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback na JPEG
            canvas.toBlob(
              (fallbackBlob) => {
                if (!fallbackBlob) {
                  reject(new Error('Błąd generowania pliku graficznego.'));
                  return;
                }
                const previewUrl = URL.createObjectURL(fallbackBlob);
                resolve({ blob: fallbackBlob, width, height, previewUrl });
              },
              'image/jpeg',
              quality,
            );
            return;
          }
          const previewUrl = URL.createObjectURL(blob);
          resolve({ blob, width, height, previewUrl });
        },
        mimeType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Nie udało się wczytać wybranego pliku graficznego.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Wgrywa skompresowany plik zdjęcia ogłoszenia do Supabase Storage bucket 'ad-images'
 * i zwraca publiczny adres URL.
 */
export async function uploadAdImage(file: File, profileId?: string): Promise<string> {
  const compressed = await compressImage(file);
  const token = await ensureValidAccessToken();
  const folder = profileId ? profileId.replace(/[^a-zA-Z0-9_-]/g, '') : 'sasiad';
  const extension = compressed.blob.type === 'image/webp' ? 'webp' : 'jpg';
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const fileName = `${Date.now()}_${randomSuffix}.${extension}`;
  const filePath = `${folder}/${fileName}`;

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/ad-images/${filePath}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': compressed.blob.type,
      'x-upsert': 'true',
    },
    body: compressed.blob,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Błąd wysyłania zdjęcia do magazynu (${res.status}): ${errorText}`);
  }

  // Zwróć publiczny URL
  return `${SUPABASE_URL}/storage/v1/object/public/ad-images/${filePath}`;
}
