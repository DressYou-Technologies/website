import type { ImageMetadata } from 'astro';
import type { ImageId } from '../data/site';

// Photos are JPEG; the twin and the garments are WebP cutouts with transparency.
const masters = import.meta.glob<{ default: ImageMetadata }>('../assets/*/*.{jpg,webp}', { eager: true });
const byId = new Map(Object.entries(masters).map(([path, mod]) => [path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.')), mod.default]));

// The data names images by file stem; a missing master fails the build rather than shipping a hole.
export function image(id: ImageId): ImageMetadata {
  const meta = byId.get(id);
  if (!meta) throw new Error(`No image master for "${id}"`);
  return meta;
}
