const root = document.querySelector<HTMLElement>("[data-demo]");
if (root) {
  const canvas = root.querySelector("canvas")!;
  const ctx = canvas.getContext("2d");
  const stage = root.querySelector<HTMLElement>(".demo-stage")!;
  const toggle = root.querySelector<HTMLButtonElement>("[data-toggle]")!;
  const burstButton = root.querySelector<HTMLButtonElement>("[data-burst]")!;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    max: number;
    size: number;
    angle: number;
    star: boolean;
    color: string;
  };
  let particles: Particle[] = [];
  let paused = motion.matches;
  let visible = true;
  let frame = 0;
  let last = 0;
  let lastMove = 0;
  let width = 1,
    height = 1;
  const colors = ["#da672f", "#f0a654", "#ad4229", "#eab54c"];
  function resize() {
    const rect = stage.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function updateControls() {
    root!.dataset.paused = String(paused);
    toggle.textContent =
      (paused ? root!.dataset.play : root!.dataset.pause) || "";
    toggle.setAttribute("aria-pressed", String(paused));
    burstButton.disabled = paused;
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }
  function start() {
    if (!frame && !paused && visible && !document.hidden && particles.length)
      frame = requestAnimationFrame(draw);
  }
  function setPaused(value: boolean) {
    paused = value;
    updateControls();
    if (paused) {
      stop();
      particles = [];
      ctx?.clearRect(0, 0, width, height);
    } else start();
  }
  function emit(x: number, y: number, count: number, kind = "burst") {
    if (paused || !visible || document.hidden || !ctx) return;
    const available = Math.max(0, 130 - particles.length);
    for (let i = 0; i < Math.min(count, available); i++) {
      const a = Math.random() * Math.PI * 2;
      const speed =
        kind === "trail" ? 12 + Math.random() * 30 : 35 + Math.random() * 115;
      const life = 0.45 + Math.random() * 0.7;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life,
        max: life,
        size: 2 + Math.random() * 5,
        angle: a,
        star: Math.random() > 0.58,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    start();
  }
  function draw(now: number) {
    frame = 0;
    if (paused || !visible || document.hidden || !ctx) return;
    const dt = last ? Math.min((now - last) / 1000, 0.04) : 0.016;
    last = now;
    ctx.clearRect(0, 0, width, height);
    particles = particles.filter((p) => p.life > 0);
    for (const p of particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 42 * dt;
      p.angle += dt;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      const s = p.size;
      if (p.star) {
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.5);
        ctx.quadraticCurveTo(s * 0.2, -s * 0.2, s * 1.5, 0);
        ctx.quadraticCurveTo(s * 0.2, s * 0.2, 0, s * 1.5);
        ctx.quadraticCurveTo(-s * 0.2, s * 0.2, -s * 1.5, 0);
        ctx.quadraticCurveTo(-s * 0.2, -s * 0.2, 0, -s * 1.5);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (particles.length) start();
    else {
      ctx.clearRect(0, 0, width, height);
      last = 0;
    }
  }
  function atEvent(e: PointerEvent | MouseEvent, count: number, kind?: string) {
    const rect = stage.getBoundingClientRect();
    emit(e.clientX - rect.left, e.clientY - rect.top, count, kind);
  }
  stage.addEventListener("pointermove", (e) => {
    if (performance.now() - lastMove < 35) return;
    lastMove = performance.now();
    if (e.pointerType === "touch" && !e.buttons) return;
    atEvent(e, e.buttons ? 5 : 2, "trail");
  });
  stage.addEventListener("pointerdown", (e) =>
    atEvent(e, e.button === 2 ? 24 : 18),
  );
  stage.addEventListener("dblclick", (e) => atEvent(e, 38));
  // Preserve native context menus, text selection, pointer behavior and page scrolling.
  burstButton.addEventListener("click", () =>
    emit(width * 0.5, height * 0.45, 38),
  );
  toggle.addEventListener("click", () => setPaused(!paused));
  motion.addEventListener("change", (e) => {
    if (e.matches) setPaused(true);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) start();
    else stop();
  });
  observer.observe(stage);
  new ResizeObserver(resize).observe(stage);
  resize();
  updateControls();
}
