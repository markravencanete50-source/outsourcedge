// Unsigned Cloudinary upload — runs in the browser without exposing the API
// secret. Configure in your env (.env.local + Vercel):
//   VITE_CLOUDINARY_CLOUD_NAME   – e.g. wfrq1dyj
//   VITE_CLOUDINARY_UPLOAD_PRESET – an UNSIGNED upload preset you create in
//     Cloudinary → Settings → Upload → Upload presets (Signing Mode: Unsigned).
//
// PDFs are stored as `raw` so the original file downloads cleanly (Cloudinary
// blocks delivery of PDFs uploaded as the `image` type by default).

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export function cloudinaryConfigured(): boolean {
  return !!CLOUD_NAME && !!UPLOAD_PRESET;
}

/**
 * Upload a file/blob to Cloudinary (unsigned) and return its secure URL.
 * Throws if Cloudinary isn't configured or the upload fails — callers should
 * catch and degrade gracefully (the submission itself must still succeed).
 */
export async function uploadToCloudinary(
  file: Blob,
  filename: string,
  folder = 'applications',
): Promise<string> {
  if (!cloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured (missing VITE_CLOUDINARY_* env vars)');
  }

  const form = new FormData();
  form.append('file', file, filename);
  form.append('upload_preset', UPLOAD_PRESET!);
  form.append('folder', folder);
  // Keep a readable public_id so the downloaded file has a sensible name.
  form.append('public_id', filename.replace(/\.pdf$/i, ''));

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    { method: 'POST', body: form },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Cloudinary upload failed (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) throw new Error('Cloudinary upload returned no secure_url');
  return data.secure_url;
}
