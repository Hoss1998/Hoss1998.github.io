const $ = id => document.getElementById(id);
const home = $("home"), page = $("client-page");
const lb = $("lightbox");
let lbList = [], lbIndex = 0;

$("year").textContent = new Date().getFullYear();
$("client-count").textContent = CLIENTS.length + "+";

const link = c => `#/client/${c.slug}`;

// ---------- Hero marquee: one standout piece per client ----------
const picks = CLIENTS.map(c => `<a href="${link(c)}"><img src="${c.images[1]?.src || c.images[0].src}" alt="${c.name}" loading="lazy"></a>`).join("");
$("track").innerHTML = picks + picks;

// ---------- Selected work: one cover card per client ----------
const grid = $("grid");
CLIENTS.forEach(c => {
  const a = document.createElement("a");
  a.className = "card";
  a.href = link(c);
  a.dataset.ind = c.industry;
  a.innerHTML = `
    <div class="thumb"><img src="${c.images[0].src}" alt="${c.name}" loading="lazy"></div>
    <div class="meta"><strong>${c.name}</strong><span>${c.industry}</span></div>`;
  grid.appendChild(a);
});

// Industry filters
const filters = $("filters");
["All", ...new Set(CLIENTS.map(c => c.industry))].forEach((ind, i) => {
  const b = document.createElement("button");
  b.textContent = ind;
  if (i === 0) b.classList.add("active");
  b.onclick = () => {
    filters.querySelectorAll("button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    grid.querySelectorAll(".card").forEach(card =>
      card.classList.toggle("hide", ind !== "All" && card.dataset.ind !== ind));
  };
  filters.appendChild(b);
});

// ---------- Clients: clickable names with hover preview ----------
const list = $("client-list"), peek = $("peek");
const byInd = {};
CLIENTS.forEach(c => (byInd[c.industry] ||= []).push(c));
Object.entries(byInd).forEach(([ind, cs]) => {
  const g = document.createElement("div");
  g.className = "client-group";
  g.innerHTML = `<h3>${ind}</h3>` + cs.map(c =>
    `<a href="${link(c)}" data-img="${c.images[0].src}">${c.name}<sup>${c.images.length}</sup></a>`).join("");
  list.appendChild(g);
});
list.addEventListener("mouseover", e => {
  const a = e.target.closest("a");
  if (!a) return;
  peek.src = a.dataset.img;
  peek.hidden = false;
});
list.addEventListener("mouseleave", () => (peek.hidden = true));
list.addEventListener("mousemove", e => {
  peek.style.transform = `translate(${e.clientX + 24}px, ${e.clientY - 120}px)`;
});

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .08 });
const observe = root => root.querySelectorAll(".card, .shot").forEach(el => io.observe(el));
observe(grid);

// ---------- Client page ----------
function showClient(slug) {
  const i = CLIENTS.findIndex(c => c.slug === slug);
  if (i < 0) return route("#/");
  const c = CLIENTS[i];
  document.title = `${c.name} — Hossam Khattab`;
  $("cp-name").textContent = c.name;
  $("cp-industry").textContent = `${c.industry} · ${c.images.length} pieces`;
  const gal = $("cp-gallery");
  gal.innerHTML = c.images.map((im, n) =>
    `<figure class="shot" data-n="${n}"><img src="${im.src}" width="${im.w}" height="${im.h}" alt="${c.name} ${n + 1}" loading="lazy"></figure>`).join("");
  gal.querySelectorAll(".shot").forEach(f =>
    f.onclick = () => openLb(c.images.map(im => im.src), +f.dataset.n, c.name));
  observe(gal);
  const prev = CLIENTS[(i - 1 + CLIENTS.length) % CLIENTS.length];
  const next = CLIENTS[(i + 1) % CLIENTS.length];
  $("cp-prev").href = link(prev); $("cp-prev").innerHTML = `<span>Previous</span>${prev.name}`;
  $("cp-next").href = link(next); $("cp-next").innerHTML = `<span>Next</span>${next.name}`;
  home.hidden = true; page.hidden = false;
  window.scrollTo(0, 0);
}

// ---------- Router ----------
function route(hash = location.hash) {
  const m = hash.match(/^#\/client\/(.+)$/);
  if (m) return showClient(m[1]);
  document.title = "Hossam Khattab — Art Director & AI Creative";
  const wasHidden = home.hidden;
  page.hidden = true; home.hidden = false;
  const sec = hash.replace(/^#\//, "");
  const target = sec && document.getElementById(sec);
  if (target) target.scrollIntoView({ behavior: wasHidden ? "auto" : "smooth" });
  else if (wasHidden) window.scrollTo(0, 0);
}
window.addEventListener("hashchange", () => route());
route();

// ---------- Lightbox ----------
function openLb(srcs, n, caption) {
  lbList = srcs; lbIndex = n;
  $("lb-caption").textContent = caption;
  showLb();
  lb.hidden = false;
  document.body.style.overflow = "hidden";
}
function showLb() { $("lb-img").src = lbList[lbIndex]; }
function step(d) { lbIndex = (lbIndex + d + lbList.length) % lbList.length; showLb(); }
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
