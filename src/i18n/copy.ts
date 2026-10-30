import type { Lang } from './lang';

// Every string the page shows, per language. French is authored, not translated word for word (voice guide §6).
// No semicolons and no em dashes anywhere (founder, 2026-10-30). Copy never names a measurement or says how a piece fits.
// The company pages are in the works: the menu and the footer both link them (founder, 2026-10-30).
const companyEn: [string, string][] = [['About', '/about'], ['Journal', '/journal'], ['Careers', '/careers'], ['Press', '/press'], ['Help', '/help']];
const companyFr: [string, string][] = [['À propos', '/about'], ['Journal', '/journal'], ['Carrières', '/careers'], ['Presse', '/press'], ['Aide', '/help']];

// What the stylist checked before an answer: a label and the value it found.
type Check = [label: string, value: string];
const checks = (...rows: Check[]): Check[] => rows;

const en = {
  meta: {
    title: 'Virtual try-on on your own twin | DressYou',
    description: 'Make your twin in the app, then try on clothes from any online shop, your wardrobe or the feed before you buy.',
    ogAlt: 'People in different outfits on a curved wall, with the DressYou logo.',
    locale: 'en_GB',
    tagline: "Try it on before it's yours.",
  },
  get: { app: 'Get the app', extension: 'Get the extension', qr: 'QR code to download the app' },
  lang: { heading: 'Language', switchTo: 'Français', label: 'Lire en français' },
  menu: { label: 'Menu', links: companyEn },
  soon: { tag: 'In the works', text: 'This page is on its way. Until then, write to', home: 'Back to DressYou' },
  hero: { lines: ['Try it on', "before it's yours."], sub: 'Your twin, your size, and a stylist who knows your wardrobe.' },
  how: {
    lead: 'Tap try on',
    from: 'from',
    words: ['any shop.', 'your wardrobe.', 'the feed.'],
    next: 'Next source',
    steps: ['tap try on', 'see it on you', 'get your size', 'ask your stylist'],
    stepsLabel: 'How it works',
    shopPages: [['Navy overshirt', '€89'], ['Suede loafers', '€140'], ['Wool coat', '€290']],
    // Safari and its share sheet as iOS 27 labels them (captured on the iPhone 18 Pro simulator, 2026-10-30).
    safari: {
      menu: ['Translate Website…', 'Share', 'Add to Bookmarks', 'Add Bookmark to…', 'Find on Page', 'Page Zoom'],
      options: 'Options', more: 'More', actions: ['Copy', 'Add to Bookmarks', 'Add to Reading List', 'View More'],
    },
    // The app's own words, lowercase as the app kit writes them.
    wardrobe: { title: 'wardrobe', search: 'search', select: 'select', tabs: ['items', 'outfits', 'tried'], tryOn: 'try the outfit' },
    feed: { title: 'feed', search: 'search a @user', tabs: ['for you', 'following'] },
    tryOn: { title: 'try-on', change: 'change pieces', ask: 'ask your stylist about this look' },
    // Per scene: the card beside the phone (a size from the clothes you kept, or what your wardrobe says), then a question.
    scenes: [
      { label: 'your size', rows: [['M', 'as cut', 'like the coat you kept'], ['L', 'sized up', 'a looser line']], q: 'what do i wear it with?', a: 'your black trousers and the turtleneck. 3 outfits with what you own.' },
      { label: 'from your wardrobe', rows: [['11×', 'worn', 'the black polo'], ['4×', 'together', 'with the ecru trousers']], q: 'for friday’s dinner?', a: 'yes. 18° at 8 pm, no jacket needed. plan it for friday?' },
      { label: 'your size', rows: [['S', 'as cut', 'like the skirt you kept'], ['M', 'roomier', 'a looser drape']], q: 'do i own anything like it?', a: 'the white oxford, yes. only the satin skirt would be new.' },
    ],
  },
  more: {
    title: 'More than a try-on.',
    wardrobe: { lines: ['Fill your wardrobe.', 'Build outfits.'], text: 'Add what you own once. Every piece you look at is then checked against it, and every outfit goes on your twin.' },
    feed: { title: 'A feed of real people.', text: 'Real photos, never renders. Try any look on your twin. What you save shapes what you see next.', inLook: 'in this look', pieces: 'pieces', tryOutfit: 'try the outfit', tryOn: 'Try on' },
    friend: { ask: 'Ask friends', shared: 'shared', title: 'Ask a friend.', text: "Send the looks you can't choose between. Your friends vote live." },
  },
  stylist: {
    title: 'A stylist who knows you, and says why.',
    tabsLabel: 'What the stylist does',
    tabs: ['Ask for an opinion', 'Dress for the day', 'Pack for a trip', 'Find a piece', 'Shop for an event'],
    // Before each answer the stylist ticks off what it checked (founder, 2026-10-30), in the order the spec checks them.
    checked: 'what i checked',
    opinion: {
      q: 'should i buy this coat?',
      checks: checks(['size', 'M, like the coat you kept'], ['goes with', '1 new outfit'], ['you own', 'a camel coat like it'], ['worn', '20 times this winter']),
      a: 'i’d skip it. your camel coat already does the same job. want to see them side by side?',
    },
    day: {
      q: 'what do i wear today?',
      checks: checks(['weather', '14°, rain from 6 pm'], ['calendar', 'dinner, 8 pm'], ['wardrobe', '52 pieces'], ['you wear most', 'navy and black']),
      a: 'the white oxford, your black trousers, the overshirt and the chelsea boots. rain by dinner, so not the suede loafers.',
      cta: 'try it',
    },
    trip: {
      q: 'pack for lisbon, 4 days in may.',
      checks: checks(['dates', '14 to 17 may'], ['weather', '23°, may average'], ['plans', '1 dinner out'], ['wardrobe', '52 pieces'], ['you wear most', 'navy and black']),
      head: 'lisbon · 4 days · cabin bag', count: '6 pieces · 5 outfits',
      a: 'all from your wardrobe, nothing to buy. the chelsea boots for the dinner.',
    },
    find: {
      q: 'a black knit polo under €150, for friday.',
      checks: checks(['budget', '€150 max'], ['size', 'M in stock'], ['you wear most', 'black knits'], ['with your clothes', '3 outfits'], ['delivery', 'not guaranteed by friday']),
      name: 'knit polo', price: '€120 · nord studio', fit: 'best with your ecru trousers', cta: 'try it on',
    },
    buy: {
      q: 'an outfit for saturday, under €100.',
      checks: checks(['plans', 'birthday dinner, sat'], ['from your wardrobe', 'trousers and boots'], ['budget', '€100 max'], ['size', 'M in stock'], ['delivery', 'not guaranteed by saturday']),
      a: 'this knit goes with your black trousers and boots. if it’s late, wear the white oxford.',
      price: '€85 · nord studio', cta: 'buy on nord studio',
    },
    ask: 'ask your stylist',
  },
  finale: {
    mega: ['Wear it', 'first.'],
    notify: 'Try it before everyone else. One email when the app is out.',
    extension: 'Chrome extension',
    soon: 'coming soon',
    columns: [
      { label: 'Product', links: [['How it works', '/#how'], ['Wardrobe', '/#more'], ['Stylist', '/#stylist']] },
      { label: 'Company', links: companyEn },
      { label: 'Legal', links: [['Legal notice', '/legal'], ['Privacy', '/privacy'], ['Terms', '/terms']] },
    ],
    made: 'Made in Paris',
    footer: 'Footer',
    ai: 'People shown on this page are AI-generated.',
  },
  dialog: {
    close: 'Close',
    notify: { title: 'Be the first to know.', lede: 'One email, the day the app is out.', email: 'Email', placeholder: 'you@example.com', submit: 'Notify me', fine: 'One email to confirm your address. No spam, unsubscribe anytime.', privacy: 'Privacy' },
    says: { ok: 'Check your inbox to confirm your email.', email: "That email doesn't look right.", closed: 'Sign-ups open very soon.', failed: 'Something went wrong. Try again in a minute.' },
    appReady: 'Get the app.',
    extension: { title: 'Try on from any shop.', lede: 'The extension adds DressYou to every product page in Chrome.', bag: 'Add to bag', fit: 'as cut', usual: 'like the coat you kept', add: 'Add to Chrome', soon: 'Coming soon to Chrome' },
  },
  doc: { updated: 'Last updated', home: 'Back to DressYou' },
  notFound: { title: 'This page does not exist.', text: 'The link may be old. Everything DressYou does is on the home page.', home: 'Go to the home page' },
};

export type Copy = typeof en;

const fr: Copy = {
  meta: {
    title: 'Essayage virtuel sur votre jumeau | DressYou',
    description: "Créez votre jumeau dans l'app, puis essayez les vêtements de n'importe quelle boutique en ligne, de votre garde-robe ou du fil, avant d'acheter.",
    ogAlt: 'Des personnes en tenues variées sur un mur incurvé, avec le logo DressYou.',
    locale: 'fr_FR',
    tagline: "Essayez-le avant qu'il soit à vous.",
  },
  get: { app: "Télécharger l'app", extension: "Installer l'extension", qr: "QR code pour télécharger l'app" },
  lang: { heading: 'Langue', switchTo: 'English', label: 'Read in English' },
  menu: { label: 'Menu', links: companyFr },
  soon: { tag: 'En préparation', text: 'Cette page arrive bientôt. En attendant, écrivez à', home: 'Retour à DressYou' },
  hero: { lines: ['Essayez-le', "avant qu'il soit à vous."], sub: 'Votre jumeau, votre taille et un styliste qui connaît votre garde-robe.' },
  how: {
    lead: 'Essayez',
    from: 'depuis',
    words: ['toute boutique.', 'votre garde-robe.', 'le fil.'],
    next: 'Source suivante',
    steps: ['touchez essayer', 'voyez-le porté', 'obtenez votre taille', 'demandez à votre styliste'],
    stepsLabel: 'Comment ça marche',
    shopPages: [['Surchemise marine', '89 €'], ['Mocassins en daim', '140 €'], ['Manteau en laine', '290 €']],
    safari: {
      menu: ['Traduire le site web…', 'Partager', 'Ajouter aux signets', 'Ajouter un signet à…', 'Rechercher dans la page', 'Zoom de la page'],
      options: 'Options', more: 'Plus', actions: ['Copier', 'Ajouter aux signets', 'Ajouter à la liste de lecture', 'Afficher plus'],
    },
    wardrobe: { title: 'garde-robe', search: 'rechercher', select: 'choisir', tabs: ['pièces', 'tenues', 'essayés'], tryOn: 'essayer la tenue' },
    feed: { title: 'fil', search: 'rechercher un @compte', tabs: ['pour vous', 'abonnements'] },
    tryOn: { title: 'essayage', change: 'changer de pièces', ask: 'demandez à votre styliste' },
    scenes: [
      { label: 'votre taille', rows: [['M', 'coupe prévue', 'comme le manteau gardé'], ['L', 'plus ample', 'une ligne plus souple']], q: 'je le porte avec quoi ?', a: 'votre pantalon noir et le col roulé. 3 tenues avec ce que vous avez.' },
      { label: 'de votre garde-robe', rows: [['11×', 'porté', 'le polo noir'], ['4×', 'ensemble', 'avec le pantalon écru']], q: 'pour le dîner de vendredi ?', a: 'oui. 18° à 20 h, pas besoin de veste. on la prévoit pour vendredi ?' },
      { label: 'votre taille', rows: [['S', 'coupe prévue', 'comme la jupe gardée'], ['M', 'plus ample', 'un tombé plus souple']], q: 'j’ai quelque chose de pareil ?', a: 'la chemise oxford blanche, oui. seule la jupe en satin serait nouvelle.' },
    ],
  },
  more: {
    title: 'Plus qu’un essayage.',
    wardrobe: { lines: ['Remplissez votre garde-robe.', 'Créez des tenues.'], text: 'Ajoutez une fois ce que vous possédez. Chaque pièce que vous regardez y est ensuite comparée, et chaque tenue passe sur votre jumeau.' },
    feed: { title: 'Un fil de vraies personnes.', text: 'De vraies photos, jamais de rendus. Essayez n’importe quel look sur votre jumeau. Ce que vous enregistrez guide ce que vous verrez ensuite.', inLook: 'dans ce look', pieces: 'pièces', tryOutfit: 'essayer la tenue', tryOn: 'Essayer' },
    friend: { ask: 'Demander', shared: 'partagé', title: 'Demandez à vos amis.', text: 'Envoyez les looks entre lesquels vous hésitez. Vos amis votent en direct.' },
  },
  stylist: {
    title: 'Un styliste qui vous connaît, et dit pourquoi.',
    tabsLabel: 'Ce que fait le styliste',
    tabs: ['Demander un avis', 'S’habiller pour la journée', 'Préparer un voyage', 'Trouver une pièce', 'Acheter pour un événement'],
    checked: 'ce que j’ai vérifié',
    opinion: {
      q: 'j’achète ce manteau ?',
      checks: checks(['taille', 'M, comme le manteau gardé'], ['va avec', '1 nouvelle tenue'], ['vous avez', 'un manteau camel proche'], ['porté', '20 fois cet hiver']),
      a: 'je passerais mon tour. votre manteau camel fait déjà le même travail. on les compare côte à côte ?',
    },
    day: {
      q: 'je mets quoi aujourd’hui ?',
      checks: checks(['météo', '14°, pluie dès 18 h'], ['agenda', 'dîner, 20 h'], ['garde-robe', '52 pièces'], ['vous portez surtout', 'marine et noir']),
      a: 'la chemise oxford blanche, votre pantalon noir, la surchemise et les bottines chelsea. pluie avant le dîner : pas les mocassins en daim.',
      cta: 'l’essayer',
    },
    trip: {
      q: 'valise pour lisbonne, 4 jours en mai.',
      checks: checks(['dates', 'du 14 au 17 mai'], ['météo', '23°, moyenne de mai'], ['au programme', '1 dîner'], ['garde-robe', '52 pièces'], ['vous portez surtout', 'marine et noir']),
      head: 'lisbonne · 4 jours · bagage cabine', count: '6 pièces · 5 tenues',
      a: 'tout vient de votre garde-robe, rien à acheter. les bottines chelsea pour le dîner.',
    },
    find: {
      q: 'un polo en maille noir, moins de 150 €, pour vendredi.',
      checks: checks(['budget', '150 € max'], ['taille', 'M en stock'], ['vous portez surtout', 'mailles noires'], ['avec vos pièces', '3 tenues'], ['livraison', 'non garantie d’ici vendredi']),
      name: 'polo en maille', price: '120 € · nord studio', fit: 'idéal avec votre pantalon écru', cta: 'l’essayer',
    },
    buy: {
      q: 'une tenue pour samedi, moins de 100 €.',
      checks: checks(['au programme', 'dîner d’anniversaire, sam.'], ['de votre garde-robe', 'pantalon et bottines'], ['budget', '100 € max'], ['taille', 'M en stock'], ['livraison', 'non garantie d’ici samedi']),
      a: 'cette maille va avec votre pantalon noir et vos bottines. si elle arrive tard, la chemise oxford blanche.',
      price: '85 € · nord studio', cta: 'acheter sur nord studio',
    },
    ask: 'demandez à votre styliste',
  },
  finale: {
    mega: ['Portez-le', 'en premier.'],
    notify: 'Essayez-le avant tout le monde. Un seul e-mail à la sortie de l’app.',
    extension: 'Extension Chrome',
    soon: 'bientôt',
    columns: [
      { label: 'Produit', links: [['Comment ça marche', '/#how'], ['Garde-robe', '/#more'], ['Styliste', '/#stylist']] },
      { label: 'Entreprise', links: companyFr },
      { label: 'Légal', links: [['Mentions légales', '/legal'], ['Confidentialité', '/privacy'], ['Conditions', '/terms']] },
    ],
    made: 'Conçu à Paris',
    footer: 'Pied de page',
    ai: 'Les personnes montrées sur cette page sont générées par IA.',
  },
  dialog: {
    close: 'Fermer',
    notify: { title: 'Ne manquez pas la sortie.', lede: 'Un seul e-mail, le jour de la sortie de l’app.', email: 'E-mail', placeholder: 'vous@exemple.fr', submit: 'Me prévenir', fine: 'Un e-mail pour confirmer votre adresse. Pas de spam, désinscription à tout moment.', privacy: 'Confidentialité' },
    says: { ok: 'Ouvrez votre boîte mail pour confirmer votre adresse.', email: 'Cette adresse ne semble pas valide.', closed: 'Les inscriptions ouvrent très bientôt.', failed: 'Un problème est survenu. Réessayez dans une minute.' },
    appReady: 'Télécharger l’app.',
    extension: { title: 'Essayez depuis toute boutique.', lede: 'L’extension ajoute DressYou à chaque page produit dans Chrome.', bag: 'Ajouter au panier', fit: 'coupe prévue', usual: 'comme le manteau gardé', add: 'Ajouter à Chrome', soon: 'Bientôt sur Chrome' },
  },
  doc: { updated: 'Mis à jour le', home: 'Retour à DressYou' },
  notFound: { title: 'Cette page n’existe pas.', text: 'Le lien est peut-être ancien. Tout ce que fait DressYou est sur la page d’accueil.', home: 'Aller à l’accueil' },
};

export const COPY: Record<Lang, Copy> = { en, fr };
