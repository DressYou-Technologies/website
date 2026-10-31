"""Writes jobs-v6.json (founder, 2026-10-30): the phone's try-ons in the hero's recipe, which the founder calls exactly
right. Studio photos on the app's light grey, not cutouts; one woman and one man with very simple hair, tall and slim;
outfits fashion, clean, bold and elegant. Garments are flat lays. Nothing here names a measurement."""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))  # -I drops the script's own folder
from jobs_v2 import CATALOGUE, CLEAN, FEED, LOOK, ORIGINAL, POSES, STREET  # noqa: E402
from jobs_v3 import BACKDROPS, MODEL_BUILD, STUDIO  # noqa: E402
from jobs_v5 import FLAT  # noqa: E402

WOMAN = ("a woman in her early twenties, of mixed Moroccan and French heritage with light olive skin, dark hair slicked "
         "back into a neat low bun with a clean middle part, no jewellery")
MAN = "a man in his early twenties, Senegalese with deep dark skin, a neat close-cropped haircut, clean-shaven"
PHONE = STUDIO.format(bg=BACKDROPS["grey"])
SAME = ("Keep the person from the first image exactly: same face, hair, skin tone, body and proportions, same studio, light "
        "and photo texture. ")

jobs = [
    {"id": "g-brown-coat", "size": "960x1280", "quality": "high", "background": "transparent",
     "prompt": "A long chocolate-brown double-faced wool coat, single-breasted with notch lapels and no belt. "
               + FLAT.format(how="sleeves laid straight down beside the body, buttoned, lapels flat")},
    {"id": "render-w-coat", "refs": ["g-brown-coat"], "size": "1152x1536", "quality": "medium",
     "prompt": f"Photo of {ORIGINAL}: {WOMAN}, {MODEL_BUILD}. She wears the coat from the image, open, exactly as it is, "
               "over a black fine-knit turtleneck, slim black tailored trousers and black pointed leather slingbacks. "
               + CATALOGUE + POSES["contrapposto"] + " " + PHONE},
    {"id": "render-m-polo", "refs": ["g-black-knit-polo", "g-ecru-trousers", "g-brown-loafers"], "size": "1152x1536", "quality": "medium",
     "prompt": f"Photo of {ORIGINAL}: {MAN}, {MODEL_BUILD}. He wears the black knit polo tucked into the ecru pleated "
               "trousers, with the brown suede loafers, each exactly as in the images. " + CATALOGUE + POSES["neutral"] + " " + PHONE},
    {"id": "feed-w-shirt", "size": "1024x1280", "quality": "medium",
     "prompt": f"{FEED} A photo of {ORIGINAL}: a woman in her mid-twenties, Vietnamese, straight black hair to the shoulders, "
               f"{MODEL_BUILD}. She walks past a pale stone building in Paris, looking away. Outfit: an ivory oversized poplin "
               "shirt with the sleeves pushed up, a long black satin slip skirt, black leather ballet flats, a small black "
               "leather shoulder bag. The whole outfit shows from head to shoes."},
    {"id": "render-w-shirt", "refs": ["render-w-coat", "feed-w-shirt"], "size": "1152x1536", "quality": "medium",
     "prompt": SAME + "Dress her in the outfit the woman in the second image wears: the ivory oversized poplin shirt, the "
               "long black satin slip skirt, the black leather ballet flats and the small black shoulder bag, each exactly as "
               "it is. Take nothing else from the second image. " + CATALOGUE + POSES["hands-front"] + " " + PHONE},
]
pathlib.Path(__file__).with_name("jobs-v6.json").write_text(json.dumps(jobs, indent=1))
print(len(jobs), "jobs")
