"""Writes jobs-v3.json (founder, 2026-10-30): the hero is studio try-on renders of 20 young, tall, slim, model-like
people on soft studio colours; a male twin and men's garments balance the rest of the site; two men join the feed."""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))  # -I drops the script's own folder
from jobs_v2 import CATALOGUE, CLEAN, CUTOUT, FEED, LOOK, ORIGINAL, POSES, TRY_ON  # noqa: E402

HERE = pathlib.Path(__file__).parent
MODEL_BUILD = "tall and slim with a long-legged fashion-model build"
# Soft studio colours in the site's palette: warm greys and muted tints, never saturated.
BACKDROPS = {
    "grey": "warm light grey (#e9e8e5)", "oat": "soft oat beige (#e8e1d6)", "stone": "warm stone (#dcd8d0)",
    "sage": "pale muted sage (#dfe3da)", "blue": "dusty blue-grey (#dde2e6)", "blush": "powder blush (#ece0dc)",
    "sand": "light sand (#e6dccb)", "taupe": "soft taupe (#d9d2cb)", "concrete": "cool pale concrete (#d8d9d9)",
    "clay": "pale clay (#e5d6cc)",
}
STUDIO = ("Full-length studio fashion photo in the style of a clean digital try-on render. Seamless {bg} studio "
          "backdrop with a soft gradient and a gentle floor shadow, soft diffused light. " + LOOK + " The whole body "
          "shows from head to shoes, with generous space above the head and below the feet: the person takes about "
          "three quarters of the frame's height. " + CLEAN)
# id: (person, style and outfit, backdrop, pose)
HERO = {
    "wall-w-tank": ("a woman in her early twenties, East Asian, sleek black bob", "Minimal: a white boxy cotton tee, light-wash barrel jeans, black ballet flats", "grey", "contrapposto"),
    "wall-w-braids": ("a woman in her early twenties, Black, long box braids", "Streetwear: a cropped baby-blue zip track jacket, low-rise baggy grey jeans, chunky silver sneakers", "blue", "pocket"),
    "wall-w-street": ("a woman in her early twenties, Southeast Asian, long black hair under a black bandana-style headscarf", "Streetwear: a cropped grey zip hoodie, baggy olive cargo trousers, chunky white sneakers", "sage", "pocket"),
    "wall-w-linen": ("a woman in her mid-twenties, South Asian, long black hair in a low bun", "Summer minimal: a black ribbed tank, wide ivory linen trousers, tan leather sandals", "sand", "neutral"),
    "wall-w-blonde": ("a woman in her early twenties, Scandinavian, messy blonde bun", "Preppy: a fitted butter-yellow polo shirt, a brown leather belt, wide dark-rinse jeans, brown suede sneakers", "oat", "contrapposto"),
    "wall-w-curls": ("a woman in her early twenties, Latina, long dark curls", "Feminine: a chocolate-brown fine-knit midi dress, black knee-high boots", "taupe", "hands-front"),
    "wall-w-hijab": ("a woman in her mid-twenties, Middle Eastern, wearing a soft cream hijab", "Modest classy: a long camel wool coat over a beige knit, wide black trousers, white leather sneakers", "blush", "neutral"),
    "wall-w-wrap": ("a woman in her early twenties, Black with dark skin, short natural hair, gold hoops", "Elegant: a black wrap midi dress, nude pointed slingbacks", "clay", "contrapposto"),
    "wall-w-silver": ("a woman in her early twenties, white, sleek platinum bob", "Classy: a charcoal wool coat over a black turtleneck, black straight trousers, black loafers", "concrete", "pocket"),
    "wall-w-red": ("a woman in her early twenties, white, long copper-red hair, light freckles", "Tailored: a crisp white poplin shirt tucked into navy wide trousers, a brown belt, black ballet flats", "stone", "hands-front"),
    "wall-m-athletic": ("a man in his early twenties, light-brown skin, dark wavy hair pushed back", "Tailored minimal: a fitted black tee tucked into wide black pleated trousers, a black belt, chunky black loafers", "grey", "pocket"),
    "wall-m-polo": ("a man in his early twenties, Black, short twists, a thin silver chain", "Smart casual: a boxy cream knit polo, wide charcoal pleated trousers, brown suede sneakers", "oat", "contrapposto"),
    "wall-m-knit": ("a man in his early twenties, East Asian, middle-parted black hair", "Minimal: an oversized grey knit sweater, wide ecru trousers, white leather sneakers", "sage", "neutral"),
    "wall-m-overshirt": ("a man in his mid-twenties, South Asian, short neat beard", "Smart casual: a navy overshirt open over a white tee, cream pleated trousers, brown suede loafers", "sand", "pocket"),
    "wall-m-camel": ("a man in his early twenties, white, tousled brown hair", "Classy: a camel overcoat over a grey crewneck, dark straight jeans, brown chelsea boots", "taupe", "neutral"),
    "wall-m-denim": ("a man in his early twenties, Pacific Islander, black curly hair tied back", "Casual: a washed denim jacket over a white tee, relaxed olive chinos, white sneakers", "blue", "contrapposto"),
    "wall-m-skate": ("a man in his early twenties, Latino, buzz cut, a small silver hoop earring", "Streetwear: an oversized washed grey hoodie with no print, wide baggy black jeans, worn suede skate shoes", "concrete", "pocket"),
    "wall-m-locs": ("a man in his early twenties, Black, long locs tied back", "Streetwear: a black zip-up track jacket, olive nylon cargo trousers, chunky trainers", "clay", "pocket"),
    "wall-m-suit": ("a man in his mid-twenties, East African with dark skin, close-cropped hair", "Classy: a relaxed charcoal double-breasted suit over a white t-shirt, black leather loafers", "stone", "neutral"),
    "wall-m-leather": ("a man in his early twenties, North African, short curly hair", "Rock: a black leather jacket over a white tee, straight light-blue jeans, black boots", "blush", "contrapposto"),
}
GARMENT = ("E-commerce product cutout of {desc}, centred, crisp fabric detail, soft even light, on a fully transparent "
           "background with no shadow, mannequin, hanger or person. " + CLEAN)
GARMENTS = {
    "g-navy-overshirt": "a single navy cotton twill overshirt with two chest pockets, on an invisible ghost mannequin",
    "g-grey-crewneck": "a mid-grey fine-knit merino crewneck sweater, on an invisible ghost mannequin",
    "g-ecru-trousers": "a pair of ecru wide-leg pleated cotton trousers, laid flat, front view",
    "g-white-sneakers": "a pair of clean white leather low-top sneakers with no logos, three-quarter view",
    "g-brown-loafers": "a pair of brown suede penny loafers, three-quarter view",
    "g-black-knit-polo": "a black fine-knit short-sleeve polo shirt, on an invisible ghost mannequin",
    "g-dark-straight-jeans": "a pair of dark indigo straight-leg jeans, laid flat, front view",
    "g-white-oxford-shirt": "a white cotton oxford button-down shirt, on an invisible ghost mannequin",
}
TWIN_M = (f"Natural full-length fashion photo of {ORIGINAL}: a man in his early twenties, {MODEL_BUILD}, warm medium "
          "skin, short dark textured hair, clean-shaven. " + CATALOGUE + POSES["neutral"] + " He wears simple fitted "
          "basics: a black crew-neck t-shirt, slim black trousers and plain black sneakers. " + CUTOUT)
# id: (garment refs, styling note, pose)
LOOKS_M = {
    "twin-m-overshirt": (["g-grey-crewneck", "g-ecru-trousers", "g-white-sneakers", "g-navy-overshirt"], "The overshirt is worn open over the crewneck.", "pocket"),
    "twin-m-polo": (["g-black-knit-polo", "g-ecru-trousers", "g-brown-loafers"], "The polo is tucked into the trousers.", "contrapposto"),
    "twin-m-crewneck": (["g-grey-crewneck", "g-dark-straight-jeans", "src-g-chelsea-boots"], "", "neutral"),
    "twin-m-tee": (["src-g-black-tee", "src-g-black-wide-trousers", "g-white-sneakers"], "The tee is tucked in.", "hands-front"),
}
FEEDS = {
    "feed-m-mirror": f"A mirror selfie of {ORIGINAL}: a man in his early twenties, Middle Eastern, {MODEL_BUILD}, dark curly hair. He stands in a bright minimalist hallway, the phone covering part of his face. Outfit: an oversized white tee, black pleated wide trousers, a thin silver chain, black loafers. Soft window light.",
    "feed-m-canal": f"A candid photo of {ORIGINAL}: a man in his early twenties, Japanese, {MODEL_BUILD}, middle-parted black hair. He leans on an old iron railing by a canal holding an iced coffee, looking away. Outfit: a light-blue oxford shirt open over a white tee, cream wide trousers, brown suede loafers. Bright overcast light, pastel townhouses behind.",
}

jobs = [{"id": "twin-m", "prompt": TWIN_M, "size": "864x1728", "quality": "high", "background": "transparent"}]
jobs += [{"id": gid, "prompt": GARMENT.format(desc=d), "size": "960x1280", "quality": "high", "background": "transparent"} for gid, d in GARMENTS.items()]
for lid, (refs, note, pose) in LOOKS_M.items():
    jobs.append({"id": lid, "refs": ["twin-m", *refs], "prompt": TRY_ON + (note + " " if note else "") + CATALOGUE + POSES[pose] + " " + CUTOUT,
                 "size": "864x1728", "quality": "high", "background": "transparent"})
for hid, (person, style, bg, pose) in HERO.items():
    jobs.append({"id": hid, "size": "864x1728", "quality": "medium",
                 "prompt": f"Photo of {ORIGINAL}: {person}, {MODEL_BUILD}. {style}. " + CATALOGUE + POSES[pose] + " " + STUDIO.format(bg=BACKDROPS[bg])})
jobs += [{"id": fid, "prompt": FEED + " " + d, "size": "1024x1280", "quality": "high"} for fid, d in FEEDS.items()]
(HERE / "jobs-v3.json").write_text(json.dumps(jobs, indent=1))
print(len(jobs), "jobs")
