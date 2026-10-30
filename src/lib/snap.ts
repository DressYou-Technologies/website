// Where the pinned stylist story settles after a scroll, as timeline progress. Inside the story it lands on the
// next question in the scroll's direction; above the first or past the last, it lets the visitor leave.
const EPSILON = 1e-4;

export function storySnap(labels: number[], value: number, direction: number): number {
  const first = labels[0], last = labels[labels.length - 1];
  if (direction < 0 && value < first - EPSILON) return 0;
  if (direction > 0 && value > last + EPSILON) return 1;
  if (direction > 0) return labels.find((label) => label >= value - EPSILON) ?? 1;
  return [...labels].reverse().find((label) => label <= value + EPSILON) ?? 0;
}
