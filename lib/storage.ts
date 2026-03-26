import { Model } from './models';
import seedData from '@/data/models.json';

const BLOB_KEY = 'models-data.json';

export async function getModels(): Promise<{ models: Model[]; lastUpdated: string | null }> {
  // Try Vercel Blob first (runtime updates from cron)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list, head } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: 'models-data' });
      if (blobs.length > 0) {
        const latest = blobs.sort((a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )[0];
        const res = await fetch(latest.url, { next: { revalidate: 3600 } });
        if (res.ok) {
          const data = await res.json();
          return {
            models: data.models ?? data,
            lastUpdated: data.lastUpdated ?? latest.uploadedAt,
          };
        }
      }
    } catch {
      // Fall through to static data
    }
  }

  // Fall back to static seed data
  return { models: seedData as Model[], lastUpdated: null };
}

export async function saveModels(models: Model[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN not set');
  }
  const { put } = await import('@vercel/blob');
  const payload = JSON.stringify({ models, lastUpdated: new Date().toISOString() });
  await put(BLOB_KEY, payload, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}
