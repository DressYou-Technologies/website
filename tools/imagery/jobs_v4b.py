"""Writes jobs-v4b.json: one more try-on of the male twin, so the wardrobe's third outfit is a man's and the try-ons balance."""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))  # -I drops the script's own folder
from jobs_v2 import CATALOGUE, CUTOUT, POSES, TRY_ON  # noqa: E402

jobs = [{"id": "twin-m-tee-cap", "refs": ["twin-m", "src-g-black-tee", "src-g-black-wide-trousers", "src-g-chelsea-boots", "src-g-black-cap"],
         "prompt": TRY_ON + "The tee is tucked in; the cap faces forward. " + CATALOGUE + POSES["contrapposto"] + " " + CUTOUT,
         "size": "864x1728", "quality": "high", "background": "transparent"}]
pathlib.Path(__file__).with_name("jobs-v4b.json").write_text(json.dumps(jobs, indent=1))
print(len(jobs), "jobs")
