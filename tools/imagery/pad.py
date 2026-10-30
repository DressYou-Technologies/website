"""Gives the site's studio images room: garments become transparent cutouts, people get the backdrop extended around them.

python3 -I pad.py <srcDir> <outDir> <id> [id ...]   (ids starting with "g-" are garments)
A person's photo is shrunk onto a larger 3:4 canvas, the model paints only the new margins (mask),
then the original pixels are pasted back with a feathered edge, so the person stays exactly as generated.
"""
import base64, io, json, pathlib, subprocess, sys, uuid
import concurrent.futures

sys.path.insert(0, str(pathlib.Path(__file__).parent))  # -I drops the script's own folder
from generate import MODEL, api_key, post  # noqa: E402

CANVAS = (1152, 1536)          # 3:4, covers the 1:2 wall and phone slots and the 3:4 look tiles
PERSON_HEIGHT = 2 / 3          # share of the canvas height the original photo takes
PERSON_TOP = 144               # px above the photo; the rest of the margin goes under the feet
FEATHER = 24                   # px the model may repaint inside the photo's border, and the paste-back blend
PARALLEL = 4
CUTOUT = ("Cut out the garment exactly as it is: same shape, colour, fabric, folds, details and light. Remove the "
          "background completely so only the garment remains, on a fully transparent background. Add no shadow, "
          "mannequin, hanger, person or anything else.")
EXTEND = ("Extend this studio photograph outward: fill the empty margins with the same seamless warm light-grey studio "
          "backdrop and floor, matching its colour, light falloff, grain and the soft floor shadow, so it reads as one "
          "photo taken from further back. Keep the person, clothes, face, hair, pose and everything already in the photo "
          "unchanged. Add nothing else: no objects, props, text, edges or frames.")
NODE_HELPER = pathlib.Path(__file__).with_name("pad_canvas.mjs")


def multipart(fields, files):
    b = uuid.uuid4().hex
    parts = [f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode() for k, v in fields.items()]
    for name, (filename, mime, data) in files:
        parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{name}"; filename="{filename}"\r\nContent-Type: {mime}\r\n\r\n'.encode() + data + b"\r\n")
    parts.append(f"--{b}--\r\n".encode())
    return b"".join(parts), f"multipart/form-data; boundary={b}"


def garment(src, out, gid, key):
    data = (src / f"{gid}.jpg").read_bytes()
    body, ctype = multipart({"model": MODEL, "prompt": CUTOUT, "size": "960x1280", "quality": "high", "n": 1,
                             "background": "transparent", "output_format": "png"},
                            [("image[]", (f"{gid}.jpg", "image/jpeg", data))])
    res = post("edits", body, ctype, key)
    (out / f"{gid}.png").write_bytes(base64.b64decode(res["data"][0]["b64_json"]))
    return res.get("usage")


def person(src, out, pid, key):
    work = out / "work"; work.mkdir(exist_ok=True)
    geometry = json.dumps({"canvas": CANVAS, "height": PERSON_HEIGHT, "top": PERSON_TOP, "feather": FEATHER})
    subprocess.run(["node", str(NODE_HELPER), "prepare", str(src / f"{pid}.jpg"), str(work / pid), geometry], check=True)
    body, ctype = multipart({"model": MODEL, "prompt": EXTEND, "size": f"{CANVAS[0]}x{CANVAS[1]}", "quality": "high", "n": 1,
                             "output_format": "png"},
                            [("image[]", (f"{pid}.png", "image/png", (work / f"{pid}-canvas.png").read_bytes())),
                             ("mask", (f"{pid}-mask.png", "image/png", (work / f"{pid}-mask.png").read_bytes()))])
    res = post("edits", body, ctype, key)
    (work / f"{pid}-model.png").write_bytes(base64.b64decode(res["data"][0]["b64_json"]))
    subprocess.run(["node", str(NODE_HELPER), "finish", str(src / f"{pid}.jpg"), str(work / pid), geometry, str(out / f"{pid}.jpg")], check=True)
    return res.get("usage")


def main():
    src, out, ids = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), sys.argv[3:]
    out.mkdir(parents=True, exist_ok=True)
    log = out / "manifest.json"
    manifest = json.loads(log.read_text()) if log.exists() else {}
    key = api_key()
    with concurrent.futures.ThreadPoolExecutor(PARALLEL) as pool:
        futs = {i: pool.submit(garment if i.startswith("g-") else person, src, out, i, key) for i in ids}
        for i, f in futs.items():
            try:
                manifest[i] = {"model": MODEL, "kind": "cutout" if i.startswith("g-") else "extend", "usage": f.result()}
                print("ok", i, json.dumps(manifest[i]["usage"]))
            except Exception as e:  # report and keep the rest of the batch
                body = e.read().decode()[:400] if hasattr(e, "read") else ""
                print("FAIL", i, e, body)
            log.write_text(json.dumps(manifest, indent=1))


if __name__ == "__main__":
    main()
