"""Generates the website's synthetic imagery from a job list, skipping jobs already on disk.

python3 -I generate.py <jobs.json> <outDir> [id ...]
Each job: {"id", "prompt", "size", "quality", optional "refs": ids of earlier outputs to edit from,
optional "background": "transparent" for a cutout, saved as .png}.
"""
import base64
import concurrent.futures
import json
import pathlib
import sys
import urllib.request
import uuid

MODEL = "gpt-image-2.5-sunburst"
HOST = "https://api.openai.com/v1/images"
PARALLEL = 4
TIMEOUT_SECONDS = 300
KEY_FILE = pathlib.Path.home() / "Startup/DressYou/api/.env"


def api_key():
    for line in KEY_FILE.read_text().splitlines():
        if line.startswith("OPENAI_API_KEY="):
            return line.split("=", 1)[1].strip().strip("'\"")
    raise SystemExit("OPENAI_API_KEY missing from api/.env")


def post(path, body, content_type, key):
    req = urllib.request.Request(f"{HOST}/{path}", data=body, method="POST",
                                 headers={"Authorization": f"Bearer {key}", "Content-Type": content_type})
    with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as res:
        return json.load(res)


def ext(job):
    return "png" if job.get("background") == "transparent" else "jpg"


def ref_file(out, ref):
    return next(f for f in (out / f"{ref}.png", out / f"{ref}.jpg") if f.exists())


def run(job, out, key):
    fields = {"model": MODEL, "prompt": job["prompt"], "size": job["size"], "quality": job["quality"], "n": 1}
    fields.update({"background": "transparent", "output_format": "png"} if ext(job) == "png"
                  else {"output_format": "jpeg", "output_compression": 95})
    if "refs" not in job:
        data = post("generations", json.dumps(fields).encode(), "application/json", key)
    else:
        boundary = uuid.uuid4().hex
        parts = [f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
                 for k, v in fields.items()]
        for ref in job["refs"]:
            f = ref_file(out, ref)
            mime = "image/png" if f.suffix == ".png" else "image/jpeg"
            parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="{f.name}"\r\n'
                         f'Content-Type: {mime}\r\n\r\n'.encode() + f.read_bytes() + b"\r\n")
        parts.append(f"--{boundary}--\r\n".encode())
        data = post("edits", b"".join(parts), f"multipart/form-data; boundary={boundary}", key)
    (out / f"{job['id']}.{ext(job)}").write_bytes(base64.b64decode(data["data"][0]["b64_json"]))
    return {"id": job["id"], "model": MODEL, "usage": data.get("usage"), **{k: job[k] for k in ("prompt", "size", "quality")},
            **({"refs": job["refs"]} if "refs" in job else {})}


def main():
    jobs_file, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
    only = set(sys.argv[3:])
    out.mkdir(parents=True, exist_ok=True)
    manifest_file = out / "manifest.json"
    manifest = json.loads(manifest_file.read_text()) if manifest_file.exists() else {}
    todo = [j for j in json.loads(jobs_file.read_text())
            if (not only or j["id"] in only) and not (out / f"{j['id']}.{ext(j)}").exists()]
    key = api_key()
    # Edits read their reference from disk, so they wait for every plain generation first.
    for wave in ([j for j in todo if "refs" not in j], [j for j in todo if "refs" in j]):
        with concurrent.futures.ThreadPoolExecutor(PARALLEL) as pool:
            for job, fut in [(j, pool.submit(run, j, out, key)) for j in wave]:
                try:
                    manifest[job["id"]] = fut.result()
                    print("ok", job["id"], json.dumps(manifest[job["id"]]["usage"]))
                except urllib.error.HTTPError as e:
                    print("FAIL", job["id"], e.code, e.read().decode()[:400])
                manifest_file.write_text(json.dumps(manifest, indent=1))


if __name__ == "__main__":
    main()
