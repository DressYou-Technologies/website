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
  email: 'info@dressyouapp.com',
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

// Real shops' product pages as their phone sites lay them out, each with the shop's own packshot (founder, 2026-11-01):
// the phone swipes through the open tabs, then shares the last one to DressYou. Their words are copy, per language
// (src/i18n/copy.ts, how.shops), and `garment` is the shared piece cut out.
export type Shop = 'uniqlo' | 'arcteryx' | 'zara';
export interface ShopPage { shop: Shop; domain: string; image: ImageId }
// The phone's try-ons are studio photos in the hero's recipe (founder, 2026-10-30), not cutouts.
export const HOW: {
  shop: { pages: ShopPage[]; garment: ImageId; render: ImageId };
  wardrobe: { grid: ImageId[]; picks: ImageId[]; render: ImageId };
  feed: { scrolled: Post[]; post: Post; next: Post; render: ImageId };
} = {
  shop: {
    pages: [
      { shop: 'uniqlo', domain: 'uniqlo.com', image: 'shop-uniqlo-jumper' },
      { shop: 'arcteryx', domain: 'arcteryx.com', image: 'shop-arcteryx-jacket' },
      { shop: 'zara', domain: 'zara.com', image: 'shop-zara-coat' },
    ],
    garment: 'g-zara-coat',
    render: 'render-w-coat',
  },
  wardrobe: {
    grid: ['g-navy-overshirt', 'g-black-knit-polo', 'g-white-oxford-shirt', 'g-ecru-trousers', 'g-black-wide-trousers', 'g-dark-straight-jeans', 'g-brown-loafers', 'g-white-sneakers', 'g-chelsea-boots', 'g-grey-crewneck', 'g-taupe-sweater', 'g-black-cap'],
    picks: ['g-black-knit-polo', 'g-ecru-trousers', 'g-brown-loafers'],
    render: 'render-m-polo',
  },
  // The feed scrolls past a couple of posts and stops on the one tried, with the next one showing below it.
  feed: {
    scrolled: [{ handle: 'jun', age: '1h', image: 'feed-m-canal' }, { handle: 'lea', age: '3h', image: 'feed-w-bakery' }],
    post: { handle: 'linh', age: '4h', image: 'feed-w-shirt' },
    next: { handle: 'kofi', age: '5h', image: 'feed-m-lounge' },
    render: 'render-w-shirt',
  },
};

// Tops, bottoms, shoes, layers.
export const WARDROBE_ROWS: ImageId[][] = [
  ['g-white-tank', 'g-black-knit-polo', 'g-grey-crewneck', 'g-taupe-sweater'],
  ['g-barrel-jeans', 'g-ecru-trousers', 'g-pinstripe-trousers', 'g-black-wide-trousers'],
  ['g-brown-boots', 'g-white-sneakers', 'g-chelsea-boots', 'g-brown-loafers'],
  ['g-trench', 'g-navy-overshirt', 'g-brown-coat'],
];

// The wardrobe spin lands on these in order, so the result always matches its pieces.
export const OUTFITS: Outfit[] = [
  { pieces: ['g-white-tank', 'g-ecru-trousers', 'g-brown-loafers', 'g-trench'], render: 'render-w-trench' },
  { pieces: ['g-grey-crewneck', 'g-black-wide-trousers', 'g-chelsea-boots', 'g-navy-overshirt'], render: 'render-m-overshirt' },
  { pieces: ['g-black-knit-polo', 'g-ecru-trousers', 'g-white-sneakers', 'g-brown-coat'], render: 'render-m-coat' },
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

// The friends asked in the "Ask a friend" card: a name and a profile photo (src/assets/friends, original generated
// avatars, tools/imagery/jobs_v9_friends.py).
export interface Friend { name: string; photo: ImageId }
export const FRIENDS: Friend[] = [
  { name: 'Maya', photo: 'friend-cat' },
  { name: 'Noé', photo: 'friend-plush' },
  { name: 'Sami', photo: 'friend-dog' },
  { name: 'Lou', photo: 'friend-monkey' },
  { name: 'Jun', photo: 'friend-pilot' },
  { name: 'Inès', photo: 'friend-corgi' },
];
// One round of asking: from several looks the person picks two, chooses three friends to ask (indexes into FRIENDS),
// and each of them votes for one of the two (votes[k] is asked[k]'s choice: 0 or 1). A woman's round, then a man's.
export interface FriendRound { looks: ImageId[]; picked: [number, number]; asked: number[]; votes: (0 | 1)[] }
export const FRIEND_ROUNDS: FriendRound[] = [
  { looks: ['render-w-turtleneck', 'render-w-slipdress', 'render-w-knit', 'render-w-shirt'], picked: [0, 1], asked: [0, 3, 4], votes: [1, 1, 0] },
  { looks: ['render-m-polo', 'render-m-oxford', 'render-m-crewneck', 'render-m-coat'], picked: [1, 2], asked: [1, 2, 5], votes: [0, 1, 0] },
];

// The stylist's answers show these pieces; its words are copy (src/i18n/copy.ts, stylist).
export const STYLIST: { opinion: ImageId; dinner: ImageId[]; trip: ImageId[]; find: ImageId; buy: ImageId } = {
  opinion: 'g-brown-coat',
  dinner: ['g-white-oxford-shirt', 'g-black-wide-trousers', 'g-navy-overshirt', 'g-chelsea-boots'],
  trip: ['g-grey-crewneck', 'g-dark-straight-jeans', 'g-black-tee', 'g-ecru-trousers', 'g-white-sneakers', 'g-chelsea-boots'],
  find: 'g-black-knit-polo',
  buy: 'g-taupe-sweater',
};
