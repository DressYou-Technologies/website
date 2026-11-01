import type { Lang } from './lang';

// Every string the page shows, per language. French is authored, not translated word for word (voice guide §6).
// No semicolons and no em dashes anywhere (founder, 2026-10-30). Copy never names a measurement or says how a piece fits.
// Short, polite and plain: no decorative words (founder, 2026-10-30). It shows what the stylist knows that answers the
// question asked, never how it tracks behaviour (founder, 2026-10-30). The stylist speaks politely and warmly, every line
// opening with a capital (founder, 2026-10-31).

// What the stylist checked before an answer: the kind of thing (its icon and colour), a label and the value it found.
export type CheckKind = 'weather' | 'calendar' | 'wardrobe' | 'style' | 'budget' | 'size' | 'delivery' | 'outfits';
type Check = [kind: CheckKind, label: string, value: string];
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
  menu: { label: 'Menu' },
  // A page in the works: the same words on each (founder, 2026-11-01), then the address and doc.home.
  soon: { tag: 'In the works', text: 'This page is coming soon. Write to' },
  hero: { lines: ['Try it on', "before it's yours."], sub: 'Your Digital Twin. Your style. Your AI stylist.' },
  how: {
    // Per source, in the phone's order (shop, wardrobe, feed): its heading and its four steps, as the content brief words
    // them (founder, 2026-11-01).
    heads: ['Try on from your favorite stores.', 'Style your own wardrobe.', 'Discover looks that match your style.'],
    next: 'Next source',
    steps: [
      ['Choose a piece', 'Try it on', 'Check your size', 'Ask your stylist'],
      ['Pick a piece', 'Try it on', 'Build a look', 'Get styling tips'],
      ['Find a look', 'Try it on', 'Explore pieces', 'Get inspired'],
    ],
    stepsLabel: 'How it works',
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
    tryOn: { title: 'try-on', change: 'change pieces', ask: 'ask your stylist about this look' },
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
    title: 'More than virtual try-on.',
    wardrobe: { lines: ['Your wardrobe.', 'More looks.'], text: 'Add pieces once. Mix and match them on your Digital Twin.' },
    feed: { title: 'Looks that match your style.', text: 'Discover pieces worn by people who share your taste.', tryOutfit: 'Try the outfit', tryOn: 'Try on' },
    friend: { ask: 'Ask your friends', voting: 'voting…', title: 'Get a second opinion.', text: 'Share a look. See what your friends think.' },
  },
  stylist: {
    title: 'A stylist who knows you.',
    tabsLabel: 'What the stylist does',
    tabs: ['Get an opinion', 'Dress for today', 'Pack for a trip', 'Find a piece', 'Shop for an event'],
    // Before each answer the stylist ticks off what it checked (founder, 2026-10-30), in the order the spec checks them.
    checked: 'Checked for you',
    opinion: {
      q: 'should i buy this coat?', item: 'Wool blend coat · €89.95',
      checks: checks(['size', 'Size', 'M, like the coat you kept'], ['wardrobe', 'You own', 'A similar camel coat'], ['outfits', 'Goes with', '2 of your outfits']),
      a: 'Good eye! Your camel coat already does the same job, so I’d skip this one.',
    },
    day: {
      q: 'what should i wear today?',
      checks: checks(['weather', 'Weather', '14°, rain at 6 pm'], ['calendar', 'Calendar', 'Dinner at 8 pm'], ['wardrobe', 'Wardrobe', '52 pieces']),
      a: 'Your white oxford, black trousers, overshirt and Chelsea boots would be lovely. Rain is coming, so I’d save the suede for another day.',
      cta: 'Try it on',
    },
    trip: {
      q: 'pack for lisbon, 4 days in may.',
      checks: checks(['calendar', 'Dates', '14 to 17 May'], ['weather', 'Weather', '23° on average'], ['calendar', 'Plans', '1 dinner'], ['wardrobe', 'Wardrobe', '52 pieces']),
      head: 'Lisbon · 4 days', count: '6 pieces · 5 outfits',
      a: 'Everything comes from your wardrobe, so there’s nothing to buy. Have a lovely trip!',
    },
    find: {
      q: 'a black knit polo under €150, for friday.',
      checks: checks(['budget', 'Budget', '€150 max'], ['size', 'Size', 'M in stock'], ['style', 'Your style', 'Black knits'], ['outfits', 'Goes with', '3 of your outfits'], ['delivery', 'Delivery', 'Not guaranteed by Friday']),
      name: 'Knit polo', price: '€149 · Les Deux', fit: 'Goes with your ecru trousers', cta: 'Try it on',
    },
    buy: {
      q: 'an outfit for saturday, under €100.',
      checks: checks(['calendar', 'Event', 'Birthday dinner'], ['wardrobe', 'You own', 'Black trousers, boots'], ['budget', 'Budget', '€100 max'], ['size', 'Size', 'M in stock'], ['delivery', 'Delivery', 'Not guaranteed by Saturday']),
      a: 'This knit looks lovely with your black trousers and boots. If it arrives late, your white oxford works beautifully too.',
      name: 'Merino turtleneck', price: '€99.95 · Benetton', cta: 'Buy on Benetton',
    },
    ask: 'ask your stylist',
  },
  finale: {
    mega: ['Fashion,', 'made personal.'],
    lede: 'Discover looks, try them on and shop with confidence.',
    extension: 'Chrome extension',
    soon: 'coming soon',
    columns: [
      { label: 'Company', links: [['Journal', '/journal']] },
      { label: 'Legal', links: [['Legal notice', '/legal'], ['Privacy', '/privacy'], ['Terms', '/terms']] },
    ],
    footer: 'Footer',
  },
  dialog: {
    close: 'Close',
    notify: { title: 'Be the first to know.', lede: 'One email when the app is out.', email: 'Email', placeholder: 'you@example.com', submit: 'Notify me', fine: 'One email to confirm. No spam. Unsubscribe anytime.', privacy: 'Privacy' },
    says: { ok: 'Check your inbox to confirm.', email: 'This email looks invalid.', closed: 'Sign-ups open soon.', failed: 'Something went wrong. Try again.' },
    appReady: 'Get the app.',
    extension: { title: 'Try on from any shop.', lede: 'DressYou on every product page in Chrome.', bag: 'Add to bag', add: 'Add to Chrome', soon: 'Coming soon to Chrome' },
  },
  doc: { updated: 'Last updated', home: 'Back to DressYou' },
  notFound: { title: 'This page does not exist.', text: 'The link may be old.', home: 'Go to the home page' },
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
  menu: { label: 'Menu' },
  soon: { tag: 'En préparation', text: 'Cette page arrive bientôt. Écrivez à' },
  hero: { lines: ['Essayez-le', "avant qu'il soit à vous."], sub: 'Votre jumeau numérique. Votre style. Votre styliste IA.' },
  how: {
    heads: ['Essayez depuis vos boutiques préférées.', 'Stylisez votre garde-robe.', 'Découvrez des looks qui vous ressemblent.'],
    next: 'Source suivante',
    steps: [
      ['Choisissez une pièce', 'Essayez-la', 'Vérifiez votre taille', 'Demandez à votre styliste'],
      ['Sélectionnez une pièce', 'Essayez-la', 'Créez un look', 'Recevez des conseils de style'],
      ['Trouvez un look', 'Essayez-le', 'Explorez les pièces', 'Inspirez-vous'],
    ],
    stepsLabel: 'Comment ça marche',
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
    wardrobe: { title: 'garde-robe', search: 'rechercher', select: 'choisir', tabs: ['pièces', 'tenues', 'essayés'], tryOn: 'essayer la tenue' },
    feed: { title: 'fil', search: 'rechercher un @compte', tabs: ['pour vous', 'abonnements'] },
    tryOn: { title: 'essayage', change: 'changer de pièces', ask: 'demandez à votre styliste' },
    sizeCard: { label: 'taille recommandée', fit: 'votre taille', style: 'comme vous l’aimez' },
    scenes: [
      { kind: 'size', sizes: ['XS', 'S', 'M', 'L', 'XL'], fit: 'M', style: 'L', q: 'ça va avec quoi ?', a: 'Beau choix ! Votre pantalon noir et votre col roulé vont très bien avec. Voici 3 tenues.' },
      { kind: 'facts', label: 'votre vendredi', rows: [['18°', 'météo', 'dégagé à 20 h'], ['20 h', 'agenda', 'dîner']], q: 'pour le dîner de vendredi ?', a: 'Oui, parfait pour ce dîner. Il fera 18° et sec, pas besoin de veste.' },
      { kind: 'size', sizes: ['XS', 'S', 'M', 'L'], fit: 'S', style: 'M', q: 'j’ai quelque chose de proche ?', a: 'Oui, votre chemise oxford blanche est très proche. Seule la jupe serait nouvelle.' },
    ],
  },
  more: {
    title: 'Plus qu’un essayage virtuel.',
    wardrobe: { lines: ['Votre garde-robe.', 'Plus de looks.'], text: 'Ajoutez vos pièces une fois. Associez-les sur votre jumeau numérique.' },
    feed: { title: 'Des looks qui vous ressemblent.', text: 'Découvrez des pièces portées par des personnes qui partagent vos goûts.', tryOutfit: 'Essayer la tenue', tryOn: 'Essayer' },
    friend: { ask: 'Demander à vos amis', voting: 'vote en cours…', title: 'Demandez un second avis.', text: 'Partagez un look. Voyez ce qu’en pensent vos amis.' },
  },
  stylist: {
    title: 'Un styliste qui vous connaît.',
    tabsLabel: 'Ce que fait le styliste',
    tabs: ['Demander un avis', 'S’habiller aujourd’hui', 'Préparer une valise', 'Trouver une pièce', 'Acheter pour un événement'],
    checked: 'Vérifié pour vous',
    opinion: {
      q: 'j’achète ce manteau ?', item: 'Manteau en laine mélangée · 89,95 €',
      checks: checks(['size', 'Taille', 'M, comme le manteau gardé'], ['wardrobe', 'Vous avez', 'Un manteau camel proche'], ['outfits', 'Va avec', '2 de vos tenues']),
      a: 'Joli choix ! Votre manteau camel remplit déjà ce rôle, je vous conseille de passer votre tour.',
    },
    day: {
      q: 'je porte quoi aujourd’hui ?',
      checks: checks(['weather', 'Météo', '14°, pluie à 18 h'], ['calendar', 'Agenda', 'Dîner à 20 h'], ['wardrobe', 'Garde-robe', '52 pièces']),
      a: 'Votre chemise oxford blanche, le pantalon noir, la surchemise et les bottines chelsea iront très bien. La pluie arrive, gardez le daim pour un autre jour.',
      cta: 'L’essayer',
    },
    trip: {
      q: 'valise pour lisbonne, 4 jours en mai.',
      checks: checks(['calendar', 'Dates', 'Du 14 au 17 mai'], ['weather', 'Météo', '23° en moyenne'], ['calendar', 'Au programme', '1 dîner'], ['wardrobe', 'Garde-robe', '52 pièces']),
      head: 'Lisbonne · 4 jours', count: '6 pièces · 5 tenues',
      a: 'Tout vient de votre garde-robe, rien à acheter. Bon voyage !',
    },
    find: {
      q: 'un polo en maille noir, moins de 150 €, pour vendredi.',
      checks: checks(['budget', 'Budget', '150 € max'], ['size', 'Taille', 'M en stock'], ['style', 'Votre style', 'Mailles noires'], ['outfits', 'Va avec', '3 de vos tenues'], ['delivery', 'Livraison', 'Non garantie avant vendredi']),
      name: 'Polo en maille', price: '149 € · Les Deux', fit: 'Va avec votre pantalon écru', cta: 'L’essayer',
    },
    buy: {
      q: 'une tenue pour samedi, moins de 100 €.',
      checks: checks(['calendar', 'Événement', 'Dîner d’anniversaire'], ['wardrobe', 'Vous avez', 'Pantalon noir, bottines'], ['budget', 'Budget', '100 € max'], ['size', 'Taille', 'M en stock'], ['delivery', 'Livraison', 'Non garantie avant samedi']),
      a: 'Cette maille sera très jolie avec votre pantalon noir et vos bottines. Si elle arrive tard, votre chemise oxford blanche sera parfaite aussi.',
      name: 'Col roulé en mérinos', price: '99,95 € · Benetton', cta: 'Acheter sur Benetton',
    },
    ask: 'demandez à votre styliste',
  },
  finale: {
    mega: ['La mode,', 'à votre image.'],
    lede: 'Découvrez des looks, essayez-les et achetez en toute confiance.',
    extension: 'Extension Chrome',
    soon: 'bientôt',
    columns: [
      { label: 'Entreprise', links: [['Journal', '/journal']] },
      { label: 'Légal', links: [['Mentions légales', '/legal'], ['Confidentialité', '/privacy'], ['Conditions', '/terms']] },
    ],
    footer: 'Pied de page',
  },
  dialog: {
    close: 'Fermer',
    notify: { title: 'Ne manquez pas la sortie.', lede: 'Un e-mail à la sortie de l’app.', email: 'E-mail', placeholder: 'vous@exemple.fr', submit: 'Me prévenir', fine: 'Un e-mail de confirmation. Pas de spam. Désinscription à tout moment.', privacy: 'Confidentialité' },
    says: { ok: 'Confirmez depuis votre boîte mail.', email: 'Adresse e-mail invalide.', closed: 'Les inscriptions ouvrent bientôt.', failed: 'Une erreur est survenue. Réessayez.' },
    appReady: 'Télécharger l’app.',
    extension: { title: 'Essayez depuis toute boutique.', lede: 'DressYou sur chaque page produit dans Chrome.', bag: 'Ajouter au panier', add: 'Ajouter à Chrome', soon: 'Bientôt sur Chrome' },
  },
  doc: { updated: 'Mis à jour le', home: 'Retour à DressYou' },
  notFound: { title: 'Cette page n’existe pas.', text: 'Le lien est peut-être ancien.', home: 'Aller à l’accueil' },
};

export const COPY: Record<Lang, Copy> = { en, fr };
