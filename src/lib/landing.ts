// Where a wardrobe row stops: past `laps` tiles in its direction, on the next tile showing `garment`
// (child j shows garment j % n), kept inside [min, max] so the row never shows a gap at either end.
export interface Spin { base: number; dir: 1 | -1; laps: number; n: number; garment: number; min: number; max: number }

export function landing({ base, dir, laps, n, garment, min, max }: Spin): number {
  let target = base + dir * laps;
  while (((target % n) + n) % n !== garment) target += dir;
  while (target > max) target -= n;
  while (target < min) target += n;
  return target;
}
