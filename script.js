const $ = id => document.getElementById(id);
const home = $("home"), page = $("client-page"), lb = $("lightbox");
const LOGOS = new Set(["bk","wendy-s","dominos","ph","dilli","coffee-beans","bam","bimbo","brika","domty","larch","les-alpes","ness","richland","saula","dosh","lindo","skoda","ghabour-auto","kasrawy","zanussi","it-worx","raha","egy-post","nis","lycee","ssm","tmg","frappit","sweet-slim","cea"]);
const link = c => `#/client/${c.slug}`;
const hasWork = c => c.images.length > 0;
const WORK = CLIENTS.filter(hasWork);
const cover = c => (c.images[1] || c.images[0]).src;
const mark = c => LOGOS.has(c.slug)
  ? `<img class="mark" src="logos/${c.slug}.png" alt="${c.name} logo" loading="lazy">`
  : `<span class="wordmark">${c.name}</span>`;

$("year").textContent = new Date().getFullYear();
const industryCount = new Set(CLIENTS.map(c => c.industry)).size;
document.querySelector("[data-count='9']").dataset.count = industryCount;
$("client-count").textContent = CLIENTS.length + "+";
document.querySelector("[data-count='34']").dataset.count = CLIENTS.length;
const designCount = CLIENTS.reduce((n, c) => n + c.images.length, 0);
document.querySelector("[data-count='178']").dataset.count = designCount;

// ---------- Hero: floating work cards with mouse parallax ----------
const SPOTS = [[6,14,-8],[22,6,5],[70,10,7],[86,22,-6],[60,30,-3],[80,52,9],[40,8,-4],[92,62,4]];
const heroPicks = ["bk","wendy-s","skoda","bam","dominos","les-alpes","larch","ghabour-auto"]
  .map(s => CLIENTS.find(c => c.slug === s)).filter(Boolean);
const floaters = heroPicks.map((c, i) => {
  const [x, y, r] = SPOTS[i];
  const a = document.createElement("a");
  a.className = "floater";
  a.href = link(c);
  a.dataset.cursor = c.name;
  a.style.left = x + "%"; a.style.top = y + "%";
  a.innerHTML = `<div class="floater-inner" style="animation-delay:${-i * 1.3}s"><img src="${cover(c)}" alt="${c.name}"></div>`;
  a._r = r; a._d = .4 + (i % 4) * .25;
  $("floaters").appendChild(a);
  setTimeout(() => a.classList.add("on"), 500 + i * 120);
  return a;
});
let mx = 0, my = 0, px = 0, py = 0;
addEventListener("mousemove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
(function loop() {
  px += (mx - px) * .06; py += (my - py) * .06;
  const sy = scrollY;
  floaters.forEach(f => f.style.transform =
    `translate(${px * -60 * f._d}px, ${py * -60 * f._d - sy * f._d * .35}px) rotate(${f._r}deg)`);
  requestAnimationFrame(loop);
})();

// ---------- Lime band ----------
const bandHtml = CLIENTS.map(c => `<span>${c.name}</span><i>✦</i>`).join("");
$("band").innerHTML = bandHtml + bandHtml;

// ---------- Logo wall ----------
$("logo-wall").innerHTML = CLIENTS.map(c => !hasWork(c)
  ? `<div class="tile logo-only">${mark(c)}</div>`
  : `
  <a class="tile" href="${link(c)}" data-cursor="View">
    ${mark(c)}
    <div class="peek-img"><img src="${cover(c)}" alt="" loading="lazy"></div>
    <div class="tile-meta"><b>${c.name}</b><span>${c.images.length} →</span></div>
  </a>`).join("");

// ---------- Featured ----------
const FEAT = [["bk",1],["skoda",1],["les-alpes",4],["bam",3],["wendy-s",2],["larch",5],["dilli",5],["ghabour-auto",6],["ness",3],["kasrawy",4],["saula",2],["dosh",2]];
$("feature-grid").innerHTML = FEAT.map(([s, n], i) => {
  const c = CLIENTS.find(x => x.slug === s);
  if (!c) return "";
  const im = c.images[Math.min(n, c.images.length - 1)];
  return `<a class="feat" href="${link(c)}" data-cursor="View">
    <span class="idx">${String(i + 1).padStart(2, "0")}</span>
    <div class="frame"><img src="${im.src}" alt="${c.name}" loading="lazy"></div>
    <div class="cap"><b>${c.name}</b><span>${c.industry}</span></div></a>`;
}).join("");

// ---------- Scroll reveals + counters ----------
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target;
  if (el.dataset.count) countUp(el); else el.classList.add("in");
  io.unobserve(el);
}), { threshold: .12 });
const observe = root => root.querySelectorAll(".tile, .feat, .shot, [data-count]").forEach((el, i) => {
  if (el.classList.contains("tile")) el.style.transitionDelay = (i % 6) * 60 + "ms";
  io.observe(el);
});
observe(home);
function countUp(el) {
  const end = +el.dataset.count, t0 = performance.now();
  (function tick(t) {
    const p = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(end * e) + (p === 1 ? "+" : "");
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

// ---------- Custom cursor ----------
const cur = $("cursor"), curLabel = $("cursor-label");
let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; });
(function follow() {
  cx += (tx - cx) * .2; cy += (ty - cy) * .2;
  cur.style.transform = `translate(${cx}px, ${cy}px)`;
  requestAnimationFrame(follow);
})();
document.addEventListener("mouseover", e => {
  const t = e.target.closest("[data-cursor], .shot");
  cur.classList.toggle("big", !!t);
  curLabel.textContent = t ? (t.dataset.cursor || "Zoom") : "";
});

// ---------- Client page ----------
function showClient(slug) {
  const i = WORK.findIndex(c => c.slug === slug);
  if (i < 0) return (location.hash = "#/clients");
  const c = WORK[i], next = WORK[(i + 1) % WORK.length];
  document.title = `${c.name} — Hossam Khattab`;
  $("cp-logo").innerHTML = mark(c);
  $("cp-name").textContent = c.name;
  $("cp-industry").textContent = `${c.industry} · ${c.images.length} pieces`;
  const gal = $("cp-gallery");
  gal.innerHTML = c.images.map((im, n) =>
    `<figure class="shot" data-n="${n}"><img src="${im.src}" width="${im.w}" height="${im.h}" alt="${c.name} ${n + 1}" loading="lazy"></figure>`).join("");
  gal.querySelectorAll(".shot").forEach(f =>
    f.onclick = () => openLb(c.images.map(im => im.src), +f.dataset.n, c.name));
  observe(gal);
  $("cp-next").href = link(next);
  $("cp-next-name").textContent = next.name;
  $("cp-next-img").src = cover(next);
  // replay entrance animations
  ["cp-logo", "cp-name"].forEach(id => { const el = $(id); el.style.animation = "none"; el.offsetHeight; el.style.animation = ""; });
  home.hidden = true; page.hidden = false;
  scrollTo(0, 0);
}

// ---------- Router ----------
function route() {
  const hash = location.hash;
  const m = hash.match(/^#\/client\/(.+)$/);
  if (m) return showClient(m[1]);
  document.title = "Hossam Khattab — Graphic Designer and AI Artist";
  const wasHidden = home.hidden;
  page.hidden = true; home.hidden = false;
  const target = document.getElementById(hash.replace(/^#\//, ""));
  if (target) target.scrollIntoView({ behavior: wasHidden ? "auto" : "smooth" });
  else scrollTo({ top: 0, behavior: wasHidden ? "auto" : "smooth" });
}
addEventListener("hashchange", route);
route();

// ---------- Lightbox ----------
let lbList = [], lbIndex = 0;
function openLb(srcs, n, caption) {
  lbList = srcs; lbIndex = n;
  $("lb-caption").textContent = caption;
  $("lb-img").src = lbList[lbIndex];
  lb.hidden = false;
  document.body.style.overflow = "hidden";
}
function step(d) { lbIndex = (lbIndex + d + lbList.length) % lbList.length; $("lb-img").src = lbList[lbIndex]; }
function closeLb() { lb.hidden = true; document.body.style.overflow = ""; }
lb.querySelector(".lb-close").onclick = closeLb;
lb.querySelector(".lb-prev").onclick = e => { e.stopPropagation(); step(-1); };
lb.querySelector(".lb-next").onclick = e => { e.stopPropagation(); step(1); };
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});
