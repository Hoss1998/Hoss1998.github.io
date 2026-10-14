const grid = document.getElementById("grid");
const filters = document.getElementById("filters");
const lb = document.getElementById("lightbox");

document.getElementById("year").textContent = new Date().getFullYear();

function media(p, thumb) {
  if (!p.src) return `<div class="placeholder">${p.category}</div>`;
  if (p.type === "video") {
    return thumb
      ? `<video src="${p.src}" muted loop playsinline preload="metadata"></video>`
      : `<video src="${p.src}" controls autoplay loop playsinline></video>`;
  }
  return `<img src="${p.src}" alt="${p.title}" loading="lazy">`;
}

// Cards
PROJECTS.forEach((p, i) => {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.cat = p.category;
  card.innerHTML = `
    <div class="thumb">${media(p, true)}${p.type === "video" ? '<span class="badge">▶ Video</span>' : ""}</div>
    <div class="meta"><strong>${p.title}</strong><span>${p.category}</span></div>`;
  const vid = card.querySelector("video");
  if (vid) {
    card.addEventListener("mouseenter", () => vid.play());
    card.addEventListener("mouseleave", () => vid.pause());
  }
  card.addEventListener("click", () => open(i));
  grid.appendChild(card);
});

// Filters
["All", ...new Set(PROJECTS.map(p => p.category))].forEach((cat, i) => {
  const b = document.createElement("button");
  b.textContent = cat;
  if (i === 0) b.classList.add("active");
  b.onclick = () => {
    filters.querySelectorAll("button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    grid.querySelectorAll(".card").forEach(c =>
      c.classList.toggle("hide", cat !== "All" && c.dataset.cat !== cat));
  };
  filters.appendChild(b);
});

// Reveal on scroll
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .1 });
grid.querySelectorAll(".card").forEach(c => io.observe(c));

// Lightbox
function open(i) {
  const p = PROJECTS[i];
  document.getElementById("lb-media").innerHTML = media(p, false);
  document.getElementById("lb-title").textContent = p.title;
  document.getElementById("lb-desc").textContent = p.desc;
  document.getElementById("lb-tools").textContent = p.tools;
  lb.hidden = false;
  document.body.style.overflow = "hidden";
}
function close() {
  lb.hidden = true;
  document.getElementById("lb-media").innerHTML = "";
  document.body.style.overflow = "";
}
lb.querySelector(".lb-close").onclick = close;
lb.addEventListener("click", e => { if (e.target === lb) close(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
