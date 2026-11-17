import type { Lang } from './lang';

// Every string the page shows, per language. French is authored, not translated word for word (voice guide §6).
// No semicolons and no em dashes anywhere (founder, 2026-10-30). Copy never names a measurement or says how a piece fits.
// Short, polite and plain: no decorative words (founder, 2026-10-30). It shows what the stylist knows that answers the
// question asked, never how it tracks behaviour (founder, 2026-10-30). The stylist speaks politely and warmly, every line
// opening with a capital (founder, 2026-10-31). Everything else is lowercase like the app, names apart (founder,
// 2026-11-17). French says tu (founder, 2026-11-16). A shop's product is an item (article), a person's own a vêtement,
// and the French wardrobe is the dressing (founder, 2026-11-16).

// What the stylist checked before an answer: the kind of thing (its icon) and one short line saying what it found.
export type CheckKind = 'weather' | 'calendar' | 'wardrobe' | 'style' | 'budget' | 'size' | 'delivery' | 'outfits';
type Check = [kind: CheckKind, line: string];
const checks = (...rows: Check[]): Check[] => rows;

const en = {
  meta: {
    // The category first, then the two features people search for (founder, 2026-11-16).
    title: 'DressYou: social fashion app with virtual try-on and AI stylist',
    description: 'DressYou is the social fashion app. Try on clothes from any shop on your twin, style your wardrobe, ask your AI stylist and share looks with friends.',
    ogAlt: 'People in different outfits on a curved wall, with the DressYou logo.',
    locale: 'en_GB',
    tagline: "Try it on before it’s yours.",
  },
  get: { app: 'get the app', extension: 'get the extension', qr: 'QR code to download the app' },
  lang: { label: 'lire en français' },
  menu: { label: 'menu' },
  hero: { lines: ['try it on', "before it’s yours."], sub: 'your digital twin. your style. your AI stylist.' },
  how: {
    // Per source, in the phone's order (shop, wardrobe, feed): its heading and its four steps, as the content brief words
    // them (founder, 2026-11-01).
    heads: ['try on from your favorite stores.', 'style your own wardrobe.', 'discover looks that match your style.'],
    next: 'next source',
    pause: 'pause the demos',
    steps: [
      ['choose an item', 'try it on', 'check your size', 'ask your stylist'],
      ['pick an item', 'try it on', 'build a look', 'get styling tips'],
      ['find a look', 'try it on', 'explore items', 'get inspired'],
    ],
    stepsLabel: 'how it works',
    // Each shop's own words on its phone product page, read from its French site in this language (2026-11-01).
    shops: {
      uniqlo: { name: 'Soufflé Yarn Crew Neck Jumper', colour: 'Colour: 12 PINK', size: 'Size: Men M', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] },
      arcteryx: { promo: ['Cold-weather essentials', 'Free shipping'], lang: 'EN', crumbs: ["Arc'teryx", "Women's", 'Shell Jackets'], name: "BETA SL JACKET WOMEN'S", price: '€500.00', review: 'Leave a review', colour: 'Colour: Kasumi' },
      zara: { tabs: ['DESCRIPTION', 'DETAILS', 'MEASUREMENTS'], collection: 'ZARA WOMAN COLLECTION', tag: 'NEW', name: 'ZW COLLECTION MIDI WOOL BLEND COAT', price: '149.00 EUR', add: 'ADD', title: 'ZW COLLECTION MIDI WOOL BLEND COAT - Chocolate | ZARA France' },
    },
    // Safari and its share sheet as iOS 27 labels them (captured on the iPhone 18 Pro simulator, 2026-10-30).
    safari: {
      menu: ['Translate Website…', 'Share', 'Add to Bookmarks', 'Add Bookmark to…', 'Find on Page', 'Page Zoom'],
      options: 'Options', more: 'More', actions: ['Copy', 'Add to Bookmarks', 'Add to Reading List', 'View More'],
    },
    // The app's own words, lowercase as the app kit writes them.
    wardrobe: { title: 'wardrobe', search: 'search', select: 'select', tabs: ['items', 'outfits', 'tried'], tryOn: 'try the outfit' },
    feed: { title: 'feed', search: 'search a @user', tabs: ['for you', 'following'] },
    tryOn: { title: 'try-on', change: 'change items', ask: 'ask your stylist about this look' },
    // Per scene: the card beside the phone, then the question. A piece from a shop or the feed gets its size the way the app
    // shows it: the one that fits (ruler) and the one to the person's taste (heart). Clothes already owned need no size.
    sizeCard: { label: 'recommended size', fit: 'fits you', style: 'as you like it' },
    scenes: [
      { kind: 'size' as const, sizes: ['XS', 'S', 'M', 'L', 'XL'], fit: 'M', style: 'L', q: 'what goes with it?', a: 'Great pick! It goes with your black trousers and turtleneck. Here are 3 outfits.' },
      { kind: 'facts' as const, label: 'your friday', rows: [['18°', 'weather', 'clear at 8 pm'], ['8 pm', 'calendar', 'dinner']], q: 'good for friday’s dinner?', a: 'Yes, perfect for dinner. It will be 18° and dry, so no jacket needed.' },
      { kind: 'size' as const, sizes: ['XS', 'S', 'M', 'L'], fit: 'S', style: 'M', q: 'do i own something similar?', a: 'Yes, your white oxford is very close. Only the skirt would be new.' },
    ],
  },
  more: {
    title: 'more than virtual try-on.',
    wardrobe: { lines: ['your wardrobe.', 'more looks.'], text: 'add items once. mix and match them on your digital twin.' },
    feed: { title: 'looks that match your style.', text: 'discover items worn by people who share your taste.', tryOutfit: 'try the outfit', tryOn: 'try on' },
    friend: { ask: 'ask your friends', voting: 'voting…', title: 'get a second opinion.', text: 'share a look. see what your friends think.' },
  },
  stylist: {
    title: 'a stylist who knows you.',
    tabsLabel: 'what the stylist does',
    tabs: ['get an opinion', 'dress for today', 'pack for a trip', 'find an item', 'shop for an event'],
    // Before each answer the stylist ticks off what it checked (founder, 2026-10-30), in the order the spec checks them.
    checked: 'checked for you',
    opinion: {
      q: 'should i buy this coat?', item: 'wool blend coat · €89.95',
      checks: checks(['size', 'Size M, like the coat you kept'], ['wardrobe', 'You own a similar camel coat'], ['outfits', 'Goes with 2 of your outfits']),
      a: 'Good eye! Your camel coat already does the same job, so I’d skip this one.',
    },
    day: {
      q: 'what should i wear today?',
      checks: checks(['weather', '14°, rain at 6 pm'], ['calendar', 'Dinner at 8 pm'], ['wardrobe', '52 items in your wardrobe']),
      a: 'Your white oxford, black trousers, overshirt and Chelsea boots would be lovely. Rain is coming, so I’d save the suede for another day.',
      cta: 'try it on',
    },
    trip: {
      q: 'pack for lisbon, 4 days in may.',
      checks: checks(['calendar', '14 to 17 May'], ['weather', '23° on average'], ['calendar', '1 dinner planned'], ['wardrobe', '52 items in your wardrobe']),
      head: 'Lisbon · 4 days', count: '6 items · 5 outfits',
      a: 'Everything comes from your wardrobe, so there’s nothing to buy. Have a lovely trip!',
    },
    find: {
      q: 'a black knit polo under €150, for friday.',
      checks: checks(['budget', '€150 max'], ['size', 'Size M in stock'], ['style', 'You like black knits'], ['outfits', 'Goes with 3 of your outfits'], ['delivery', 'Delivery not guaranteed by Friday']),
      name: 'knit polo', price: '€149 · Les Deux', fit: 'Goes with your ecru trousers', cta: 'try it on',
    },
    buy: {
      q: 'an outfit for saturday, under €100.',
      checks: checks(['calendar', 'Birthday dinner'], ['wardrobe', 'You own black trousers and boots'], ['budget', '€100 max'], ['size', 'Size M in stock'], ['delivery', 'Delivery not guaranteed by Saturday']),
      a: 'This knit looks lovely with your black trousers and boots. If it arrives late, your white oxford works beautifully too.',
      name: 'merino turtleneck', price: '€99.95 · Benetton', cta: 'buy on Benetton',
    },
    ask: 'ask your stylist',
  },
  finale: {
    // Only pages that exist (founder, 2026-11-16). The contact address follows as its own column.
    columns: [{ label: 'legal', links: [['legal notice', '/legal'], ['privacy', '/privacy']] }],
    contact: 'contact',
    rights: 'all rights reserved.',
    footer: 'footer',
  },
  dialog: {
    close: 'close',
    notify: { title: 'be the first to know.', lede: 'one email when the app is out.', email: 'email', placeholder: 'you@example.com', submit: 'notify me', fine: 'one email to confirm. no spam. unsubscribe anytime.', privacy: 'privacy' },
    says: { ok: 'check your inbox to confirm.', email: 'this email looks invalid.', closed: 'sign-ups open soon.', failed: 'something went wrong. try again.' },
    appReady: 'get the app.',
    extension: { title: 'try on from any shop.', lede: 'DressYou on every product page in Chrome.', bag: 'Add to bag', add: 'add to Chrome', soon: 'coming soon to Chrome' },
  },
  doc: { updated: 'Last updated' },
  skip: 'skip to content',
  notFound: { title: 'This page does not exist.', text: 'The link may be old.', home: 'Go to the home page' },
  // Where the verification mail lands (src/lib/auth.ts). In the app's words where it has them
  // (ios/DressYou/Resources/Localizable.xcstrings, the key beside each line), so the site and the app say the same thing.
  verified: {
    title: 'Email verification',
    verified: 'Email verification completed. You can sign in.', // signin.verification.complete
    failed: 'This verification link could not be confirmed. Request a new email.', // signin.verification.failed
    open: 'Open DressYou',
    help: 'If the app does not open, open DressYou on your phone.',
    noscript: 'Open DressYou and sign in.',
  },
};

export type Copy = typeof en;

const fr: Copy = {
  meta: {
    title: 'DressYou : l’app mode sociale avec essayage virtuel et styliste IA',
    description: 'DressYou est l’app mode sociale. Essaie les vêtements de toute boutique sur ton jumeau, crée tes tenues, demande à ton styliste IA et partage tes looks.',
    ogAlt: 'Des personnes en tenues variées sur un mur incurvé, avec le logo DressYou.',
    locale: 'fr_FR',
    tagline: "Essaie-le avant qu’il soit à toi.",
  },
  get: { app: "télécharger l’app", extension: "installer l’extension", qr: "QR code pour télécharger l’app" },
  lang: { label: 'read in English' },
  menu: { label: 'menu' },
  hero: { lines: ['essaie-le', "avant qu’il soit à toi."], sub: 'ton jumeau numérique. ton style. ton styliste IA.' },
  how: {
    heads: ['essaie depuis tes boutiques préférées.', 'stylise ton dressing.', 'découvre des looks qui te ressemblent.'],
    next: 'source suivante',
    pause: 'mettre les démos en pause',
    steps: [
      ['choisis un article', 'essaie-le', 'vérifie ta taille', 'demande à ton styliste'],
      ['sélectionne un vêtement', 'essaie-le', 'crée un look', 'reçois des conseils de style'],
      ['trouve un look', 'essaie-le', 'explore les articles', 'inspire-toi'],
    ],
    stepsLabel: 'comment ça marche',
    // Uniqlo's French name for the jumper is unconfirmed: its site refused the visit (2026-11-01).
    shops: {
      uniqlo: { name: 'Pull Col Rond en Fil Soufflé', colour: 'Couleur : 12 ROSE', size: 'Taille : Homme M', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] },
      arcteryx: { promo: ['Essentiels pour l’hiver', 'Livraison gratuite'], lang: 'FR', crumbs: ["Arc'teryx", 'Femme', 'Vestes Shell'], name: 'VESTE BETA SL FEMME', price: '500,00 €', review: 'Rédiger un avis', colour: 'Couleur: Kasumi' },
      zara: { tabs: ['DESCRIPTION', 'DÉTAILS', 'DIMENSIONS'], collection: '', tag: 'NEW', name: 'MANTEAU MI-LONG AVEC LAINE ZW COLLECTION', price: '149,00 EUR', add: 'AJOUTER', title: 'MANTEAU MI-LONG AVEC LAINE ZW COLLECTION - Chocolat | ZARA France' },
    },
    safari: {
      menu: ['Traduire le site web…', 'Partager', 'Ajouter aux signets', 'Ajouter un signet à…', 'Rechercher dans la page', 'Zoom de la page'],
      options: 'Options', more: 'Plus', actions: ['Copier', 'Ajouter aux signets', 'Ajouter à la liste de lecture', 'Afficher plus'],
    },
    wardrobe: { title: 'dressing', search: 'rechercher', select: 'choisir', tabs: ['articles', 'tenues', 'essayés'], tryOn: 'essayer la tenue' },
    feed: { title: 'fil', search: 'rechercher un @compte', tabs: ['pour toi', 'abonnements'] },
    tryOn: { title: 'essayage', change: 'changer d’articles', ask: 'demande à ton styliste' },
    sizeCard: { label: 'taille recommandée', fit: 'ta taille', style: 'comme tu l’aimes' },
    scenes: [
      { kind: 'size', sizes: ['XS', 'S', 'M', 'L', 'XL'], fit: 'M', style: 'L', q: 'ça va avec quoi ?', a: 'Beau choix ! Ton pantalon noir et ton col roulé vont très bien avec. Voici 3 tenues.' },
      { kind: 'facts', label: 'ton vendredi', rows: [['18°', 'météo', 'dégagé à 20 h'], ['20 h', 'agenda', 'dîner']], q: 'pour le dîner de vendredi ?', a: 'Oui, parfait pour ce dîner. Il fera 18° et sec, pas besoin de veste.' },
      { kind: 'size', sizes: ['XS', 'S', 'M', 'L'], fit: 'S', style: 'M', q: 'j’ai quelque chose de proche ?', a: 'Oui, ta chemise oxford blanche est très proche. Seule la jupe serait nouvelle.' },
    ],
  },
  more: {
    title: 'plus qu’un essayage virtuel.',
    wardrobe: { lines: ['ton dressing.', 'plus de looks.'], text: 'ajoute tes vêtements une fois. associe-les sur ton jumeau numérique.' },
    feed: { title: 'des looks qui te ressemblent.', text: 'découvre des vêtements portés par des personnes qui partagent tes goûts.', tryOutfit: 'essayer la tenue', tryOn: 'essayer' },
    friend: { ask: 'demande à tes amis', voting: 'vote en cours…', title: 'demande un second avis.', text: 'partage un look. vois ce qu’en pensent tes amis.' },
  },
  stylist: {
    title: 'un styliste qui te connaît.',
    tabsLabel: 'ce que fait le styliste',
    tabs: ['demander un avis', 's’habiller aujourd’hui', 'préparer une valise', 'trouver un article', 'acheter pour un événement'],
    checked: 'vérifié pour toi',
    opinion: {
      q: 'j’achète ce manteau ?', item: 'manteau en laine mélangée · 89,95 €',
      checks: checks(['size', 'Taille M, comme le manteau gardé'], ['wardrobe', 'Tu as un manteau camel proche'], ['outfits', 'Va avec 2 de tes tenues']),
      a: 'Joli choix ! Ton manteau camel remplit déjà ce rôle, je te conseille de passer ton tour.',
    },
    day: {
      q: 'je porte quoi aujourd’hui ?',
      checks: checks(['weather', '14°, pluie à 18 h'], ['calendar', 'Dîner à 20 h'], ['wardrobe', '52 articles dans ton dressing']),
      a: 'Ta chemise oxford blanche, le pantalon noir, la surchemise et les bottines chelsea iront très bien. La pluie arrive, garde le daim pour un autre jour.',
      cta: 'l’essayer',
    },
    trip: {
      q: 'valise pour lisbonne, 4 jours en mai.',
      checks: checks(['calendar', 'Du 14 au 17 mai'], ['weather', '23° en moyenne'], ['calendar', '1 dîner prévu'], ['wardrobe', '52 articles dans ton dressing']),
      head: 'Lisbonne · 4 jours', count: '6 articles · 5 tenues',
      a: 'Tout vient de ton dressing, rien à acheter. Bon voyage !',
    },
    find: {
      q: 'un polo en maille noir, moins de 150 €, pour vendredi.',
      checks: checks(['budget', '150 € max'], ['size', 'Taille M en stock'], ['style', 'Tu aimes les mailles noires'], ['outfits', 'Va avec 3 de tes tenues'], ['delivery', 'Livraison non garantie avant vendredi']),
      name: 'polo en maille', price: '149 € · Les Deux', fit: 'Va avec ton pantalon écru', cta: 'l’essayer',
    },
    buy: {
      q: 'une tenue pour samedi, moins de 100 €.',
      checks: checks(['calendar', 'Dîner d’anniversaire'], ['wardrobe', 'Tu as un pantalon noir et des bottines'], ['budget', '100 € max'], ['size', 'Taille M en stock'], ['delivery', 'Livraison non garantie avant samedi']),
      a: 'Cette maille sera très jolie avec ton pantalon noir et tes bottines. Si elle arrive tard, ta chemise oxford blanche sera parfaite aussi.',
      name: 'col roulé en mérinos', price: '99,95 € · Benetton', cta: 'acheter sur Benetton',
    },
    ask: 'demande à ton styliste',
  },
  finale: {
    columns: [{ label: 'légal', links: [['mentions légales', '/legal'], ['confidentialité', '/privacy']] }],
    contact: 'contact',
    rights: 'tous droits réservés.',
    footer: 'pied de page',
  },
  dialog: {
    close: 'fermer',
    notify: { title: 'ne manque pas la sortie.', lede: 'un e-mail à la sortie de l’app.', email: 'e-mail', placeholder: 'toi@exemple.fr', submit: 'me prévenir', fine: 'un e-mail de confirmation. pas de spam. désinscription à tout moment.', privacy: 'confidentialité' },
    says: { ok: 'confirme depuis ta boîte mail.', email: 'adresse e-mail invalide.', closed: 'les inscriptions ouvrent bientôt.', failed: 'une erreur est survenue. réessaie.' },
    appReady: 'télécharger l’app.',
    extension: { title: 'essaie depuis toute boutique.', lede: 'DressYou sur chaque page produit dans Chrome.', bag: 'Ajouter au panier', add: 'ajouter à Chrome', soon: 'bientôt sur Chrome' },
  },
  doc: { updated: 'Mis à jour le' },
  skip: 'aller au contenu',
  notFound: { title: 'Cette page n’existe pas.', text: 'Le lien est peut-être ancien.', home: 'Aller à l’accueil' },
  verified: {
    title: 'Vérification de l’adresse e-mail',
    verified: 'Adresse e-mail vérifiée. Tu peux te connecter.',
    failed: 'Ce lien de vérification n’a pas pu être confirmé. Demande un nouvel e-mail.',
    open: 'Ouvrir DressYou',
    help: 'Si l’app ne s’ouvre pas, ouvre DressYou sur ton téléphone.',
    noscript: 'Ouvre DressYou et connecte-toi.',
  },
};

export const COPY: Record<Lang, Copy> = { en, fr };
