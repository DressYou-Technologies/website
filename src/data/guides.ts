import type { Lang } from '../i18n/lang';

// The guides answer what people search before they dress: an occasion, packing and pairing (search plan, step 11; founder,
// 2026-11-17). Hand-written in both languages, French in tu. They keep the search copy rules: nothing about bodies, no fit
// claim, no size, titles for everyone, DressYou in the third person, no semicolons or em dashes.
type Block = string | string[]; // a paragraph, or a list
interface Section { heading: string; blocks: Block[] }
interface GuideText { title: string; link: string; description: string; updated: string; intro: string; sections: Section[] }
export interface Guide { slug: string; text: Record<Lang, GuideText> }

export const guidePath = (slug: string) => `/guides/${slug}`;

export const GUIDES: Guide[] = [
  {
    slug: 'wedding-guest-outfit',
    text: {
      en: {
        title: 'What to wear to a wedding as a guest',
        link: 'wedding guest outfits',
        description: 'How to choose a wedding guest outfit: read the invitation, dress for the place and the season, pick safe colours and plan shoes and a layer for a long day.',
        updated: '17 November 2026',
        intro: 'A wedding outfit has to work for about twelve hours, in a place you may never have seen, in front of two whole families. Start with what the invitation tells you, then build the outfit around the day rather than around a single item.',
        sections: [
          { heading: 'Read the dress code first', blocks: [
            'The invitation usually says more than it seems to. “Black tie” means a long dress or a dark suit with a bow tie. “Cocktail” means a knee-length or midi dress, or a suit without a tie. “Casual”, or no mention at all, still means a step above what you wear to a restaurant: a wedding is not the day for jeans unless the couple asks for them.',
            'When the invitation says nothing, look at the venue and the hour. A town hall at eleven and a château at seven do not call for the same outfit. If you still hesitate, ask someone close to the couple. Nobody minds the question.',
          ] },
          { heading: 'Dress for the place and the season', blocks: [[
            'A garden or a beach: block heels or flats, because thin heels sink into grass and sand. Light fabrics such as linen, cotton or crêpe.',
            'A church or a town hall: something to cover your shoulders during the ceremony. A jacket, a shawl or a light cardigan is enough.',
            'Winter: velvet, wool and heavier satin, with tights and a real coat, since the photos happen outside.',
            'Summer: fabrics that breathe and a lighter colour. A linen suit is at home at almost any summer wedding.',
          ]] },
          { heading: 'Colours that are always safe', blocks: [
            'Leave white, ivory and cream to the bride, even in a print where white dominates. Black is fine at most evening weddings today, worn with colour in the accessories. Beyond that, nearly everything works: deep green, navy, burgundy and chocolate in the cold months, pastels and bright colours in the warm ones. If the couple names a colour theme, follow it lightly. One item in the theme is enough.',
          ] },
          { heading: 'Plan for the whole day', blocks: [
            'Think about the hours after the ceremony. You will stand through the drinks, sit through dinner and dance afterwards. Choose shoes you have already worn for a full evening, or bring a second pair. Take a layer for the night, when the temperature drops, and a bag small enough to carry but big enough for a phone, a card and a charger.',
            'Wear the complete outfit once before the day, shoes and layer included. That is when you find out that the bag clashes or that the jacket hides the dress.',
          ] },
          { heading: 'Wear what you own, or try before you buy', blocks: [
            'What makes a wedding outfit is often already in your wardrobe: a suit worn with a new shirt, a dress with different shoes and jewellery. If you do buy, buy something you will wear again.',
            'This is what DressYou is built for. You try on an item from any shop on your twin before buying it, pair it with the clothes you already own, and send two looks to your friends so they vote for one.',
          ] },
        ],
      },
      fr: {
        title: 'Comment s’habiller pour un mariage',
        link: 'tenue pour un mariage',
        description: 'Bien choisir sa tenue pour un mariage : lire le faire-part, s’adapter au lieu et à la saison, choisir des couleurs sûres et prévoir chaussures et veste pour toute la journée.',
        updated: '17 novembre 2026',
        intro: 'Une tenue de mariage doit tenir une douzaine d’heures, dans un lieu que tu ne connais pas toujours, devant deux familles entières. Commence par ce que dit le faire-part, puis construis la tenue autour de la journée plutôt qu’autour d’un seul vêtement.',
        sections: [
          { heading: 'Lis d’abord le dress code', blocks: [
            'Le faire-part en dit souvent plus qu’il n’y paraît. « Black tie » veut dire robe longue ou costume sombre avec nœud papillon. « Cocktail » veut dire robe au genou ou mi-longue, ou costume sans cravate. « Décontracté », ou aucune mention, reste un cran au-dessus d’une tenue de restaurant : un mariage n’est pas le jour du jean, sauf si les mariés le demandent.',
            'Quand le faire-part ne dit rien, regarde le lieu et l’heure. Une mairie à onze heures et un château à dix-neuf heures n’appellent pas la même tenue. Si tu hésites encore, demande à un proche des mariés. Personne ne s’en formalise.',
          ] },
          { heading: 'Habille-toi pour le lieu et la saison', blocks: [[
            'Un jardin ou une plage : talons carrés ou chaussures plates, car les talons fins s’enfoncent dans l’herbe et le sable. Des matières légères comme le lin, le coton ou le crêpe.',
            'Une église ou une mairie : de quoi couvrir les épaules pendant la cérémonie. Une veste, une étole ou un gilet fin suffisent.',
            'En hiver : velours, laine et satin épais, avec des collants et un vrai manteau, puisque les photos se font dehors.',
            'En été : des matières qui respirent et une couleur plus claire. Un costume en lin a sa place à presque tous les mariages d’été.',
          ]] },
          { heading: 'Les couleurs toujours sûres', blocks: [
            'Laisse le blanc, l’ivoire et le crème à la mariée, même dans un imprimé où le blanc domine. Le noir passe aujourd’hui à la plupart des mariages du soir, avec de la couleur dans les accessoires. Pour le reste, presque tout fonctionne : vert profond, marine, bordeaux et chocolat à la saison froide, pastels et couleurs vives aux beaux jours. Si les mariés annoncent un thème de couleur, suis-le sans excès. Un seul élément dans le thème suffit.',
          ] },
          { heading: 'Pense à toute la journée', blocks: [
            'Pense aux heures qui suivent la cérémonie. Tu resteras debout pendant le vin d’honneur, à table pendant le dîner, puis sur la piste de danse. Choisis des chaussures déjà portées une soirée entière, ou prévois une seconde paire. Prends une veste pour la nuit, quand la température baisse, et un sac assez petit pour se porter mais assez grand pour un téléphone, une carte et un chargeur.',
            'Porte la tenue complète une fois avant le jour J, chaussures et veste comprises. C’est là que tu vois que le sac jure ou que la veste cache la robe.',
          ] },
          { heading: 'Porte ce que tu as, ou essaie avant d’acheter', blocks: [
            'Ce qui fait une tenue de mariage est souvent déjà dans ton dressing : un costume avec une nouvelle chemise, une robe avec d’autres chaussures et d’autres bijoux. Si tu achètes, achète quelque chose que tu reporteras.',
            'DressYou est fait pour ça. Tu essaies un article de n’importe quelle boutique sur ton jumeau avant de l’acheter, tu l’associes aux vêtements que tu as déjà, et tu envoies deux looks à tes amis pour qu’ils votent.',
          ] },
        ],
      },
    },
  },
  {
    slug: 'packing-4-day-city-trip',
    text: {
      en: {
        title: 'How to pack for a 4-day city trip',
        link: 'packing for 4 days',
        description: 'A packing list for four days in a city with one cabin bag: check the weather and your plans, pick a colour base, count outfits and choose the shoes first.',
        updated: '17 November 2026',
        intro: 'Four days in a city fit in one cabin bag if every item earns its place. The method is simple: start from what you will do there, pick clothes that all go together, and count outfits rather than items.',
        sections: [
          { heading: 'Start with the weather and your plans', blocks: [
            'Look at the forecast for each day, not the average: a city at 23° can still have a wet evening. Then write down what the days hold. Long walks, a museum, one dinner out and a travel day each ask for something different, and most of the bag follows from that list.',
          ] },
          { heading: 'Pick a colour base', blocks: [
            'Choose two neutral colours that go together, such as navy and white or black and beige, and one accent. When every top goes with every bottom, six items give you more outfits than you have days. A print is welcome if it holds one of your base colours.',
          ] },
          { heading: 'The list for four days', blocks: [
            [
              'Two bottoms: trousers or jeans, and a second in a different weight, such as a skirt, shorts or lighter trousers.',
              'Four tops: two T-shirts or light tops, one shirt and one knit.',
              'One layer: an overshirt, a blazer or a light jacket that goes over everything.',
              'Two pairs of shoes: one to walk all day and one for the evening.',
              'Underwear and socks for each day, plus one spare.',
              'One outfit that feels dressed, built from the items above.',
            ],
            'Wear the bulkiest items on the travel day: the jacket, the knit and the heavier shoes.',
          ] },
          { heading: 'Shoes decide the rest', blocks: [
            'Shoes take the most room and limit the most outfits, so choose them first. One pair must be good for fifteen thousand steps on a day of visits. The second can be lighter. If a third pair only goes with one outfit, leave it at home.',
          ] },
          { heading: 'Lay it all out before you pack', blocks: [
            'Put every outfit together on the bed, day by day, shoes included. Anything that appears in only one outfit comes out, unless it is the outfit for the dinner. Roll knits and T-shirts, fold shirts and trousers flat, and fill the shoes with socks.',
          ] },
          { heading: 'Let the stylist pack from your wardrobe', blocks: [
            'In DressYou, the stylist does this from the clothes you own. You give it the city and the dates. It checks the weather and your calendar, picks the items and shows the outfits they make. You see the whole trip before you open the bag.',
          ] },
        ],
      },
      fr: {
        title: 'Faire sa valise pour 4 jours en ville',
        link: 'valise pour 4 jours',
        description: 'La liste pour quatre jours en ville avec un seul bagage cabine : regarder la météo et le programme, choisir une base de couleurs, compter en tenues et commencer par les chaussures.',
        updated: '17 novembre 2026',
        intro: 'Quatre jours en ville tiennent dans un bagage cabine si chaque vêtement mérite sa place. La méthode est simple : partir de ce que tu vas faire sur place, choisir des vêtements qui vont tous ensemble, et compter en tenues plutôt qu’en vêtements.',
        sections: [
          { heading: 'Commence par la météo et le programme', blocks: [
            'Regarde la météo jour par jour, pas la moyenne : une ville à 23° peut avoir une soirée pluvieuse. Note ensuite ce que tu as prévu. De longues marches, un musée, un dîner et une journée de trajet ne demandent pas la même chose, et l’essentiel de la valise découle de cette liste.',
          ] },
          { heading: 'Choisis une base de couleurs', blocks: [
            'Choisis deux couleurs neutres qui vont ensemble, comme marine et blanc ou noir et beige, et une couleur d’accent. Quand chaque haut va avec chaque bas, six vêtements donnent plus de tenues que de jours. Un imprimé est bienvenu s’il reprend une des couleurs de base.',
          ] },
          { heading: 'La liste pour quatre jours', blocks: [
            [
              'Deux bas : un pantalon ou un jean, et un second d’un autre poids, comme une jupe, un short ou un pantalon plus léger.',
              'Quatre hauts : deux t-shirts ou hauts légers, une chemise et une maille.',
              'Une couche : une surchemise, un blazer ou une veste légère qui va sur tout.',
              'Deux paires de chaussures : une pour marcher toute la journée, une pour le soir.',
              'Sous-vêtements et chaussettes pour chaque jour, plus un de rechange.',
              'Une tenue plus habillée, composée avec les vêtements ci-dessus.',
            ],
            'Porte le plus encombrant le jour du trajet : la veste, la maille et les chaussures les plus lourdes.',
          ] },
          { heading: 'Les chaussures décident du reste', blocks: [
            'Les chaussures prennent le plus de place et limitent le plus de tenues, alors choisis-les en premier. Une paire doit tenir quinze mille pas un jour de visites. La seconde peut être plus légère. Si une troisième paire ne va qu’avec une seule tenue, elle reste à la maison.',
          ] },
          { heading: 'Étale tout avant de fermer la valise', blocks: [
            'Compose chaque tenue sur le lit, jour par jour, chaussures comprises. Ce qui n’apparaît que dans une seule tenue sort de la valise, sauf la tenue du dîner. Roule les mailles et les t-shirts, plie à plat les chemises et les pantalons, et glisse les chaussettes dans les chaussures.',
          ] },
          { heading: 'Laisse le styliste faire la valise depuis ton dressing', blocks: [
            'Dans DressYou, le styliste fait ça avec les vêtements que tu as. Tu lui donnes la ville et les dates. Il regarde la météo et ton agenda, choisit les vêtements et montre les tenues qu’ils composent. Tu vois tout le voyage avant d’ouvrir la valise.',
          ] },
        ],
      },
    },
  },
  {
    slug: 'wide-leg-trousers',
    text: {
      en: {
        title: 'What to wear with wide-leg trousers',
        link: 'styling wide-leg trousers',
        description: 'What goes with wide-leg trousers: closer tops, the right jacket length, shoes for each hem and four outfits to copy, from the office to the weekend.',
        updated: '17 November 2026',
        intro: 'Wide-leg trousers carry a lot of fabric, so the rest of the outfit works best when it is simpler and closer. Three choices do most of the work: the top, the jacket length and the shoes.',
        sections: [
          { heading: 'Keep the top closer', blocks: [
            'A top with less volume lets the trousers lead. A fitted T-shirt, a fine knit, a bodysuit or a tucked-in shirt all work. With a looser top, tuck the front only, or choose a cropped cut that ends at the waistband. The waistband stays visible and the outfit reads as one line.',
          ] },
          { heading: 'Choose the jacket length', blocks: [
            'Short and long both work. The in-between is harder. A cropped jacket, a short cardigan or a bomber ends at the waistband and shows the full length of the trousers. A long coat makes one long shape with them. A jacket that stops halfway down cuts the outfit in two, so wear it open.',
          ] },
          { heading: 'Match the shoes to the hem', blocks: [
            [
              'A hem that touches the floor: heels, platforms or boots with a block heel, hidden under the fabric.',
              'A hem at the ankle: loafers, ballet flats or slim trainers, with a fine sock if you like.',
              'A cropped hem: ankle boots that go under it, or sandals in summer.',
            ],
            'Chunky trainers work when the trousers are very wide and the fabric is heavy, such as denim or wool. With a light, fluid fabric, a finer shoe keeps the balance.',
          ] },
          { heading: 'Four outfits to copy', blocks: [[
            'Office: pleated wide-leg trousers, a fine turtleneck, a belt and loafers.',
            'Weekend: wide-leg jeans, a white T-shirt, a cropped jacket and trainers.',
            'Evening: fluid black trousers, a satin top and heels.',
            'Cold day: wool trousers, a short knit, a long coat and boots.',
          ]] },
          { heading: 'Check the pairing before you buy', blocks: [
            'Wide-leg trousers change with every top and every pair of shoes you put with them. In DressYou, you try the trousers from any shop on your twin with the tops and shoes you already own, and the stylist tells you what in your wardrobe goes with them. You know what you will wear them with before they arrive.',
          ] },
        ],
      },
      fr: {
        title: 'Avec quoi porter un pantalon large',
        link: 'porter un pantalon large',
        description: 'Ce qui va avec un pantalon large : des hauts moins amples, la bonne longueur de veste, les chaussures selon l’ourlet et quatre tenues à reprendre, du bureau au week-end.',
        updated: '17 novembre 2026',
        intro: 'Un pantalon large porte beaucoup de tissu. Le reste de la tenue fonctionne mieux quand il est plus simple et moins ample. Trois choix font l’essentiel : le haut, la longueur de la veste et les chaussures.',
        sections: [
          { heading: 'Garde un haut moins ample', blocks: [
            'Un haut avec moins de volume laisse le pantalon mener la tenue. Un t-shirt ajusté, une maille fine, un body ou une chemise rentrée fonctionnent tous. Avec un haut plus ample, rentre seulement le devant, ou choisis une coupe courte qui s’arrête à la ceinture. La ceinture reste visible et la tenue se lit d’un seul trait.',
          ] },
          { heading: 'Choisis la longueur de la veste', blocks: [
            'Court et long fonctionnent tous les deux. L’entre-deux est plus difficile. Une veste courte, un gilet court ou un bomber s’arrêtent à la ceinture et montrent toute la longueur du pantalon. Un manteau long forme une seule ligne avec lui. Une veste qui s’arrête à mi-hauteur coupe la tenue en deux : porte-la ouverte.',
          ] },
          { heading: 'Accorde les chaussures à l’ourlet', blocks: [
            [
              'Un ourlet qui touche le sol : talons, plateformes ou bottines à talon carré, cachés sous le tissu.',
              'Un ourlet à la cheville : mocassins, ballerines ou baskets fines, avec une chaussette fine si tu veux.',
              'Un ourlet raccourci : des bottines qui passent dessous, ou des sandales en été.',
            ],
            'Les baskets épaisses fonctionnent quand le pantalon est très large et le tissu lourd, comme le denim ou la laine. Avec un tissu léger et fluide, une chaussure plus fine garde l’équilibre.',
          ] },
          { heading: 'Quatre tenues à reprendre', blocks: [[
            'Bureau : pantalon large à pinces, col roulé fin, ceinture et mocassins.',
            'Week-end : jean large, t-shirt blanc, veste courte et baskets.',
            'Soirée : pantalon noir fluide, haut en satin et talons.',
            'Jour froid : pantalon en laine, maille courte, manteau long et bottines.',
          ]] },
          { heading: 'Vérifie l’accord avant d’acheter', blocks: [
            'Un pantalon large change avec chaque haut et chaque paire de chaussures. Dans DressYou, tu essaies le pantalon de n’importe quelle boutique sur ton jumeau, avec les hauts et les chaussures que tu as déjà, et le styliste te dit ce qui va avec dans ton dressing. Tu sais avec quoi le porter avant qu’il arrive.',
          ] },
        ],
      },
    },
  },
];
