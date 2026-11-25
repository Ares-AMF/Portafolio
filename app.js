// Portafolio — Ares A.M.F. Sin dependencias.
(() => {
  document.documentElement.classList.remove("no-js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Reloj de Chihuahua ---------- */
  const clock = $("#clock");
  const fmt = new Intl.DateTimeFormat("es-MX", { timeZone: "America/Chihuahua", hour: "2-digit", minute: "2-digit", hour12: false });
  const tickClock = () => { clock.textContent = `CUU ${fmt.format(new Date())}`; };
  tickClock(); setInterval(tickClock, 15000);

  /* ---------- Nav, progreso y sección activa ---------- */
  const nav = $("#nav"), bar = $("#progress");
  const onScroll = () => {
    nav.classList.toggle("scrolled", scrollY > 10);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  const links = $$(".nav-links a[data-section]");
  const secIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => a.classList.toggle("active", a.dataset.section === e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((a) => { const s = document.getElementById(a.dataset.section); s && secIO.observe(s); });

  const toggle = $(".nav-toggle"), menu = $("#menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.classList.toggle("open", open); nav.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ---------- Fondo de matriz de puntos ---------- */
  const cv = $("#dots"), ctx = cv.getContext("2d");
  const GAP = 26;
  let W = 0, H = 0, dpr = 1, px = -999, py = -999, cx = -999, cy = -999, raf = 0;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const R = 170;
    for (let y = GAP / 2; y < H; y += GAP) {
      for (let x = GAP / 2; x < W; x += GAP) {
        const d = Math.hypot(x - cx, y - cy);
        const k = d < R ? 1 - d / R : 0;
        const e = k * k;
        ctx.beginPath();
        ctx.arc(x, y, 0.9 + e * 2.1, 0, Math.PI * 2);
        ctx.fillStyle = e > 0.02
          ? `rgba(${Math.round(60 + 175 * e)},${Math.round(60 - 15 * e)},${Math.round(60 - 15 * e)},${0.55 + e * 0.45})`
          : "rgba(255,255,255,0.07)";
        ctx.fill();
      }
    }
  };
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };
  const loop = () => {
    cx += (px - cx) * 0.18; cy += (py - cy) * 0.18;
    draw();
    raf = Math.abs(px - cx) + Math.abs(py - cy) > 0.5 ? requestAnimationFrame(loop) : 0;
  };
  addEventListener("resize", resize);
  if (finePointer && !reduce) {
    addEventListener("pointermove", (e) => {
      px = e.clientX; py = e.clientY;
      if (cx < -500) { cx = px; cy = py; }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener("pointerleave", () => { px = py = -999; if (!raf) raf = requestAnimationFrame(loop); });
  }
  resize();

  /* ---------- Nombre: efecto de decodificación ---------- */
  const name = $("[data-scramble]");
  if (name && !reduce) {
    const final = name.dataset.scramble, glyphs = "01#%*+=<>/\ABCDEFMRSX";
    const total = 34;
    const html = (str) => [...str].map((ch) => (ch === "." ? '<i class="pd"></i>' : ch)).join("");
    let frame = total + 1;
    const run = () => {
      name.innerHTML = html([...final].map((ch, i) => {
        if (ch === " " || ch === ".") return ch;
        return frame > i * 2.4 + 8 ? ch : glyphs[(Math.random() * glyphs.length) | 0];
      }).join(""));
      if (++frame <= total) requestAnimationFrame(run); else name.innerHTML = html(final);
    };
    setTimeout(() => { frame = 0; run(); }, 250);
    name.addEventListener("pointerenter", () => { if (frame > total) { frame = 0; run(); } });
  }

  /* ---------- Aparición y contadores ---------- */
  const counters = (el) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || "";
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 4)));
      el.textContent = String(v).padStart(2, "0") + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const revealIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    $$("[data-count]", e.target).forEach(counters);
    revealIO.unobserve(e.target);
  }), { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 5) * 70}ms`;
    if (reduce) { el.classList.add("in"); $$("[data-count]", el).forEach(counters); }
    else revealIO.observe(el);
  });

  /* ---------- Acordeón de proyectos ---------- */
  const accs = $$(".acc");
  const setAcc = (acc, open) => {
    acc.classList.toggle("open", open);
    $(".acc-head", acc).setAttribute("aria-expanded", String(open));
  };
  accs.forEach((acc) => {
    const head = $(".acc-head", acc);
    setAcc(acc, head.getAttribute("aria-expanded") === "true");
    head.addEventListener("click", () => {
      const willOpen = !acc.classList.contains("open");
      accs.forEach((a) => a !== acc && setAcc(a, false));
      setAcc(acc, willOpen);
    });
  });

  /* ---------- Spotlight, tilt, botones magnéticos y lente ---------- */
  if (finePointer && !reduce) {
    $$(".spot").forEach((el) => el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }));
    $$(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });

    const photo = $("#photo");
    photo.addEventListener("pointermove", (e) => {
      const r = photo.getBoundingClientRect();
      photo.style.setProperty("--x", `${e.clientX - r.left}px`);
      photo.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
    photo.addEventListener("pointerenter", () => photo.style.setProperty("--r", "95px"));
    photo.addEventListener("pointerleave", () => photo.style.setProperty("--r", "0px"));
  }

  /* ---------- Filtro de tecnologías ---------- */
  const tabs = $$(".tabs [role=tab]"), pill = $(".tab-pill"), techs = $$("#tech li");
  const movePill = (btn) => {
    pill.style.width = `${btn.offsetWidth}px`;
    pill.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop - 5}px)`;
  };
  tabs.forEach((btn) => btn.addEventListener("click", () => {
    tabs.forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
    movePill(btn);
    const f = btn.dataset.filter;
    techs.forEach((li) => li.classList.toggle("dim", f !== "all" && li.dataset.cat !== f));
  }));
  const syncPill = () => movePill($(".tabs [aria-selected=true]"));
  addEventListener("resize", syncPill);
  if (document.fonts) document.fonts.ready.then(syncPill);
  syncPill();

  /* ---------- Copiar correo ---------- */
  const toast = $("#toast");
  let toastT;
  const showToast = (msg) => {
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove("show"), 2200);
  };
  $$("[data-copy]").forEach((btn) => btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.classList.add("done"); $("use", btn).setAttribute("href", "#i-check");
      showToast("Correo copiado");
      setTimeout(() => { btn.classList.remove("done"); $("use", btn).setAttribute("href", "#i-copy"); }, 2000);
    } catch { showToast(btn.dataset.copy); }
  }));
})();
