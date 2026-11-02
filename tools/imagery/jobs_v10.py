"""Writes jobs-v10.json (founder, 2026-11-01): the try-ons that show wardrobe pieces, remade with the real shops' pieces
that replaced the generated flat lays. Each keeps its person from the image it replaces (the "id-" copies of the
previous masters), so the twins stay the same people; the street post keeps its photo and changes only the clothes.
The garment refs are the shops' packshots cut out (src/assets/manifest.json names each one's source)."""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))  # -I drops the script's own folder
from jobs_v2 import CATALOGUE, POSES  # noqa: E402
from jobs_v6 import PHONE, SAME  # noqa: E402

STREET = ("Keep the photo from the first image exactly: the same woman, face, hair, hoops, street, pose, coffee, light, "
          "framing and phone-camera texture. Change only her clothes: ")

def wear(pieces):
    return SAME + "Dress them in " + pieces + ". Take nothing else from the other images. " + CATALOGUE

jobs = [
    {"id": "render-w-coat", "refs": ["id-render-w-coat", "g-zara-coat"],
     "prompt": SAME + "Replace her coat with the coat from the second image, worn open, exactly as it is: its colour, fabric, "
               "collar, buttons and length. Keep her black fine-knit turtleneck, slim black tailored trousers and black pointed "
               "leather slingbacks. Take nothing else from the second image. " + CATALOGUE + POSES["contrapposto"] + " " + PHONE},
    {"id": "render-w-trench", "refs": ["id-render-w-coat", "g-white-tank", "g-ecru-trousers", "g-brown-loafers", "g-trench"],
     "prompt": wear("the white ribbed tank, the ecru wide pleated trousers and the dark brown suede loafers, with the beige trench "
                    "coat worn open over them, each exactly as in the images. Remove her brown wool coat, black turtleneck, black "
                    "trousers and slingbacks completely") + POSES["contrapposto"] + " " + PHONE},
    {"id": "render-m-overshirt", "refs": ["id-render-m-polo", "g-grey-crewneck", "g-black-wide-trousers", "g-chelsea-boots", "g-navy-overshirt"],
     "prompt": wear("the grey crewneck, the black wide pleated trousers and the black leather chelsea boots, with the navy overshirt "
                    "worn open over them, each exactly as in the images") + POSES["pocket"] + " " + PHONE},
    {"id": "render-m-polo", "refs": ["id-render-m-polo", "g-black-knit-polo", "g-ecru-trousers", "g-brown-loafers"],
     "prompt": wear("the black knit polo tucked into the ecru wide pleated trousers, with the dark brown suede loafers, each exactly "
                    "as in the images") + POSES["neutral"] + " " + PHONE},
    # The wardrobe lists the knit polo in this outfit (site.ts OUTFITS), so the try-on wears it too.
    {"id": "render-m-coat", "refs": ["id-render-m-polo", "g-black-knit-polo", "g-ecru-trousers", "g-white-sneakers", "g-brown-coat"],
     "prompt": wear("the black knit polo, the ecru wide pleated trousers and the white leather sneakers, with the long brown wool "
                    "coat worn open over them, each exactly as in the images") + POSES["neutral"] + " " + PHONE},
    {"id": "feed-w-trench", "refs": ["id-feed-w-trench", "g-black-cap", "g-trench", "g-white-tank", "g-barrel-jeans", "g-brown-boots"],
     "size": "1024x1280", "quality": "high",
     "prompt": STREET + "she wears exactly the garments in the other images, keeping each one's colour, fabric, cut and details: "
                        "the cap facing forward, the trench coat open over the tank top, the jeans and the knee-high boots. The "
                        "whole outfit stays visible from head to boots."},
]
for job in jobs:
    job.setdefault("size", "1152x1536")
    job.setdefault("quality", "medium")
pathlib.Path(__file__).with_name("jobs-v10.json").write_text(json.dumps(jobs, indent=1))
print(len(jobs), "jobs")
