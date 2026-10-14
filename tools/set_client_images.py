"""Replace a client's images with the given files (in order) and update projects.js.

Usage: python3 tools/set_client_images.py <slug> <image> [<image> ...]
"""
import json, os, re, shutil, sys
from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug, files = sys.argv[1], sys.argv[2:]

js_path = os.path.join(ROOT, "projects.js")
js = open(js_path, encoding="utf-8").read()
clients = json.loads(js[js.index("["):js.rindex("]") + 1])
client = next(c for c in clients if c["slug"] == slug)

out_dir = os.path.join(ROOT, "images", slug)
shutil.rmtree(out_dir, ignore_errors=True)
os.makedirs(out_dir)

images = []
for n, src in enumerate(files, 1):
    im = ImageOps.exif_transpose(Image.open(src))
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, "white")
        bg.paste(im, mask=im.split()[-1])
        im = bg
    im = im.convert("RGB")
    im.thumbnail((1600, 1600), Image.LANCZOS)
    rel = f"images/{slug}/{n:02d}.jpg"
    im.save(os.path.join(ROOT, rel), "JPEG", quality=82, optimize=True, progressive=True)
    images.append({"src": rel, "w": im.width, "h": im.height})

client["images"] = images
header = js[:js.index("const CLIENTS")]
with open(js_path, "w", encoding="utf-8") as f:
    f.write(header + "const CLIENTS = " + json.dumps(clients, ensure_ascii=False, indent=1) + ";\n")
print(f"{client['name']}: {len(images)} images")
