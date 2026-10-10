(() => {
  document.documentElement.classList.remove("no-js");
  const WA = "918884016911";

  // Solid nav once the hero is scrolled past
  const nav = document.querySelector("[data-nav]");
  const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 60);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    nav.classList.toggle("is-solid", open || window.scrollY > 60);
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  // Reveal on scroll
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-in"));
  }

  // Lightbox
  const lb = document.querySelector("[data-lightbox]");
  const lbImg = lb.querySelector("[data-lb-img]");
  const thumbs = [...document.querySelectorAll("[data-gallery] button")];
  let idx = 0;
  const show = (i) => {
    idx = (i + thumbs.length) % thumbs.length;
    const b = thumbs[idx];
    lbImg.src = b.dataset.full;
    lbImg.alt = b.querySelector("img").alt;
  };
  const open = () => { if (!lb.open) lb.showModal(); document.body.style.overflow = "hidden"; };
  thumbs.forEach((b, i) => b.addEventListener("click", () => { lb.classList.remove("is-single"); show(i); open(); }));
  document.querySelectorAll("[data-lightbox-single]").forEach((b) => b.addEventListener("click", () => {
    lb.classList.add("is-single");
    lbImg.src = b.dataset.lightboxSingle;
    lbImg.alt = b.dataset.alt || "";
    open();
  }));
  lb.querySelector("[data-lb-close]").addEventListener("click", () => lb.close());
  lb.querySelector("[data-lb-prev]").addEventListener("click", () => show(idx - 1));
  lb.querySelector("[data-lb-next]").addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener("close", () => { document.body.style.overflow = ""; });
  lb.addEventListener("keydown", (e) => {
    if (lb.classList.contains("is-single")) return;
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "ArrowLeft") show(idx - 1);
  });
  let x0 = null;
  lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (x0 === null || lb.classList.contains("is-single")) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  // Enquiry form -> WhatsApp
  const form = document.querySelector("[data-enquiry]");
  const err = form.querySelector("[data-form-error]");
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const iso = today.toISOString().slice(0, 10);
  form.in.min = iso; form.out.min = iso;
  form.in.addEventListener("change", () => { form.out.min = form.in.value || iso; });
  const fmt = (v) => new Date(v + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    let msg = "";
    if (!d.name.trim()) msg = "Please add your name.";
    else if (!d.in || !d.out) msg = "Please choose check-in and check-out dates.";
    else if (d.out <= d.in) msg = "Check-out needs to be after check-in.";
    else if (!d.guests || +d.guests < 1) msg = "Please tell us how many guests.";
    err.hidden = !msg; err.textContent = msg;
    if (msg) return;
    const text = [
      `Hi, I'd like to enquire about staying at Bhramari.`,
      `Name: ${d.name.trim()}`,
      `Dates: ${fmt(d.in)} to ${fmt(d.out)}`,
      `Guests: ${d.guests}`,
      d.note.trim() ? `Note: ${d.note.trim()}` : "",
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });

  const y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
