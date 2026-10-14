"""Stamp a fresh version on all asset URLs in index.html so browsers never show stale files. Run before every publish."""
import os, re, time
p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "index.html")
v = str(int(time.time()))
h = open(p).read()
h = re.sub(r'\?v=\w+"', f'?v={v}"', h)
h = re.sub(r'window\.ASSET_V = "\w+"', f'window.ASSET_V = "{v}"', h)
open(p, "w").write(h)
print("stamped", v)
