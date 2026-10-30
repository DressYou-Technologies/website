// Every image slot on the page, by master file stem in src/assets/{people,feed,garments}.
// The images are temporary generated placeholders; swapping one is a change here and a new master.

export type ImageId = string;
export interface Post { handle: string; age: string; image: ImageId; liked?: boolean }
// Piece i comes from WARDROBE_ROWS[i]; the render is the twin wearing all four.
export interface Outfit { pieces: [ImageId, ImageId, ImageId, ImageId]; render: ImageId }

// The name, tagline and descriptions are copy, per language (src/i18n/copy.ts).
export const SITE = { url: 'https://dressyouapp.com' };

// A null store link turns its buttons into the "coming soon." dialog.
export const LINKS: { appUrl: string | null; extensionUrl: string | null; email: string } = {
  appUrl: null,
  extensionUrl: null,
  email: 'hello@dressyouapp.com',
};

// Column-major: 9 columns on the hero cylinder, 3 tiles each.
export const WALL: ImageId[][] = [
  ['wall-w-tank', 'wall-m-locs', 'wall-w-silver'],
  ['wall-m-suit', 'wall-w-braids', 'wall-m-knit'],
  ['wall-w-curls', 'wall-m-skate', 'wall-w-hijab'],
  ['wall-m-polo', 'wall-w-afro', 'wall-m-camel'],
  ['wall-w-street', 'wall-m-athletic', 'wall-w-wrap'],
  ['wall-m-denim', 'wall-w-linen', 'wall-m-leather'],
  ['wall-w-red', 'wall-m-overshirt', 'wall-w-pleats'],
  ['wall-m-workwear', 'wall-w-knitset', 'wall-m-varsity'],
  ['wall-w-blonde', 'wall-m-preppy', 'wall-w-track'],
];

// The footer headline's window cycles through some of the hero's people.
export const FINALE_REEL: ImageId[] = ['wall-w-knitset', 'wall-m-suit', 'wall-w-red', 'wall-m-preppy', 'wall-w-linen', 'wall-m-camel'];

// A product page on some shop's site: the phone swipes through a few open tabs, then shares the last one to DressYou.
// The .example domains are reserved for examples, so no real shop is implied; each page shows its piece as a flat lay.
// Its name and price are copy, per language, in the same order (src/i18n/copy.ts, how.shopPages).
export interface ShopPage { domain: string; brand: string; image: ImageId; theme: 'white' | 'sand' }
// The phone's try-ons are studio photos in the hero's recipe (founder, 2026-10-30), not cutouts.
export const HOW: {
  shop: { pages: ShopPage[]; render: ImageId };
  wardrobe: { grid: ImageId[]; picks: ImageId[]; render: ImageId };
  feed: { post: Post; render: ImageId };
} = {
  shop: {
    pages: [
      { domain: 'nord.example', brand: 'Nord Studio', image: 'g-navy-overshirt', theme: 'white' },
      { domain: 'clair.example', brand: 'Maison Clair', image: 'g-brown-loafers', theme: 'sand' },
      { domain: 'neuf.example', brand: 'Atelier Neuf', image: 'g-brown-coat', theme: 'white' },
    ],
    render: 'render-w-coat',
  },
  wardrobe: {
    grid: ['g-navy-overshirt', 'g-black-knit-polo', 'g-white-oxford-shirt', 'g-ecru-trousers', 'g-black-wide-trousers', 'g-dark-straight-jeans', 'g-brown-loafers', 'g-white-sneakers', 'g-chelsea-boots', 'g-grey-crewneck', 'g-taupe-sweater', 'g-black-cap'],
    picks: ['g-black-knit-polo', 'g-ecru-trousers', 'g-brown-loafers'],
    render: 'render-m-polo',
  },
  feed: { post: { handle: 'linh', age: '2h', image: 'feed-w-shirt' }, render: 'render-w-shirt' },
};

// Tops, bottoms, shoes, layers.
export const WARDROBE_ROWS: ImageId[][] = [
  ['g-white-tank', 'g-black-tee', 'g-grey-crewneck', 'g-taupe-sweater'],
  ['g-barrel-jeans', 'g-ecru-trousers', 'g-pinstripe-trousers', 'g-black-wide-trousers'],
  ['g-brown-boots', 'g-white-sneakers', 'g-chelsea-boots', 'g-brown-loafers'],
  ['g-trench', 'g-navy-overshirt', 'g-black-cap'],
];

// The wardrobe spin lands on these in order, so the result always matches its pieces.
export const OUTFITS: Outfit[] = [
  { pieces: ['g-white-tank', 'g-barrel-jeans', 'g-brown-boots', 'g-trench'], render: 'twin-trench' },
  { pieces: ['g-grey-crewneck', 'g-ecru-trousers', 'g-white-sneakers', 'g-navy-overshirt'], render: 'twin-m-overshirt' },
  { pieces: ['g-black-tee', 'g-black-wide-trousers', 'g-chelsea-boots', 'g-black-cap'], render: 'twin-m-tee-cap' },
];

export const FEED_TRACKS: [Post[], Post[]] = [
  [
    { handle: 'naya', age: '2h', image: 'feed-w-trench', liked: true },
    { handle: 'sami', age: '1d', image: 'feed-m-mirror' },
    { handle: 'theo', age: '3d', image: 'feed-m-coffee' },
  ],
  [
    { handle: 'mei', age: '5h', image: 'feed-w-selfie' },
    { handle: 'lea', age: '4h', image: 'feed-w-bakery', liked: true },
    { handle: 'jun', age: '2d', image: 'feed-m-canal' },
    { handle: 'kofi', age: '1d', image: 'feed-m-lounge' },
  ],
];

// "In this look" over the feed tile: naya's post.
export const LOOK_PIECES: ImageId[] = ['g-black-cap', 'g-trench', 'g-white-tank', 'g-barrel-jeans', 'g-brown-boots'];

// Friends by initial; each look lists who voted for it. The fan shows the looks in `order`.
export const FRIENDS = ['M', 'S', 'N', 'J'];
export interface FriendLook { image: ImageId; order: number; votes: string[] }
// Two rounds of asking: a woman's three looks, then a man's. The friends' pick in each is the look with the most votes.
export const FRIEND_SETS: FriendLook[][] = [
  [
    { image: 'twin-office', order: 1, votes: ['S'] },
    { image: 'twin-knitset', order: 3, votes: [] },
    { image: 'twin-knitdress', order: 2, votes: ['M', 'N', 'J'] },
  ],
  [
    { image: 'twin-m-polo', order: 1, votes: ['M'] },
    { image: 'twin-m-tee', order: 3, votes: [] },
    { image: 'twin-m-crewneck', order: 2, votes: ['S', 'N', 'J'] },
  ],
];

export const STYLIST: { dinner: ImageId[]; trip: ImageId[]; find: ImageId } = {
  dinner: ['g-white-oxford-shirt', 'g-black-wide-trousers', 'g-brown-loafers', 'g-navy-overshirt'],
  trip: ['g-grey-crewneck', 'g-dark-straight-jeans', 'g-black-tee', 'g-ecru-trousers', 'g-white-sneakers', 'g-chelsea-boots'],
  find: 'g-black-knit-polo',
};
