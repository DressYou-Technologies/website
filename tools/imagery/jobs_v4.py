"""Writes jobs-v4.json (founder, 2026-10-30): seven more studio renders so all 27 hero tiles are different people."""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))  # -I drops the script's own folder
from jobs_v2 import CATALOGUE, ORIGINAL, POSES  # noqa: E402
from jobs_v3 import BACKDROPS, MODEL_BUILD, STUDIO  # noqa: E402

HERO = {
    "wall-w-pleats": ("a woman in her early twenties, Korean, long straight black hair with a fringe", "Preppy: a white knit polo tucked into a pleated grey mini skirt, white socks, white leather sneakers", "blue", "contrapposto"),
    "wall-w-afro": ("a woman in her early twenties, Ethiopian, a full natural afro, small gold studs", "Streetwear: an oversized brown leather bomber jacket over a white tank, baggy light-wash jeans, chunky white sneakers", "sand", "pocket"),
    "wall-w-track": ("a woman in her early twenties, Brazilian of mixed heritage, a long braided ponytail", "Sporty: a fitted cream zip track top, wide black track trousers with a white side stripe, retro grey trainers", "concrete", "neutral"),
    "wall-w-knitset": ("a woman in her mid-twenties, Filipina, shoulder-length black hair tucked behind her ears", "Quiet luxury: a matching oat-beige fine-knit cardigan and wide knit trousers, tan leather mules", "oat", "hands-front"),
    "wall-m-workwear": ("a man in his early twenties, Indian, long dark hair tied back in a low bun", "Workwear: a faded brown canvas chore jacket over a white tee, ecru carpenter trousers, brown leather work boots", "clay", "pocket"),
    "wall-m-varsity": ("a man in his early twenties, Chinese, short bleached-blond hair", "Y2K streetwear: a green and cream varsity jacket with no lettering over a grey hoodie, baggy dark jeans, chunky white sneakers", "sage", "contrapposto"),
    "wall-m-preppy": ("a man in his early twenties, Nigerian, a low fade haircut", "Preppy: a cream cable-knit sweater over a light-blue shirt collar, navy chinos, brown suede loafers", "blush", "neutral"),
}
jobs = [{"id": hid, "size": "864x1728", "quality": "medium",
         "prompt": f"Photo of {ORIGINAL}: {person}, {MODEL_BUILD}. {style}. " + CATALOGUE + POSES[pose] + " " + STUDIO.format(bg=BACKDROPS[bg])}
        for hid, (person, style, bg, pose) in HERO.items()]
pathlib.Path(__file__).with_name("jobs-v4.json").write_text(json.dumps(jobs, indent=1))
print(len(jobs), "jobs")
