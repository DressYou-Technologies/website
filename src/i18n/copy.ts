import type { Lang } from './lang';

// Every string the page shows, per language. French is authored, not translated word for word (voice guide §6).
// No semicolons and no em dashes anywhere (founder, 2026-10-30). Copy never names a measurement or says how a piece fits.
// The company pages are in the works: the menu and the footer both link them (founder, 2026-10-30).
const companyEn: [string, string][] = [['About', '/about'], ['Journal', '/journal'], ['Careers', '/careers'], ['Press', '/press'], ['Help', '/help']];
const companyFr: [string, string][] = [['À propos', '/about'], ['Journal', '/journal'], ['Carrières', '/careers'], ['Presse', '/press'], ['Aide', '/help']];

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
  soon: { tag: 'In the works', text: 'This page is on its way. Until then, write to us at', home: 'Back to DressYou' },
  hero: { lines: ['Try it on', "before it's yours."] },
  how: {
    lead: 'Tap try on',
    from: 'from',
    words: ['any shop.', 'your wardrobe.', 'the feed.'],
    next: 'Next source',
    steps: ['tap try on', 'see it on you', 'get your size', 'ask anything'],
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
    tryOn: { title: 'try-on', badge: 'AI render', change: 'change pieces', ask: 'ask your stylist about this look' },
    sizeLabel: 'recommended size',
    scenes: [
      { sizes: [['M', 'true fit', 'as designed'], ['L', 'oversized', 'the relaxed look you like']], q: 'can you roll up the sleeves?', a: 'done. rolled to the elbow.' },
      { sizes: [['M', 'true fit', 'your usual size'], ['L', 'relaxed', 'a looser drape']], q: 'what do you think of the match?', a: 'the white sneakers lighten the navy. it’s a yes.' },
      { sizes: [['S', 'true fit', 'closer to the body'], ['M', 'oversized', 'the cap-and-trench vibe']], q: 'how many of my pieces go with it?', a: '14 in your wardrobe. want to see them?' },
    ],
  },
  more: {
    title: 'More than a try-on.',
    wardrobe: { lines: ['Fill your wardrobe.', 'Build outfits.'], text: 'Add the clothes you own once. Then mix them into outfits and see each one on your twin.' },
    feed: { title: 'A feed of real people.', text: 'Real photos, never renders. Open any look and try the outfit on your twin.', inLook: 'in this look', pieces: 'pieces', tryOutfit: 'try the outfit', tryOn: 'Try on' },
    friend: { ask: 'Ask friends', shared: 'shared', title: 'Ask a friend.', text: "Send the looks you can't choose between. Your friends vote live." },
  },
  stylist: {
    title: 'A stylist who knows you.',
    tabsLabel: 'What the stylist does',
    tabs: ['Ask for an opinion', 'Dress for the day', 'Pack for a trip', 'Find a piece', 'Shop for you'],
    soon: 'soon',
    chips: [['weather', '14° · light rain'], ['occasion', 'dinner date'], ['your taste', 'clean, minimal'], ['wardrobe', '52 pieces']],
    opinion: { q: 'does this coat work on me?', a: 'yes. the length is right for you. go one size down for a cleaner shoulder.' },
    day: { q: 'dinner date on friday.', a: 'the white oxford, your black trousers and the brown loafers. the overshirt for later.', cta: 'try it' },
    trip: { q: 'pack for lisbon, 4 days in may.', head: 'lisbon · 4 days', count: '9 pieces · 6 outfits', a: 'everything comes from your wardrobe. nothing new to buy.' },
    find: { q: 'a black knit polo, under €150.', name: 'knit polo', price: '€120 · shop link', fit: 'works with 6 pieces you own', cta: 'try it on' },
    buy: { q: 'buy it for me.', badge: 'coming soon', text: 'approve the piece and the stylist checks out for you, in your size.', cta: 'buy · €120' },
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
    notify: { title: 'Be the first to know.', lede: "We'll email you once, when the app is out.", email: 'Email', placeholder: 'you@example.com', submit: 'Notify me', fine: 'One email to confirm your address. No spam, unsubscribe anytime.', privacy: 'Privacy' },
    says: { ok: 'Check your inbox to confirm your email.', email: "That email doesn't look right.", closed: 'Sign-ups open very soon.', failed: 'Something went wrong. Try again in a minute.' },
    appReady: 'Get the app.',
    extension: { title: 'Try on from any shop.', lede: 'The extension adds DressYou to every product page in Chrome.', bag: 'Add to bag', fit: 'true fit', usual: 'your usual size', add: 'Add to Chrome', soon: 'Coming soon to Chrome' },
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
  soon: { tag: 'En préparation', text: 'Cette page arrive bientôt. En attendant, écrivez-nous à', home: 'Retour à DressYou' },
  hero: { lines: ['Essayez-le', "avant qu'il soit à vous."] },
  how: {
    lead: 'Essayez',
    from: 'depuis',
    words: ['toute boutique.', 'votre garde-robe.', 'le fil.'],
    next: 'Source suivante',
    steps: ['touchez essayer', 'voyez-le porté', 'obtenez votre taille', 'posez vos questions'],
    stepsLabel: 'Comment ça marche',
    shopPages: [['Surchemise marine', '89 €'], ['Mocassins en daim', '140 €'], ['Manteau en laine', '290 €']],
    safari: {
      menu: ['Traduire le site web…', 'Partager', 'Ajouter aux signets', 'Ajouter un signet à…', 'Rechercher dans la page', 'Zoom de la page'],
      options: 'Options', more: 'Plus', actions: ['Copier', 'Ajouter aux signets', 'Ajouter à la liste de lecture', 'Afficher plus'],
    },
    wardrobe: { title: 'garde-robe', search: 'rechercher', select: 'choisir', tabs: ['pièces', 'tenues', 'essayés'], tryOn: 'essayer la tenue' },
    feed: { title: 'fil', search: 'rechercher un @compte', tabs: ['pour vous', 'abonnements'] },
    tryOn: { title: 'essayage', badge: 'rendu IA', change: 'changer de pièces', ask: 'demandez à votre styliste' },
    sizeLabel: 'taille recommandée',
    scenes: [
      { sizes: [['M', 'taille juste', 'comme prévu'], ['L', 'oversize', 'le look ample que vous aimez']], q: 'vous pouvez retrousser les manches ?', a: 'c’est fait. retroussées au coude.' },
      { sizes: [['M', 'taille juste', 'votre taille habituelle'], ['L', 'ample', 'un tombé plus souple']], q: 'que pensez-vous de l’association ?', a: 'les baskets blanches allègent le marine. c’est oui.' },
      { sizes: [['S', 'taille juste', 'plus près du corps'], ['M', 'oversize', 'l’esprit casquette et trench']], q: 'combien de mes pièces vont avec ?', a: '14 dans votre garde-robe. on les regarde ?' },
    ],
  },
  more: {
    title: 'Plus qu’un essayage.',
    wardrobe: { lines: ['Remplissez votre garde-robe.', 'Créez des tenues.'], text: 'Ajoutez une fois les vêtements que vous possédez. Composez ensuite vos tenues et voyez chacune sur votre jumeau.' },
    feed: { title: 'Un fil de vraies personnes.', text: 'De vraies photos, jamais de rendus. Ouvrez un look et essayez la tenue sur votre jumeau.', inLook: 'dans ce look', pieces: 'pièces', tryOutfit: 'essayer la tenue', tryOn: 'Essayer' },
    friend: { ask: 'Demander', shared: 'partagé', title: 'Demandez à vos amis.', text: 'Envoyez les looks entre lesquels vous hésitez. Vos amis votent en direct.' },
  },
  stylist: {
    title: 'Un styliste qui vous connaît.',
    tabsLabel: 'Ce que fait le styliste',
    tabs: ['Demander un avis', 'S’habiller pour la journée', 'Préparer un voyage', 'Trouver une pièce', 'Acheter pour vous'],
    soon: 'bientôt',
    chips: [['météo', '14° · pluie fine'], ['occasion', 'dîner à deux'], ['vos goûts', 'épuré, minimal'], ['garde-robe', '52 pièces']],
    opinion: { q: 'que pensez-vous de ce manteau sur moi ?', a: 'oui. la longueur est la bonne. prenez une taille en dessous pour une épaule plus nette.' },
    day: { q: 'dîner vendredi soir.', a: 'la chemise oxford blanche, votre pantalon noir et les mocassins marron. la surchemise pour plus tard.', cta: 'l’essayer' },
    trip: { q: 'valise pour lisbonne, 4 jours en mai.', head: 'lisbonne · 4 jours', count: '9 pièces · 6 tenues', a: 'tout vient de votre garde-robe. rien de neuf à acheter.' },
    find: { q: 'un polo en maille noir, moins de 150 €.', name: 'polo en maille', price: '120 € · lien boutique', fit: 'va avec 6 pièces que vous avez', cta: 'l’essayer' },
    buy: { q: 'achetez-le pour moi.', badge: 'bientôt', text: 'validez la pièce et le styliste passe commande pour vous, dans votre taille.', cta: 'acheter · 120 €' },
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
    notify: { title: 'Ne manquez pas la sortie.', lede: 'Nous vous écrirons une seule fois, à la sortie de l’app.', email: 'E-mail', placeholder: 'vous@exemple.fr', submit: 'Me prévenir', fine: 'Un e-mail pour confirmer votre adresse. Pas de spam, désinscription à tout moment.', privacy: 'Confidentialité' },
    says: { ok: 'Ouvrez votre boîte mail pour confirmer votre adresse.', email: 'Cette adresse ne semble pas valide.', closed: 'Les inscriptions ouvrent très bientôt.', failed: 'Un problème est survenu. Réessayez dans une minute.' },
    appReady: 'Télécharger l’app.',
    extension: { title: 'Essayez depuis toute boutique.', lede: 'L’extension ajoute DressYou à chaque page produit dans Chrome.', bag: 'Ajouter au panier', fit: 'taille juste', usual: 'votre taille habituelle', add: 'Ajouter à Chrome', soon: 'Bientôt sur Chrome' },
  },
  doc: { updated: 'Mis à jour le', home: 'Retour à DressYou' },
  notFound: { title: 'Cette page n’existe pas.', text: 'Le lien est peut-être ancien. Tout ce que fait DressYou est sur la page d’accueil.', home: 'Aller à l’accueil' },
};

export const COPY: Record<Lang, Copy> = { en, fr };
