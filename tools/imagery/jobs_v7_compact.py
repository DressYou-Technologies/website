"""Writes jobs-v7-compact.json: the hero recipe cut to its essentials (about 140 words instead of 225), run on two hero
people so the short form can be compared with the approved images (founder, 2026-10-30: same quality, less context)."""
import json
import pathlib

COMPACT = ("Full-length studio photo of an original, fictional adult (not resembling anyone real): {person}, tall and slim "
           "with a fashion-model build, wearing {outfit}. Calm catalogue pose: {pose}, shoulders level and relaxed, arms "
           "loose with a small gap from the body, soft hands, calm face with lips closed, camera straight on at waist height. "
           "Seamless {backdrop} backdrop with a soft gradient and a gentle floor shadow, soft diffused light. Natural "
           "unretouched skin, true colours, phone-camera sharpness with a little noise, not HDR. The person takes about "
           "three quarters of the frame's height, with space above the head and below the feet. No text or logos.")
POSES = {
    "neutral": "front-on, weight even on both feet, arms at the sides",
    "contrapposto": "front-on, weight on one leg and the other knee softly bent",
    "pocket": "one hand loosely in a pocket, the other arm relaxed, looking just past the camera",
    "hands-front": "a very slight angle, hands loosely together in front of the hips, feet close together",
}
jobs = [
    {"id": "compact-w-silver", "size": "864x1728", "quality": "medium",
     "prompt": COMPACT.format(person="a woman in her early twenties, white, sleek platinum bob",
                              outfit="a charcoal wool coat over a black turtleneck, black straight trousers, black loafers",
                              pose=POSES["pocket"], backdrop="cool pale concrete (#d8d9d9)")},
    {"id": "compact-m-suit", "size": "864x1728", "quality": "medium",
     "prompt": COMPACT.format(person="a man in his mid-twenties, East African with dark skin, close-cropped hair",
                              outfit="a relaxed charcoal double-breasted suit over a white t-shirt, black leather loafers",
                              pose=POSES["neutral"], backdrop="warm stone (#dcd8d0)")},
]
pathlib.Path(__file__).with_name("jobs-v7-compact.json").write_text(json.dumps(jobs, indent=1))
print(len(jobs), "jobs", len(jobs[0]["prompt"].split()), "words")
