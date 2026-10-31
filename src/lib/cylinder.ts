// The hero's columns sit on a cylinder whose edges bend toward the viewer; the middle sits deepest and darkest.
// Every angle is a ratio of the tile width, so x and z come out in tile widths and CSS multiplies them by it.
const GAP = .08;           // gap between columns, in tile widths
const RADIUS = 5;          // cylinder radius, in tile widths
const NEAR_OPACITY = .45;  // the middle column
const FAR_OPACITY = .95;   // the outermost columns

export interface Column { x: number; z: number; rotateY: number; opacity: number }

export function cylinder(count: number): Column[] {
  const step = (1 + GAP) / RADIUS;
  const mid = (count - 1) / 2;
  return Array.from({ length: count }, (_, i) => {
    const phi = (i - mid) * step;
    return {
      x: RADIUS * Math.sin(phi),
      z: RADIUS * (1 - Math.cos(phi)),
      rotateY: -phi * 180 / Math.PI,
      opacity: NEAR_OPACITY + (FAR_OPACITY - NEAR_OPACITY) * Math.abs(phi) / (mid * step),
    };
  });
}
