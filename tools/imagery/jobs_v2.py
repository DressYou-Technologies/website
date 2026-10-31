"""Writes jobs-v2.json: the natural direction (founder, 2026-10-30). Street photos that feel like a friend's iPhone
shot; the twin and its try-ons are clean cutouts in calm catalogue poses, as the app shows them; garments are
transparent cutouts of the same pieces. Nothing here names a measurement."""
import ast
import json
import pathlib

HERE = pathlib.Path(__file__).parent
ORIGINAL = "an original, fictional adult (not resembling any real person or celebrity)"
CLEAN = "No text, no logos, no brand labels, no watermark."
LOOK = ("True-to-life colours, unretouched natural skin with real texture and no airbrushing, normal phone-camera "
        "sharpness with a little noise, not HDR, not hyper-detailed.")
STREET = ("Casual full-length street-style outfit photo taken on an iPhone by a friend, the kind people save on "
          "Pinterest. Natural daylight, slightly warm and a little soft. " + LOOK + " Not a studio shot. A relaxed, "
          "effortless pose, as if caught between shots. The whole outfit shows from head to shoes, with some ground "
          "below the feet and a little space above the head. " + CLEAN)
FEED = ("Casual photo posted on Instagram, taken on an iPhone. Natural light. " + LOOK + " Real and unposed. " + CLEAN)
CUTOUT = ("Soft natural daylight, like a photo a friend takes near a window. " + LOOK + " Whole body visible from head "
          "to toe. Cut out on a fully transparent background, with no floor, shadow or backdrop. " + CLEAN)
# Catalogue posing (research 2026-10-30): even weight or a soft contrapposto, arms loose with a small gap from the
# torso, soft hands clear of the garment, level relaxed shoulders, level head, calm face, straight-on camera.
CATALOGUE = ("Posed like a calm e-commerce catalogue model, relaxed and natural, never dramatic: shoulders relaxed and "
             "level, head level, a calm neutral expression with lips gently closed, arms hanging loosely with a small gap "
             "from the body, soft loose hands with fingers gently curved, hands kept clear of the garment's details, feet "
             "about hip-width apart, the camera straight on at waist height. ")
POSES = {
    "neutral": "Standing front-on with the weight evenly on both feet, arms relaxed at the sides, looking into the camera.",
    "contrapposto": "Standing front-on with the weight settled on one leg and the other knee softly bent, arms relaxed at the "
                    "sides, looking into the camera.",
    "pocket": "Standing front-on, one hand resting loosely in a pocket and the other arm relaxed at the side, weight settled "
              "on one leg, looking softly just past the camera.",
    "hands-front": "Standing at a very slight angle, both hands loosely together in front of the hips, feet close together, "
                   "looking into the camera.",
}
TRY_ON = ("Keep the person from the first image exactly: same face, hair, skin tone, body and proportions, same soft "
          "natural light and photo texture. Dress them in the garments shown in the other images, keeping each garment's "
          "colour, fabric, cut and details exactly. ")
GARMENT_CUTOUT = ("Cut out the garment exactly as it is: same shape, colour, fabric, folds, details and light. Remove the "
                  "background completely so only the garment remains, on a fully transparent background. Add no shadow, "
                  "mannequin, hanger, person or anything else.")

TWIN = (f"Natural full-length fashion photo of {ORIGINAL}: a woman in her mid-twenties, tall and very slim with long legs "
        "and a slender, elongated fashion-model build, olive skin, long dark wavy hair, natural makeup. " + CATALOGUE
        + POSES["neutral"] + " She wears simple fitted basics: a black long-sleeve scoop-neck top, black leggings and "
        "plain black flats. " + CUTOUT)

# id: (garments, styling note, pose)
TWIN_LOOKS = {
    "twin-trench": (["g-trench", "g-white-tank", "g-barrel-jeans", "g-brown-boots"], "The trench coat is worn open over the tank top.", "pocket"),
    "twin-knitdress": (["g-black-knit-dress", "g-slingbacks"], "", "hands-front"),
    "twin-knitset": (["g-taupe-sweater", "g-grey-trousers", "g-ballet-flats"], "The sweater is worn loose over the trousers.", "contrapposto"),
    "twin-office": (["g-cream-top", "g-pinstripe-trousers", "g-ballet-flats"], "The top is tucked into the trousers.", "contrapposto"),
    "twin-cap-trench": (["g-black-cap", "g-trench", "g-white-tank", "g-barrel-jeans", "g-brown-boots"],
                        "The trench coat is worn open over the tank top; the cap faces forward.", "neutral"),
    "twin-knit-cap": (["g-taupe-sweater", "g-grey-trousers", "g-ballet-flats", "g-black-cap"], "The cap faces forward.", "hands-front"),
    "twin-tee-trench": (["g-black-tee", "g-pinstripe-trousers", "g-chelsea-boots", "g-trench"], "The trench coat is worn open.", "pocket"),
}

GARMENTS = ["g-trench", "g-barrel-jeans", "g-black-knit-dress", "g-black-tee", "g-cream-top", "g-taupe-sweater",
            "g-grey-trousers", "g-pinstripe-trousers", "g-ballet-flats", "g-slingbacks", "g-chelsea-boots", "g-white-tank",
            "g-black-cap", "g-brown-boots", "g-black-wide-trousers"]

WALL = {
    "wall-w-tank": "a woman in her early twenties, East Asian, slim, long straight black hair tucked behind one ear, small gold hoops. She stands on a city sidewalk with her weight on one leg, glancing off to the side, one hand on the strap of a brown leather shoulder bag. Outfit: a fitted white ribbed tank top, a dark brown leather belt, very wide dark indigo jeans falling over black loafers. Behind her, an old stone building and a crossing, softly out of focus, late-afternoon sun.",
    "wall-w-braids": "a woman in her mid-twenties, Black, slim, long box braids, small rimless sunglasses. Streetwear: a cropped baby-blue zip track jacket, low-rise baggy grey jeans, chunky silver sneakers, a small black shoulder bag. She leans back against a pale blue painted wall on a cobbled side street, holding an iced matcha, looking down the street. Bright overcast light.",
    "wall-w-street": "a woman in her early twenties, Southeast Asian, slim, long black hair under a black headscarf tied bandana-style, silver rings. Streetwear: a cropped grey zip hoodie, baggy olive cargo trousers, chunky white sneakers, a small black shoulder bag. She stands in front of a closed metal shop shutter, one hand in a pocket, looking away. Warm late-afternoon light.",
    "wall-w-linen": "a woman in her late twenties, South Asian, slim, long black hair in a low bun. She walks past a café terrace, looking down with a small smile, a woven tote on her shoulder. Outfit: a black ribbed tank top, wide ivory linen trousers, flat tan leather sandals. Warm summer evening light.",
    "wall-w-blonde": "a woman in her mid-twenties, Scandinavian, slim, messy blonde bun, oval tortoiseshell sunglasses. She stands at a street corner, glancing away, a brown leather bag hanging from one hand. Outfit: a fitted pale butter-yellow short-sleeve polo shirt, a brown leather belt, wide dark-rinse jeans, brown suede sneakers. Old brick buildings behind, golden late sun.",
    "wall-w-curls": "a woman in her late twenties, Latina, slim, long dark curly hair, gold hoops. She steps out of a small bakery holding a paper bag, glancing down. Outfit: a chocolate-brown fine-knit midi dress, black knee-high boots. A Paris street with a dark green shopfront and cream stone, soft morning light.",
    "wall-w-hijab": "a woman in her late twenties, Middle Eastern, slim, wearing a soft cream hijab. She stands by the stone steps of an old building holding a takeaway coffee, looking off to the side. Outfit: a long camel wool coat over a beige knit, wide black trousers, white leather sneakers. Crisp autumn light.",
    "wall-w-wrap": "a woman in her early thirties, Black, curvy build, short natural hair, gold hoops. She leans one shoulder on a café's window frame, smiling slightly off-camera. Outfit: a black wrap midi dress, nude pointed slingbacks, a small tan bag. Warm afternoon light on a quiet street.",
    "wall-w-silver": "a woman in her fifties, white, slim, sleek silver bob. She crosses a quiet stone square, mid-step, a black leather tote on her shoulder, looking ahead. Outfit: a charcoal wool coat over a black turtleneck, black straight trousers, black loafers. Soft autumn light.",
    "wall-w-red": "a woman in her mid-twenties, white, slim, long copper-red hair, light freckles. She stands against a weathered wooden wall, one hand in her pocket, looking away. Outfit: a crisp white poplin shirt tucked into navy wide trousers, a brown leather belt, black ballet flats. Soft shade with warm bounce light.",
    "wall-m-athletic": "a man in his late twenties, light-brown skin, athletic build, dark wavy hair pushed back. He crosses a sunny crosswalk holding a takeaway coffee, mid-step, looking ahead. Outfit: a fitted black crew-neck t-shirt tucked into wide black pleated trousers, a black leather belt, chunky black leather loafers.",
    "wall-m-polo": "a man in his mid-twenties, Black, slim, short twists, a thin silver chain. He leans one shoulder against a pale plastered wall, hands in his front pockets, looking down the street. Outfit: a boxy cream knit polo, wide charcoal pleated trousers, brown suede sneakers. A quiet European side street, morning light.",
    "wall-m-knit": "a man in his mid-twenties, East Asian, slim, middle-parted black hair. He stands by a metro entrance looking down at his phone, a canvas tote on one shoulder. Outfit: an oversized grey knit sweater, wide ecru trousers, white leather sneakers. Soft overcast light.",
    "wall-m-overshirt": "a man in his late twenties, South Asian, slim, short beard. He stands beside a row of parked bicycles, one hand in his pocket, glancing to the side. Outfit: a navy cotton overshirt open over a white tee, cream pleated trousers, brown suede loafers. Warm late-afternoon light.",
    "wall-m-camel": "a man in his forties, white, lean, salt-and-pepper beard. He walks down an old-town street, mid-step, looking off to the side. Outfit: a camel overcoat over a grey crewneck, dark straight jeans, brown chelsea boots. Cool morning light.",
    "wall-m-denim": "a man in his early thirties, Pacific Islander, broad heavier build, black curly hair. He leans against a café shopfront, smiling off-camera. Outfit: a washed denim jacket over a white tee, relaxed olive chinos, white sneakers. Bright soft daylight.",
    "wall-m-skate": "a man in his early twenties, Latino, slim, buzz cut, a small silver hoop earring. Streetwear: an oversized washed grey hoodie with no print, wide baggy black jeans, worn suede skate shoes, a skateboard held under one arm. He stands on a sunny concrete plaza, looking off to the side.",
    "wall-m-locs": "a man in his late twenties, Black, slim, long locs tied back. Streetwear: a black zip-up track jacket, olive nylon cargo trousers, chunky trainers, a small crossbody bag. He waits at a bus stop, looking down the road. Soft overcast light.",
    "wall-m-suit": "a man in his thirties, East African, dark skin, close-cropped hair, a neat beard. Classy: a relaxed charcoal double-breasted suit over a white t-shirt, black leather loafers. He steps out of a stone doorway, glancing to the side. Clean morning light.",
    "wall-m-leather": "a man in his mid-twenties, North African, slim, short curly hair. He stands on stone steps by a river, looking away across the water. Outfit: a black leather jacket over a white tee, straight light-blue jeans, black boots. Late golden light.",
}


def old_feeds():
    # The first batch's post descriptions, read without running the old job script.
    tree = ast.parse((HERE / "jobs.py").read_text())
    node = next(n for n in tree.body if isinstance(n, ast.Assign) and getattr(n.targets[0], "id", "") == "FEEDS")
    return ast.literal_eval(node.value)


FEEDS = {k: v for k, v in old_feeds().items() if k != "feed-w-bench"}  # mei's post is now the selfie
FEEDS["feed-w-selfie"] = (
    f"A high-angle front-camera selfie of {ORIGINAL}: a woman in her early twenties, Korean, slim, long straight black "
    "hair, light freckles, rosy blush, glossy lips. She sits at a small marble café table on a sunny terrace, phone at "
    "arm's length, looking into the lens with a calm, slightly pouty expression. Outfit: a fitted cream cable-knit "
    "cardigan buttoned up, a thin gold necklace, a brown suede baseball cap. Front-camera softness and a slight "
    "wide-angle stretch at the edges.")

jobs = [{"id": "twin", "prompt": TWIN, "size": "864x1728", "quality": "high", "background": "transparent"}]
for gid in GARMENTS:
    jobs.append({"id": gid, "refs": [f"src-{gid}"], "prompt": GARMENT_CUTOUT, "size": "960x1280", "quality": "high",
                 "background": "transparent"})
for lid, (garments, note, pose) in TWIN_LOOKS.items():
    jobs.append({"id": lid, "refs": ["twin", *(f"src-{g}" for g in garments)],
                 "prompt": TRY_ON + (note + " " if note else "") + CATALOGUE + POSES[pose] + " " + CUTOUT,
                 "size": "864x1728", "quality": "high", "background": "transparent"})
for wid, desc in WALL.items():
    jobs.append({"id": wid, "prompt": f"Photo of {ORIGINAL}: {desc} " + STREET, "size": "864x1728", "quality": "medium"})
for fid, desc in FEEDS.items():
    jobs.append({"id": fid, "prompt": FEED + " " + desc, "size": "1024x1280", "quality": "high"})
jobs.append({"id": "feed-w-trench", "refs": ["src-g-black-cap", "src-g-trench", "src-g-white-tank", "src-g-barrel-jeans", "src-g-brown-boots"],
             "prompt": f"{FEED} The person is {ORIGINAL}: a woman in her mid-twenties, slim, long dark hair, gold hoops. "
                       "She wears exactly the garments in these images, keeping each one's colour, fabric, cut and details: "
                       "the cap facing forward, the trench coat open over the tank top, the jeans and the boots. She stands "
                       "on a Paris street corner holding a takeaway coffee, looking off to the side, the whole outfit visible "
                       "from head to boots.",
             "size": "1024x1280", "quality": "high"})
jobs.append({"id": "shop-trench", "refs": ["src-g-trench"],
             "prompt": f"E-commerce product page photo of {ORIGINAL}: a slim woman in her late twenties with shoulder-length "
                       "brown hair, wearing exactly this trench coat, belted, over a white tee, straight blue jeans and white "
                       "leather sneakers. " + CATALOGUE + POSES["contrapposto"] + " Seamless warm light-grey studio backdrop, "
                       "soft even light. " + LOOK + " Whole body from head to shoes with space above and below. " + CLEAN,
             "size": "1024x1280", "quality": "high"})

(HERE / "jobs-v2.json").write_text(json.dumps(jobs, indent=1))
print(len(jobs), "jobs")
