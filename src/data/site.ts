// Every image slot on the page, by master file stem in src/assets/{people,feed,garments}.
// The images are temporary generated placeholders; swapping one is a change here and a new master.

export type ImageId = string;
export interface Post { handle: string; age: string; image: ImageId }
// Piece i comes from WARDROBE_ROWS[i]; the render is the twin wearing all four.
export interface Outfit { pieces: [ImageId, ImageId, ImageId, ImageId]; render: ImageId }

export const SITE = {
  name: 'dressyou',
  url: 'https://dressyouapp.com',
  tagline: "Try it on before it's yours.",
  description: 'DressYou makes a twin from your own photos, so you can try on clothes from any shop, your wardrobe or the feed before you buy.',
};

// A null store link turns its buttons into the "coming soon." dialog.
export const LINKS: { appUrl: string | null; extensionUrl: string | null; email: string } = {
  appUrl: null,
  extensionUrl: null,
  email: 'hello@dressyouapp.com',
};

// Column-major: 9 columns on the hero cylinder, 3 tiles each.
export const WALL: ImageId[][] = [
  ['wall-w-bob', 'wall-m-athletic', 'twin-trench'],
  ['wall-m-glasses', 'wall-w-blonde', 'wall-m-knit'],
  ['wall-w-curls', 'twin-knitdress', 'wall-m-camel'],
  ['wall-m-overshirt', 'wall-w-braids', 'wall-w-bob'],
  ['twin-knitset', 'wall-w-hijab', 'wall-m-leather'],
  ['wall-w-red', 'wall-m-denim', 'wall-m-glasses'],
  ['wall-m-athletic', 'twin-office', 'wall-w-linen'],
  ['wall-w-silver', 'wall-m-knit', 'wall-w-curls'],
  ['wall-w-wrap', 'wall-m-overshirt', 'wall-w-blonde'],
];

export const HOW: {
  shop: { image: ImageId; render: ImageId };
  wardrobe: { grid: ImageId[]; picks: ImageId[]; render: ImageId };
  feed: { post: Post; render: ImageId };
} = {
  shop: { image: 'shop-trench', render: 'twin-trench' },
  wardrobe: {
    grid: ['g-cream-top', 'g-black-knit-dress', 'g-barrel-jeans', 'g-slingbacks', 'g-taupe-sweater', 'g-chelsea-boots'],
    picks: ['g-black-knit-dress', 'g-slingbacks'],
    render: 'twin-knitdress',
  },
  feed: { post: { handle: 'naya', age: '2h', image: 'feed-w-trench' }, render: 'twin-cap-trench' },
};

// Tops, bottoms, shoes, layers.
export const WARDROBE_ROWS: ImageId[][] = [
  ['g-cream-top', 'g-black-tee', 'g-taupe-sweater', 'g-white-tank'],
  ['g-barrel-jeans', 'g-grey-trousers', 'g-pinstripe-trousers', 'g-black-wide-trousers'],
  ['g-chelsea-boots', 'g-ballet-flats', 'g-slingbacks', 'g-brown-boots'],
  ['g-trench', 'g-black-cap', 'g-black-knit-dress'],
];

// The wardrobe spin lands on these in order, so the result always matches its pieces.
export const OUTFITS: Outfit[] = [
  { pieces: ['g-white-tank', 'g-barrel-jeans', 'g-brown-boots', 'g-trench'], render: 'twin-trench' },
  { pieces: ['g-taupe-sweater', 'g-grey-trousers', 'g-ballet-flats', 'g-black-cap'], render: 'twin-knit-cap' },
  { pieces: ['g-black-tee', 'g-pinstripe-trousers', 'g-chelsea-boots', 'g-trench'], render: 'twin-tee-trench' },
];

export const FEED_TRACKS: [Post[], Post[]] = [
  [
    { handle: 'naya', age: '2h', image: 'feed-w-trench' },
    { handle: 'sasha', age: '1d', image: 'feed-w-mirror' },
    { handle: 'theo', age: '3d', image: 'feed-m-coffee' },
  ],
  [
    { handle: 'mei', age: '5h', image: 'feed-w-bench' },
    { handle: 'lea', age: '4h', image: 'feed-w-bakery' },
    { handle: 'ines', age: '2d', image: 'feed-w-canal' },
    { handle: 'kofi', age: '1d', image: 'feed-m-lounge' },
  ],
];

// "In this look" over the feed tile: naya's post.
export const LOOK_PIECES: ImageId[] = ['g-black-cap', 'g-trench', 'g-white-tank', 'g-barrel-jeans', 'g-brown-boots'];

export const FRIEND_LOOKS: { image: ImageId; label: string; pick: boolean }[] = [
  { image: 'twin-office', label: 'look 1', pick: false },
  { image: 'twin-knitset', label: 'look 3', pick: false },
  { image: 'twin-trench', label: 'look 2', pick: true },
];

export const STYLIST: { dinner: ImageId[]; trip: ImageId[]; find: ImageId } = {
  dinner: ['g-cream-top', 'g-black-wide-trousers', 'g-ballet-flats', 'g-trench'],
  trip: ['g-cream-top', 'g-barrel-jeans', 'g-black-tee', 'g-taupe-sweater', 'g-chelsea-boots', 'g-slingbacks'],
  find: 'g-black-knit-dress',
};
