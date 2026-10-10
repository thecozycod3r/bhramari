(() => {
  const root = document.documentElement;
  root.classList.remove("no-js");
  const WA = "918884016911";
  const NAV_H = 64;

  // Motion needs the libraries and a viewer who hasn't asked for reduced motion.
  // ?nomotion turns it off for screenshots and QA.
  const motion = root.classList.contains("anim") && window.gsap && window.ScrollTrigger && !/nomotion/.test(location.search);
  if (!motion) root.classList.remove("anim");

  let lenis = null;
  if (motion) {
    gsap.registerPlugin(ScrollTrigger);
  }
  const lockScroll = (on) => {
    document.body.style.overflow = on ? "hidden" : "";
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  // In-page links: smooth scroll that lands below the nav
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const target = document.querySelector(a.getAttribute("href"));
    if (!target || !lenis) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: target.id === "top" ? 0 : -NAV_H + 1, duration: 1.4 });
    history.replaceState(null, "", a.getAttribute("href"));
  });

  // Nav: solid after the hero, hides going down, returns going up
  const nav = document.querySelector("[data-nav]");
  const menu = document.querySelector("[data-menu]");
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-solid", y > 60 || !menu.hidden);
    nav.classList.toggle("is-hidden", y > window.innerHeight * 0.8 && y > lastY + 2 && menu.hidden);
    if (y < lastY - 2 || y < window.innerHeight * 0.8) nav.classList.remove("is-hidden");
    lastY = y;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  const toggle = document.querySelector("[data-menu-toggle]");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    lockScroll(open);
    onScroll();
    if (open && motion) gsap.fromTo("[data-menu] nav a, .menu__phone", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power3.out" });
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

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
    if (motion) gsap.fromTo(lbImg, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" });
  };
  const open = () => { if (!lb.open) lb.showModal(); lockScroll(true); };
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
  lb.addEventListener("close", () => lockScroll(false));
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

  // Film: poster first, YouTube loads only when someone presses play
  const filmBtn = document.querySelector("[data-video]");
  if (filmBtn) filmBtn.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${filmBtn.dataset.video}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    f.title = "Bhramari, the farm stay: film by Sanjith Seetharam";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    filmBtn.replaceWith(f);
  });

  const y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();

  if (!motion) return;

  /* ---------------- motion ---------------- */
  const ease = "power3.out";
  const inView = (el, start = "top 86%") => ({ trigger: el, start, once: true });

  // Opening: the logo writes itself, the curtain lifts, the hero settles.
  // The full loader plays once per visit; later page loads go straight to the hero.
  const seen = (() => { try { return sessionStorage.getItem("bh-intro") === "1"; } catch { return false; } })();
  try { sessionStorage.setItem("bh-intro", "1"); } catch {}
  const intro = gsap.timeline({ defaults: { ease } });
  if (!seen && window.scrollY < 50) {
    lockScroll(true);
    intro
      .to(".loader img", { clipPath: "inset(0 0% 0 0)", duration: 1.5, ease: "power2.inOut" })
      .to(".loader", { yPercent: -100, duration: 1.1, ease: "power4.inOut" }, "+=.2")
      .call(() => lockScroll(false));
  } else {
    gsap.set(".loader", { display: "none" });
  }
  intro
    .from(".hero picture img", { scale: 1.16, duration: 2.4, ease: "power2.out" }, seen ? 0 : "<-.6")
    .set(".hero__logo", { opacity: 1, clipPath: "inset(0 100% 0 0)" }, "<.2")
    .to(".hero__logo", { clipPath: "inset(0 0% 0 0)", duration: 1.6, ease: "power2.inOut" }, "<")
    .fromTo(".hero__line", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1 }, "-=.7")
    .fromTo(".hero__ctas", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1 }, "-=.8")
    .to(".hero__scroll", { opacity: 0.75, duration: 0.8 }, "-=.5")
    .set(".loader", { display: "none" });

  // Hero drifts away as you leave it
  gsap.to(".hero picture", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__body", { yPercent: -22, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "70% top", scrub: true } });

  // Headings rise word by word from behind a mask
  document.querySelectorAll("main section:not(.hero) h1, main section:not(.hero) h2").forEach((h) => {
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", h.textContent.trim());
    h.innerHTML = words.map((w) => `<span class="split-line" aria-hidden="true"><span>${w}</span></span>`).join(" ");
    gsap.from(h.querySelectorAll(".split-line > span"), { yPercent: 110, duration: 1.1, stagger: 0.045, ease: "power4.out", scrollTrigger: inView(h) });
  });

  // Script labels write in left to right, like the logo
  gsap.utils.toArray(".eyebrow").forEach((el) => {
    gsap.fromTo(el, { clipPath: "inset(-20% 100% -40% 0)" }, { clipPath: "inset(-20% 0% -40% 0)", duration: 1.4, ease: "power2.inOut", scrollTrigger: inView(el, "top 90%") });
  });

  // Body copy, lists, buttons and forms ease up in sequence
  gsap.utils.toArray(".reveal").forEach((block) => {
    const parts = block.querySelectorAll(":scope > p:not(.eyebrow), :scope > ul, :scope > address, :scope > .btn, :scope > button, :scope > .stay__contact, :scope > label, :scope > .form__row");
    if (parts.length) gsap.from(parts, { y: 26, opacity: 0, duration: 1, stagger: 0.08, ease, scrollTrigger: inView(block, "top 82%") });
  });

  // Photos unmask upward while the image inside settles
  gsap.utils.toArray(".intro__img, .table__img, .mosaic figure, .duo figure, .find__map, .film__frame").forEach((fig) => {
    const img = fig.querySelector("img");
    const tl = gsap.timeline({ scrollTrigger: inView(fig, "top 88%") });
    tl.fromTo(fig, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.inOut" });
    if (img) tl.from(img, { scale: 1.22, duration: 1.8, ease: "power3.out" }, 0);
    const cap = fig.querySelector("figcaption");
    if (cap) tl.from(cap, { xPercent: -100, opacity: 0, duration: 0.8, ease }, 0.9);
  });

  // Rooms: cards rise in a staggered wave
  ScrollTrigger.batch(".rail__item", {
    start: "top 90%", once: true,
    onEnter: (els) => gsap.fromTo(els, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease, overwrite: true }),
  });
  gsap.set(".rail__item", { opacity: 0 });

  // Facts bar
  gsap.from(".facts__list li", { y: 24, opacity: 0, duration: 0.9, stagger: 0.1, ease, scrollTrigger: inView(".facts", "top 92%") });

  // Pool: the photo opens out to full bleed as it scrolls into view (no pinning)
  const poolImg = document.querySelector("[data-pool-img] img");
  gsap.fromTo(poolImg,
    { clipPath: "inset(16% 20% 16% 20%)", scale: 1.18 },
    { clipPath: "inset(0% 0% 0% 0%)", scale: 1, ease: "none",
      scrollTrigger: { trigger: "[data-pool-img]", start: "top 85%", end: "center center", scrub: 0.4 } });

  // Parallax on the big landscape photos
  [[".estate__img img", ".estate__img"], [".stay__bg", ".stay"]].forEach(([img, trig]) => {
    gsap.fromTo(img, { yPercent: -9, scale: 1.18 }, { yPercent: 9, ease: "none", scrollTrigger: { trigger: trig, start: "top bottom", end: "bottom top", scrub: true } });
  });
  gsap.fromTo(".watermark", { xPercent: 12 }, { xPercent: -12, ease: "none", scrollTrigger: { trigger: ".estate", start: "top bottom", end: "bottom top", scrub: true } });

  // Gallery tiles arrive in batches as they scroll in
  gsap.set(".grid button", { opacity: 0, y: 40 });
  ScrollTrigger.batch(".grid button", {
    start: "top 92%", once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, stagger: 0.07, ease, overwrite: true }),
  });

  // Footer logo writes in too
  gsap.fromTo(".foot img", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.6, ease: "power2.inOut", scrollTrigger: inView(".foot", "top 95%") });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
