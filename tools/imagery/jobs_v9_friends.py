"""Writes jobs-v9-friends.json (founder, 2026-10-31): original friend avatars for the "Ask a friend" card, replacing photos
found online. Described in words only, no reference images, nothing resembling an existing character or a real photo."""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))  # -I drops the script's own folder
from jobs_v2 import CLEAN, LOOK  # noqa: E402

PHOTO = ("A funny, candid square profile photo taken on an iPhone, the kind people use as a social media avatar. The animal's "
         "face is centred and fills most of the frame. " + LOOK + " Original animal, not a known character, toy or brand. " + CLEAN)
FRIENDS = {
    "friend-cat": "A grey and white tabby cat seen from slightly below, looking down at the camera, wearing a black baseball cap backwards and small black rectangular sunglasses. Warm indoor evening light.",
    "friend-plush": "A soft cream plush puppy toy with round brown floppy ears and a small stitched nose, sitting on a beach at dusk with grey-blue waves behind it, a little blurry like a quick phone shot.",
    "friend-dog": "A smiling white Shiba Inu wearing a faded denim cap, a small yellow wildflower held near its nose, in a green meadow at sunset with soft pink clouds.",
    "friend-monkey": "A young macaque wearing black sunglasses and big silver over-ear headphones, sipping an orange smoothie through a straw, seen from slightly below against a plain white ceiling.",
    "friend-pilot": "A fluffy white puppy wearing an old leather pilot helmet and a navy knitted scarf, looking out of a small aeroplane window with clouds behind, slightly motion-blurred.",
    "friend-corgi": "A Corgi sitting on a wooden kitchen floor looking straight at the camera, balancing a small flat plate with three mandarin oranges on its head, calm and proud.",
}
jobs = [{"id": fid, "prompt": f"{desc} {PHOTO}", "size": "1024x1024", "quality": "medium"} for fid, desc in FRIENDS.items()]
pathlib.Path(__file__).with_name("jobs-v9-friends.json").write_text(json.dumps(jobs, indent=1))
print(len(jobs), "jobs")
