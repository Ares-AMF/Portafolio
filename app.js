// Portafolio — Ares A.M.F.. Sin dependencias.
(() => {
  document.documentElement.classList.remove("no-js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Año del footer
  document.getElementById("year").textContent = new Date().getFullYear();

  // Nav: fondo al hacer scroll
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menú móvil
  const toggle = nav.querySelector(".nav-toggle");
  const menu = document.getElementById("menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.classList.toggle("open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Aparición al hacer scroll
  const items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 60}ms`;
      io.observe(el);
    });
  }

  // Terminal del hero
  const out = document.getElementById("typed");
  const lines = [
    "cto --company chúuk",
    "focus: visión por computadora · edge · salud",
    "status: abierto a colaborar ✓",
  ];
  if (reduce) { out.textContent = lines[2]; return; }
  let li = 0, ci = 0, deleting = false;
  const tick = () => {
    const line = lines[li];
    ci += deleting ? -1 : 1;
    out.textContent = line.slice(0, ci);
    let wait = deleting ? 22 : 45 + Math.random() * 40;
    if (!deleting && ci === line.length) { wait = 2200; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; li = (li + 1) % lines.length; wait = 350; }
    setTimeout(tick, wait);
  };
  setTimeout(tick, 900);
})();
