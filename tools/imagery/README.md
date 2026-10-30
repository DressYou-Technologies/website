# Imagery

The scripts that made the site's images with `gpt-image-2.5-sunburst`. The look, its references, the posing research and every step are in the DressYou repository: `docs/specs/2026-10-30-image-look.md`.

- `generate.py`: runs a job list against the Images API, skipping images already on disk. It reads `OPENAI_API_KEY` from `~/Startup/DressYou/api/.env` and never prints it.
- `jobs_vN.py`: writes `jobs-vN.json`, one step each. v3 and v4 are the hero recipe, v5 the flat lays, v6 the phone's try-ons, v7 the compact form.
- `pad.py`, `pad_canvas.mjs`: outpainting from v2, superseded.

Run from this folder: `python3 -I jobs_v6.py && python3 -I generate.py jobs-v6.json <outDir>`. Masters are trimmed and saved into `src/assets/` as JPEG (people, posts) or alpha WebP (garments), with their entry in `src/assets/manifest.json`.
