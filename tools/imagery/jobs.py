"""Writes jobs.json: every image the site needs, with shared style blocks so the set stays consistent."""
import json
import pathlib

STUDIO_SIZE = "864x1728"   # 1:2, the wall tile and phone screen shape
FEED_SIZE = "1024x1280"    # 4:5, the feed's photo shape
GARMENT_SIZE = "960x1280"  # 3:4, the wardrobe tile shape
QUALITY = "high"

ORIGINAL = "an original, fictional adult (not resembling any real person or celebrity)"
CLEAN = "No text, no logos, no brand labels, no watermark."
STUDIO = ("Seamless warm light-grey studio backdrop (#e9e8e5), soft even daylight-like light, gentle floor shadow. "
          "Whole body visible from head to toe with a little space above and below. 50mm lens at chest height, "
          "sharp focus, true skin texture, no retouching gloss. " + CLEAN)
FEED = ("Candid iPhone photo for an Instagram fashion post, taken by a friend. Natural light, slightly warm, a little "
        "phone-camera grain and softness, natural skin, real and unposed feeling, quiet minimal styling. " + CLEAN)
GARMENT = ("E-commerce product photograph, no person visible, centered with even margins on a plain warm light-grey "
           "background (#ecebe8), soft shadowless studio light, crisp fabric detail. " + CLEAN)
TRY_ON = ("Keep the person from the first image exactly: same face, hair, skin tone, body and proportions, same studio "
          "backdrop, framing and light. Dress them in the garments shown in the other images, keeping each garment's "
          "colour, fabric, cut and details exactly. Full-length, standing facing the camera, relaxed.")

GARMENTS = {
    "g-trench": "a single cream-beige cotton gabardine trench coat, double-breasted with a tied belt and storm flap, on an invisible ghost mannequin",
    "g-barrel-jeans": "a pair of light-wash high-rise barrel-leg jeans laid flat, front view",
    "g-black-knit-dress": "a black fine-knit short-sleeve mini dress with a row of small black buttons, on an invisible ghost mannequin",
    "g-black-tee": "a fitted black cotton crew-neck t-shirt laid flat",
    "g-cream-top": "a cream fine-knit long-sleeve crew-neck top on an invisible ghost mannequin",
    "g-taupe-sweater": "a taupe-grey wool funnel-neck sweater with soft volume sleeves, on an invisible ghost mannequin",
    "g-grey-trousers": "a pair of light-grey wool straight-leg tailored trousers with pressed creases, laid flat",
    "g-pinstripe-trousers": "a pair of black pinstripe wide-leg tailored trousers, laid flat",
    "g-ballet-flats": "a pair of black patent leather ballet flats with a small bow, three-quarter view",
    "g-slingbacks": "a pair of nude-beige pointed-toe slingback kitten heels, three-quarter view",
    "g-chelsea-boots": "a single black leather chelsea boot, side view",
    "g-white-tank": "a white ribbed cotton tank top laid flat",
    "g-black-cap": "a washed black cotton baseball cap, three-quarter view",
    "g-brown-boots": "a pair of dark brown suede slouchy knee-high boots, side view",
    "g-black-wide-trousers": "a pair of black wool wide-leg trousers with front pleats, laid flat",
}

TWIN = (f"Photorealistic full-length studio photograph of {ORIGINAL}: a woman in her mid-twenties, slim build, olive skin, "
        "long dark wavy hair, natural makeup. She stands facing the camera, relaxed, arms loose at her sides. "
        "She wears simple fitted basics: a black long-sleeve scoop-neck top, black leggings and plain black flats. " + STUDIO)

TWIN_LOOKS = {
    "twin-trench": (["g-trench", "g-white-tank", "g-barrel-jeans", "g-brown-boots"], "The trench coat is worn open over the tank top."),
    "twin-knitdress": (["g-black-knit-dress", "g-slingbacks"], ""),
    "twin-knitset": (["g-taupe-sweater", "g-grey-trousers", "g-ballet-flats"], "The sweater is worn loose over the trousers."),
    "twin-office": (["g-cream-top", "g-pinstripe-trousers", "g-ballet-flats"], "The top is tucked into the trousers."),
    "twin-cap-trench": (["g-black-cap", "g-trench", "g-white-tank", "g-barrel-jeans", "g-brown-boots"],
                        "The trench coat is worn open over the tank top; the cap faces forward."),
    "twin-knit-cap": (["g-taupe-sweater", "g-grey-trousers", "g-ballet-flats", "g-black-cap"], ""),
    "twin-tee-trench": (["g-black-tee", "g-pinstripe-trousers", "g-chelsea-boots", "g-trench"], "The trench coat is worn open."),
}

WALL = {
    "wall-w-bob": "a woman in her early twenties, East Asian, slim, sleek black bob. She wears a white boxy cotton tee, light-wash barrel jeans and black ballet flats",
    "wall-w-braids": "a woman in her mid-twenties, Black, slim, long box braids. She wears a cream fine-knit long-sleeve top, a cream knit maxi skirt and tan slingbacks",
    "wall-w-linen": "a woman in her late twenties, South Asian, slim, long black hair in a low bun. She wears a black ribbed tank, wide ivory linen trousers and flat tan leather sandals",
    "wall-w-blonde": "a woman in her mid-twenties, Scandinavian, slim, straight blonde hair. She wears a cream trench coat open over a white tee, straight blue jeans and black loafers",
    "wall-w-curls": "a woman in her late twenties, Latina, slim, long dark curly hair. She wears a chocolate-brown fine-knit midi dress and black knee boots",
    "wall-w-hijab": "a woman in her late twenties, Middle Eastern, slim, wearing a soft cream hijab. She wears a long camel wool coat over a beige knit, wide black trousers and white leather sneakers",
    "wall-w-wrap": "a woman in her early thirties, Black, curvy build, short natural hair, gold hoops. She wears a black wrap midi dress and nude pointed slingbacks",
    "wall-w-silver": "a woman in her fifties, white, slim, sleek silver bob. She wears a charcoal wool coat over a black turtleneck, black straight trousers and black loafers",
    "wall-w-red": "a woman in her mid-twenties, white, slim, long copper-red hair, freckles. She wears a crisp white poplin shirt tucked into navy pinstripe wide trousers with a brown belt, and black flats",
    "wall-m-athletic": "a man in his late twenties, light-brown skin, athletic build, dark wavy hair pushed back. One hand in his pocket, slight three-quarter angle. He wears a fitted black crew-neck t-shirt tucked into high-waisted wide-leg black pleated trousers with a black leather belt, and chunky black leather loafers",
    "wall-m-glasses": "a man in his late twenties, Black, slim, short twists, black rectangular glasses. He wears a fitted white long-sleeve tee, black wide-leg trousers and black loafers",
    "wall-m-knit": "a man in his mid-twenties, East Asian, slim, middle-parted black hair. He wears an oversized grey knit sweater, wide ecru trousers and white leather sneakers",
    "wall-m-overshirt": "a man in his late twenties, South Asian, slim, short beard. He wears a navy cotton overshirt over a white tee, cream pleated trousers and brown suede loafers",
    "wall-m-camel": "a man in his forties, white, lean, salt-and-pepper beard. He wears a camel overcoat over a grey crewneck, dark straight jeans and brown chelsea boots",
    "wall-m-denim": "a man in his early thirties, Pacific Islander, broad heavier build, black curly hair. He wears a washed denim jacket over a white tee, relaxed olive chinos and white sneakers",
    "wall-m-leather": "a man in his mid-twenties, North African, slim, short curly hair. He wears a black leather jacket over a white tee, straight light-blue jeans and black boots",
}

FEEDS = {
    "feed-w-bench": "An East Asian woman in her early twenties, slim, shoulder-length black hair, thin rectangular black glasses, small silver hoops. She sits sideways on a worn wooden café bench outside, one knee up, looking past the camera. Outfit: a fitted short-sleeve blue-and-white gingham blouse with tiny white frill trim, very wide black trousers, black Mary Jane flats, a small burgundy leather shoulder bag beside her. Setting: a quiet old-town side street with a whitewashed wall, an open wooden door and potted plants. Late-afternoon light.",
    "feed-w-bakery": "A Mediterranean woman in her mid-twenties, slim, long glossy brown hair. Caught mid-stride walking out of a small bakery holding a paper bag, black leather tote on her shoulder, glancing down. Outfit: a fitted sleeveless chocolate-brown ruched top, black wide-leg trousers, pointed black flats. Setting: a Paris street with a dark green shopfront and cream stone. Soft morning light.",
    "feed-w-canal": "A blonde woman in her early twenties, slim, long loose waves, gold hoops. She leans back against an old iron railing by a canal, holding an iced matcha, looking off to the side. Outfit: a light-blue short-sleeve cropped button shirt, low-rise baggy mid-wash jeans, black pointed flats, a small beige shoulder bag. Setting: a European canal with pastel townhouses behind. Bright overcast daylight.",
    "feed-w-mirror": "A Black woman in her mid-twenties, slim, long dark hair, thin gold-rimmed glasses. A mirror selfie in a minimalist boutique fitting area, her phone covering the lower part of her face, a cream bouclé armchair and a rail of neutral clothes behind her. Outfit: a white ribbed tank top, wide black wool trousers with a black leather belt, white socks and black loafers, a black leather shoulder bag.",
    "feed-m-coffee": "A Southeast Asian man in his late twenties, lean athletic build, short black hair. Crossing a sunny cobbled street holding a takeaway coffee, looking ahead, candid mid-step. Outfit: a fitted black t-shirt, wide pleated charcoal trousers with a black belt, black leather derby shoes, a silver ring. Setting: old cream-stone buildings, a café terrace and a parked scooter.",
    "feed-m-lounge": "A Black man in his late twenties, slim, short hair, black square glasses, a small earring. He lounges back in a rust-red bouclé armchair in a warm hotel lounge, one arm along the armrest, legs crossed, looking out of frame. Outfit: a white long-sleeve tee, black wide trousers, black loafers. A glass of sparkling water on a low table, linen curtains behind. Warm evening light.",
}


def job(id, prompt, size, refs=None):
    return {"id": id, "prompt": prompt, "size": size, "quality": QUALITY, **({"refs": refs} if refs else {})}


jobs = [job("twin", TWIN, STUDIO_SIZE)]
jobs += [job(id, f"{GARMENT} The product: {what}.", GARMENT_SIZE) for id, what in GARMENTS.items()]
jobs += [job(id, f"Photorealistic full-length studio photograph of {ORIGINAL}: {who}. {STUDIO}", STUDIO_SIZE) for id, who in WALL.items()]
jobs += [job(id, f"{FEED} The person is {ORIGINAL}. {what} Vertical 4:5.", FEED_SIZE) for id, what in FEEDS.items()]
jobs += [job(id, f"{TRY_ON} {note}".strip(), STUDIO_SIZE, ["twin", *garments]) for id, (garments, note) in TWIN_LOOKS.items()]
jobs.append(job("shop-trench", "E-commerce product page photograph: " + ORIGINAL + ", a slim woman in her late twenties with "
                "short dark hair, different from any other image, models this exact trench coat, belted, over light jeans and "
                "white sneakers. Full length, standing, plain light-grey studio. Keep the coat's colour and details exactly. "
                + CLEAN, STUDIO_SIZE, ["g-trench"]))

jobs.append(job("feed-w-trench", f"{FEED} The person is {ORIGINAL}: a woman in her mid-twenties, slim, long dark hair "
                "under the cap. She wears exactly the garments shown in the images, the trench coat open over the tank "
                "top, and leans on a stone doorway on a Paris street, glancing at her phone. Keep each garment's colour, "
                "fabric, cut and details exactly. Vertical 4:5.", FEED_SIZE,
                ["g-black-cap", "g-trench", "g-white-tank", "g-barrel-jeans", "g-brown-boots"]))

pathlib.Path(__file__).with_name("jobs.json").write_text(json.dumps(jobs, indent=1))
print(len(jobs), "jobs")
