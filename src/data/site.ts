// Every image slot on the page, by master file stem in src/assets/{people,feed,garments}.
// The images are temporary generated placeholders; swapping one is a change here and a new master.

export type ImageId = string;
export interface Post { handle: string; age: string; image: ImageId; liked?: boolean }
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

// A product page on some shop's site: the phone flips through a few, then shares the last one to DressYou.
// The .example domains are reserved for examples, so no real shop is implied.
export interface ShopPage { domain: string; name: string; price: string; image: ImageId; cutout: boolean; theme: 'white' | 'sand' }
export const HOW: {
  shop: { pages: ShopPage[]; render: ImageId };
  wardrobe: { grid: ImageId[]; picks: ImageId[]; render: ImageId };
  feed: { post: Post; render: ImageId };
} = {
  shop: {
    pages: [
      { domain: 'nordstudio.example', name: 'Navy overshirt', price: '€89', image: 'g-navy-overshirt', cutout: true, theme: 'white' },
      { domain: 'maisonclair.example', name: 'Suede loafers', price: '€140', image: 'g-brown-loafers', cutout: true, theme: 'sand' },
      { domain: 'atelierneuf.example', name: 'Belted trench', price: '€149', image: 'shop-trench', cutout: false, theme: 'white' },
    ],
    render: 'twin-trench',
  },
  wardrobe: {
    grid: ['g-navy-overshirt', 'g-grey-crewneck', 'g-ecru-trousers', 'g-white-sneakers', 'g-black-tee', 'g-chelsea-boots'],
    picks: ['g-grey-crewneck', 'g-ecru-trousers', 'g-white-sneakers', 'g-navy-overshirt'],
    render: 'twin-m-overshirt',
  },
  feed: { post: { handle: 'naya', age: '2h', image: 'feed-w-trench' }, render: 'twin-cap-trench' },
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

// Friends by initial; each look lists who voted for it. The fan shows the looks in label order.
export const FRIENDS = ['M', 'S', 'N', 'J'];
export interface FriendLook { image: ImageId; label: string; order: number; votes: string[] }
// Two rounds of asking: a woman's three looks, then a man's. The friends' pick in each is the look with the most votes.
export const FRIEND_SETS: FriendLook[][] = [
  [
    { image: 'twin-office', label: 'look 1', order: 1, votes: ['S'] },
    { image: 'twin-knitset', label: 'look 3', order: 3, votes: [] },
    { image: 'twin-knitdress', label: 'look 2', order: 2, votes: ['M', 'N', 'J'] },
  ],
  [
    { image: 'twin-m-polo', label: 'look 1', order: 1, votes: ['M'] },
    { image: 'twin-m-tee', label: 'look 3', order: 3, votes: [] },
    { image: 'twin-m-crewneck', label: 'look 2', order: 2, votes: ['S', 'N', 'J'] },
  ],
];

export const STYLIST: { dinner: ImageId[]; trip: ImageId[]; find: ImageId } = {
  dinner: ['g-white-oxford-shirt', 'g-black-wide-trousers', 'g-brown-loafers', 'g-navy-overshirt'],
  trip: ['g-grey-crewneck', 'g-dark-straight-jeans', 'g-black-tee', 'g-ecru-trousers', 'g-white-sneakers', 'g-chelsea-boots'],
  find: 'g-black-knit-polo',
};
