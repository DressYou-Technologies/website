"""Writes jobs-v5.json: every garment as a flat lay (founder, 2026-10-30). Shoes and the cap keep their product shot.

Each job edits from the garment the site shows today (images/v5/src-<id>.png, exported from the site's WebP), so the
flat lay is the same piece the twins wear.
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))  # -I drops the script's own folder
from jobs_v2 import CLEAN  # noqa: E402

FLAT = ("Show this exact garment as an e-commerce flat lay: laid flat and smooth on its back, photographed straight from "
        "above, {how}. Keep the same colour, fabric, texture, stitching, buttons and details. No volume, no ghost "
        "mannequin, no body shape inside it. Centred, soft even light, on a fully transparent background with no shadow, "
        "hanger, mannequin, person or props. " + CLEAN)
TOP = "sleeves laid straight down beside the body, collar and hem flat"
BOTTOM = "both legs laid straight side by side, waistband flat at the top, no belt"
HOW = {
    "g-white-tank": "straps flat, hem straight",
    "g-black-tee": TOP,
    "g-grey-crewneck": TOP,
    "g-taupe-sweater": TOP,
    "g-black-knit-polo": TOP + ", buttons closed",
    "g-white-oxford-shirt": TOP + ", buttoned, collar laid flat",
    "g-navy-overshirt": TOP + ", buttoned, pockets flat",
    "g-trench": TOP + ", buttoned, the belt tied loosely at the waist",
    "g-barrel-jeans": BOTTOM,
    "g-ecru-trousers": BOTTOM,
    "g-pinstripe-trousers": BOTTOM,
    "g-black-wide-trousers": BOTTOM,
    "g-dark-straight-jeans": BOTTOM,
}
jobs = [{"id": gid, "refs": [f"src-{gid}"], "prompt": FLAT.format(how=how), "size": "960x1280", "quality": "high",
         "background": "transparent"} for gid, how in HOW.items()]
pathlib.Path(__file__).with_name("jobs-v5.json").write_text(json.dumps(jobs, indent=1))
print(len(jobs), "jobs")
