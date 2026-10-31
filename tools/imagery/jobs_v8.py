"""Writes jobs-v8.json (founder, 2026-10-30): the "More than a try-on" outfits and the friends' looks in the hero recipe,
on the phone's woman and man, so the same thin, tall models in clean, premium outfits appear everywhere."""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))  # -I drops the script's own folder
from jobs_v2 import CATALOGUE, POSES  # noqa: E402
from jobs_v6 import PHONE, SAME  # noqa: E402

def wear(pieces):
    return SAME + "Dress them in " + pieces + ". Take nothing else from the other images. " + CATALOGUE

jobs = [
    # Wardrobe outfits: one piece from each row, passed as the flat lays the wardrobe shows.
    {"id": "render-w-trench", "refs": ["render-w-coat", "g-white-tank", "g-ecru-trousers", "g-brown-loafers", "g-trench"],
     "prompt": wear("the white tank, the ecru pleated trousers and the brown suede loafers, with the beige cotton trench coat worn open over them, each exactly as in the images. Remove her brown wool coat, black turtleneck, black trousers and slingbacks completely") + POSES["contrapposto"] + " " + PHONE},
    {"id": "render-m-overshirt", "refs": ["render-m-polo", "g-grey-crewneck", "g-black-wide-trousers", "g-chelsea-boots", "g-navy-overshirt"],
     "prompt": wear("the grey crewneck, the black wide pleated trousers and the black chelsea boots, with the navy overshirt worn open over them, each exactly as in the images") + POSES["pocket"] + " " + PHONE},
    {"id": "render-m-coat", "refs": ["render-m-polo", "g-black-tee", "g-ecru-trousers", "g-white-sneakers", "g-brown-coat"],
     "prompt": wear("the black tee, the ecru pleated trousers and the white leather sneakers, with the long brown wool coat worn open over them, each exactly as in the images") + POSES["neutral"] + " " + PHONE},
    # The friends' choices: three looks each, described in words.
    {"id": "render-w-turtleneck", "refs": ["render-w-coat"], "prompt": wear("a black fine-knit turtleneck tucked into ecru wide pleated trousers, with black leather loafers") + POSES["neutral"] + " " + PHONE},
    {"id": "render-w-slipdress", "refs": ["render-w-coat"], "prompt": wear("a black satin slip dress to mid-calf, with black pointed leather slingbacks") + POSES["contrapposto"] + " " + PHONE},
    {"id": "render-w-knit", "refs": ["render-w-coat"], "prompt": wear("a soft taupe knit sweater, grey pinstripe wide trousers and white leather sneakers") + POSES["hands-front"] + " " + PHONE},
    {"id": "render-m-oxford", "refs": ["render-m-polo"], "prompt": wear("a crisp white oxford shirt tucked into black wide pleated trousers, with black leather loafers") + POSES["neutral"] + " " + PHONE},
    {"id": "render-m-crewneck", "refs": ["render-m-polo"], "prompt": wear("a mid-grey crewneck sweater, dark indigo straight jeans and white leather sneakers") + POSES["pocket"] + " " + PHONE},
]
for job in jobs:
    job.update({"size": "1152x1536", "quality": "medium"})
pathlib.Path(__file__).with_name("jobs-v8.json").write_text(json.dumps(jobs, indent=1))
print(len(jobs), "jobs")
