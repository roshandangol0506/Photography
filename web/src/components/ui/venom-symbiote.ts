/* ── the symbiote ────────────────────────────────────────────────
 * The living tendrils behind VenomButton, drawn on a canvas that sits
 * under the button and reaches out past it on every side.
 *
 * Each strand is a short verlet chain. Its root is pinned to a point on
 * the pill's outline, a few px inside the edge so it emerges from under
 * the button, and its tip is pulled toward a goal by a spring. Everything
 * between is free: gravity, a travelling wave, the pointer's velocity
 * and a pull toward its neighbours act on it, and distance constraints
 * hold it together. So nothing is keyframed. The lag, the sag, the whip
 * when the pointer moves fast and the curl on the way back all come out
 * of the physics.
 *
 * Three behaviours, blended continuously rather than switched:
 *
 * 1. Reach. As the pointer comes within `reach` of the edge, strands
 *    whose roots face it lengthen and their tips close round it. The
 *    nearest roots go first, and more join the closer it gets, because
 *    each strand has its own threshold. A pull toward the bundle's mean
 *    line braids them into one rope instead of a fan.
 * 2. Rouse. Over the button (or on keyboard focus), every strand flares
 *    outward all round it, longest on the side the pointer is on and the
 *    way it is moving.
 * 3. Rest. A few drips hang from the underside, and now and then one
 *    strand twitches out and back, so it never looks switched off.
 *
 * Extension runs through an underdamped spring, so strands overshoot
 * on the way out and recoil elastically on the way back. A press
 * contracts every strand and kicks it toward its root.
 *
 * Drawn in passes, all strands per pass, so overlapping strands merge
 * into one body: a soft offset shadow (reads on light backgrounds), a
 * faint pale rim (reads on dark ones), the black body, the hair-thin
 * filaments that split off and rejoin, then a wet sheen on the lit side.
 * ─────────────────────────────────────────────────────────────── */

export type SymbioteIntensity = "subtle" | "default" | "wild";

type Preset = {
  /** Strands round the outline. */
  strands: number;
  /** How far from the edge, in px, the pointer is noticed. */
  reach: number;
  /** Length of a roused strand, px. */
  flare: number;
  /** Strength of the writhing. */
  wobble: number;
};

const PRESETS: Record<SymbioteIntensity, Preset> = {
  subtle: { strands: 26, reach: 220, flare: 46, wobble: 0.7 },
  default: { strands: 38, reach: 300, flare: 64, wobble: 1 },
  wild: { strands: 52, reach: 380, flare: 84, wobble: 1.4 },
};

/** Simulated points per strand. */
const NODES = 12;
/** Smoothed samples per segment when drawing. */
const SUB = 3;
const SAMPLES = (NODES - 1) * SUB + 1;
/** Fixed simulation step, ms, so the motion is the same at 60 and 144 Hz. */
const STEP = 1000 / 60;
/** Constraint passes per step. More is stiffer. */
const ITERATIONS = 6;
/** Velocity kept per step. */
const DAMP = 0.9;
const GRAVITY = 0.07;
/** Roots sit this far inside the edge, hidden under the button. */
const INSET = 5;
/** Where the light comes from: up and to the left, as on the surface. */
const LIGHT_X = -0.45;
const LIGHT_Y = -0.89;
/** The surface's catchlight at rest, % of the button box. */
const REST_HX = 30;
const REST_HY = 18;

const BODY = "#060607";
const RIM = "rgba(232, 238, 252, 0.17)";
const SHEEN = "rgba(236, 241, 252, 0.62)";
const SHADOW = "rgba(0, 0, 0, 0.2)";

export type Pill = { x: number; y: number; w: number; h: number };

/** What the button surface should do this frame. */
export type SymbioteFrame = {
  /** px the gripping strands pull the button toward the pointer. */
  tugX: number;
  tugY: number;
  /** Press compression, 0 to 1. Dips below 0 as it springs back. */
  squash: number;
  /** 0 idle, 1 fully roused. */
  engage: number;
  /** The catchlight's position, % of the button box. */
  hx: number;
  hy: number;
};

type Thread = { a: number; b: number; amp: number; freq: number; phase: number };

type Strand = {
  /** Root position along the outline, 0..1 clockwise from the top-left. */
  s: number;
  x: Float32Array;
  y: Float32Array;
  px: Float32Array;
  py: Float32Array;
  /** Extension, 0 hidden to 1 at full length, and its velocity. */
  e: number;
  ev: number;
  kE: number;
  kTip: number;
  width: number;
  slack: number;
  /** Longest reach, as a share of the preset's. */
  reach: number;
  /** Roused length, as a share of the preset's. */
  length: number;
  /** How roused by the pointer the area must be before this one joins. */
  threshold: number;
  phase: number;
  freq: number;
  /** Where the tip settles round the pointer, and which way it circles. */
  ring: number;
  ringAngle: number;
  spin: number;
  /** Resting extension. Non-zero only for the drips under the button. */
  rest: number;
  twitch: number;
  twitchUntil: number;
  threads: Thread[];
  /** Whether it is drawn this frame. */
  live: boolean;
  sx: Float32Array;
  sy: Float32Array;
  nx: Float32Array;
  ny: Float32Array;
  w: Float32Array;
};

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Seeded, so the same button grows the same strands on every visit. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── pill geometry ───────────────────────────────────────────────
 * A stadium: two straights joined by half circles. Parameter s runs
 * clockwise from the top-left end of the top straight.
 * ─────────────────────────────────────────────────────────────── */

const pt = { x: 0, y: 0, nx: 0, ny: 0 };

/** Point and outward normal at s on the outline, written into `pt`. */
function outline(p: Pill, s: number) {
  const r = p.h / 2;
  const a = Math.max(p.w - p.h, 0);
  let d = (((s % 1) + 1) % 1) * (2 * a + 2 * Math.PI * r);
  if (d < a) {
    pt.x = p.x + r + d;
    pt.y = p.y;
    pt.nx = 0;
    pt.ny = -1;
    return;
  }
  d -= a;
  if (d < Math.PI * r) {
    const th = -Math.PI / 2 + d / r;
    pt.nx = Math.cos(th);
    pt.ny = Math.sin(th);
    pt.x = p.x + r + a + r * pt.nx;
    pt.y = p.y + r + r * pt.ny;
    return;
  }
  d -= Math.PI * r;
  if (d < a) {
    pt.x = p.x + r + a - d;
    pt.y = p.y + p.h;
    pt.nx = 0;
    pt.ny = 1;
    return;
  }
  d -= a;
  const th = Math.PI / 2 + d / r;
  pt.nx = Math.cos(th);
  pt.ny = Math.sin(th);
  pt.x = p.x + r + r * pt.nx;
  pt.y = p.y + r + r * pt.ny;
}

/** Signed distance from the edge (negative inside) and the nearest s. */
function nearest(p: Pill, x: number, y: number) {
  const r = p.h / 2;
  const a = Math.max(p.w - p.h, 0);
  const per = 2 * a + 2 * Math.PI * r;
  const cx = clamp(x, p.x + r, p.x + r + a);
  const cy = p.y + r;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.hypot(dx, dy) - r;
  let d: number;
  if (x > p.x + r && x < p.x + r + a) {
    d = dy < 0 ? x - p.x - r : a + Math.PI * r + (p.x + r + a - x);
  } else if (x >= p.x + r + a) {
    d = a + (Math.atan2(dy, dx) + Math.PI / 2) * r;
  } else {
    let th = Math.atan2(dy, dx);
    if (th < 0) th += 2 * Math.PI;
    d = 2 * a + Math.PI * r + (th - Math.PI / 2) * r;
  }
  return { dist, s: d / per };
}

export class Symbiote {
  /** px the canvas must extend past the button on each side. */
  readonly margin: number;
  onFrame?: (frame: SymbioteFrame) => void;

  private ctx: CanvasRenderingContext2D;
  private preset: Preset;
  private strands: Strand[] = [];
  private rand = seeded(7);
  private dpr = 1;
  private width = 0;
  private height = 0;
  private pill: Pill = { x: 0, y: 0, w: 0, h: 0 };
  private k = 1;
  private time = 0;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private twitchy = true;
  private nextTwitch = 1800;
  private pulseTimer = 0;

  // The pointer: client coordinates as reported, canvas coordinates as
  // of this frame, and a smoothed velocity in px per step.
  private clientX = 0;
  private clientY = 0;
  private active = false;
  private seen = false;
  private px = 0;
  private py = 0;
  private lastX = 0;
  private lastY = 0;
  private vx = 0;
  private vy = 0;

  private focused = false;
  private pressed = false;
  private recoil = 0;
  private inside = 0;
  private squash = 0;
  private squashV = 0;
  private tugX = 0;
  private tugY = 0;
  private engage = 0;
  private hx = REST_HX;
  private hy = REST_HY;

  // The gripping bundle's mean line, from the previous step.
  private cx = new Float32Array(NODES);
  private cy = new Float32Array(NODES);
  private cw = new Float32Array(NODES);
  // ...and this step's, filled as it goes, then swapped in.
  private nx = new Float32Array(NODES);
  private ny = new Float32Array(NODES);
  private nw = new Float32Array(NODES);

  constructor(
    private canvas: HTMLCanvasElement,
    {
      intensity = "default",
      coarse = false,
    }: { intensity?: SymbioteIntensity; coarse?: boolean } = {},
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is unavailable");
    this.ctx = ctx;
    const preset = PRESETS[intensity];
    // Touch screens get a lighter organism: fewer strands, fewer pixels.
    this.preset = coarse
      ? { ...preset, strands: Math.round(preset.strands * 0.7) }
      : preset;
    this.dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    // Room for the longest strand at the largest scale, plus its sway.
    this.margin = Math.round(preset.reach * 1.25 * 1.15 + 24);
    this.grow();
  }

  /** Size the canvas, in CSS px, and place the button inside it. */
  resize(width: number, height: number, pill: Pill) {
    this.width = width;
    this.height = height;
    this.pill = pill;
    this.k = clamp(pill.h / 56, 0.8, 1.15);
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    // Fold every strand back to its root, so a resize never flings one
    // across the screen from where the old layout left it.
    for (const st of this.strands) {
      outline(pill, st.s);
      st.x.fill(pt.x - pt.nx * INSET);
      st.y.fill(pt.y - pt.ny * INSET);
      st.px.set(st.x);
      st.py.set(st.y);
    }
    if (!this.raf) this.draw();
  }

  /** The pointer moved (or touched down) at these client coordinates. */
  pointer(clientX: number, clientY: number) {
    this.clientX = clientX;
    this.clientY = clientY;
    this.active = true;
  }

  /** The pointer left the window, or a touch ended. */
  leave() {
    this.active = false;
  }

  focus(on: boolean) {
    this.focused = on;
  }

  press() {
    this.pressed = true;
    // Kick every strand back toward its root: a flinch, before the
    // extension spring has had time to pull it in.
    for (const st of this.strands) {
      if (st.e < 0.05) continue;
      for (let j = 1; j < NODES; j++) {
        const u = (j / (NODES - 1)) * 0.07;
        st.px[j] = st.x[j] + (st.x[j] - st.x[0]) * u;
        st.py[j] = st.y[j] + (st.y[j] - st.y[0]) * u;
      }
    }
  }

  release() {
    this.pressed = false;
  }

  /** A press and release, for activation that has no pointer: the keyboard. */
  pulse() {
    this.press();
    window.clearTimeout(this.pulseTimer);
    this.pulseTimer = window.setTimeout(() => this.release(), 130);
  }

  start() {
    if (this.raf) return;
    this.last = 0;
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /**
   * One settled frame, for reduced motion: just the resting drips, drawn
   * once, with no pointer and no twitching.
   */
  still() {
    this.stop();
    this.twitchy = false;
    this.active = false;
    for (let i = 0; i < 240; i++) this.step();
    this.draw();
  }

  destroy() {
    this.stop();
    window.clearTimeout(this.pulseTimer);
    this.onFrame = undefined;
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = this.last ? Math.min(now - this.last, 100) : STEP;
    this.last = now;
    this.acc += dt;

    // One layout read a frame. Measured here rather than on pointermove
    // so the strands stay true while the page scrolls under a still mouse.
    const rect = this.canvas.getBoundingClientRect();
    this.px = this.clientX - rect.left;
    this.py = this.clientY - rect.top;

    let steps = 0;
    while (this.acc >= STEP && steps < 4) {
      this.step();
      this.acc -= STEP;
      steps++;
    }
    // A long stall (background tab, debugger) is dropped, not replayed.
    if (steps === 4) this.acc = 0;
    this.draw();
    this.onFrame?.({
      tugX: this.tugX,
      tugY: this.tugY,
      squash: this.squash,
      engage: this.engage,
      hx: this.hx,
      hy: this.hy,
    });
  };

  private grow() {
    const r = this.rand;
    const n = this.preset.strands;
    const strand = (i: number): Strand => {
      // A third are fine hairs, the rest thicker cords.
      const hair = r() < 0.32;
      const threads: Thread[] = [];
      const count = hair ? 0 : r() < 0.55 ? 1 : 2;
      for (let t = 0; t < count; t++) {
        const a = 0.1 + r() * 0.3;
        threads.push({
          a,
          b: Math.min(a + 0.3 + r() * 0.4, 0.95),
          amp: (2.5 + r() * 6) * (r() < 0.5 ? -1 : 1),
          freq: 0.002 + r() * 0.003,
          phase: r() * Math.PI * 2,
        });
      }
      return {
        s: (((i + (r() - 0.5) * 0.7) / n) % 1 + 1) % 1,
        x: new Float32Array(NODES),
        y: new Float32Array(NODES),
        px: new Float32Array(NODES),
        py: new Float32Array(NODES),
        e: 0,
        ev: 0,
        kE: 0.05 + r() * 0.05,
        kTip: 0.05 + r() * 0.07,
        width: hair ? 1.1 + r() * 0.9 : 2.6 + r() * 2.8,
        slack: 0.06 + r() * 0.22,
        reach: 1.0 + r() * 0.25,
        length: 0.4 + r() * 1.2,
        threshold: 0.05 + Math.pow(r(), 1.2) * 0.65,
        phase: r() * Math.PI * 2,
        freq: 0.0016 + r() * 0.0022,
        ring: 3 + r() * 10,
        ringAngle: r() * Math.PI * 2,
        spin: (r() < 0.5 ? -1 : 1) * (0.5 + r()),
        rest: 0,
        twitch: 0,
        twitchUntil: 0,
        threads,
        live: false,
        sx: new Float32Array(SAMPLES),
        sy: new Float32Array(SAMPLES),
        nx: new Float32Array(SAMPLES),
        ny: new Float32Array(SAMPLES),
        w: new Float32Array(SAMPLES),
      };
    };
    this.strands = Array.from({ length: n }, (_, i) => strand(i));

    // The resting drips: the strands nearest a few spots along the
    // underside. On a 4:1 pill the bottom straight runs from s = 0.42 to
    // 0.81 or so, so these land on it for any sensible proportions.
    for (const at of [0.5, 0.6, 0.71]) {
      let best = this.strands[0];
      for (const st of this.strands)
        if (Math.abs(st.s - at) < Math.abs(best.s - at)) best = st;
      best.rest = 0.38 + r() * 0.16;
    }
  }

  private step() {
    this.time += STEP;
    const t = this.time;
    const p = this.pill;
    const P = this.preset;
    const k = this.k;
    const reach = P.reach * k;

    // Pointer velocity, smoothed. The first sample after it reappears only
    // seeds the history, so a jump never reads as a fling.
    if (this.active) {
      if (this.seen) {
        this.vx += (this.px - this.lastX - this.vx) * 0.3;
        this.vy += (this.py - this.lastY - this.vy) * 0.3;
      }
      this.seen = true;
      this.lastX = this.px;
      this.lastY = this.py;
    } else {
      this.seen = false;
      this.vx *= 0.9;
      this.vy *= 0.9;
    }
    const speed = Math.hypot(this.vx, this.vy);
    const rush = Math.min(speed / 18, 1);
    const vdx = speed > 0.01 ? this.vx / speed : 0;
    const vdy = speed > 0.01 ? this.vy / speed : 0;

    // Where the pointer is relative to the button.
    let edge = Infinity;
    let near = 0;
    if (this.active) {
      const n = nearest(p, this.px, this.py);
      edge = n.dist;
      near = n.s;
    }
    const over = this.active && edge < 0;
    this.inside += ((over || this.focused ? 1 : 0) - this.inside) * 0.08;
    // How roused the strands are by the pointer's nearness. It decides
    // how many strands answer, not how far: each one that answers goes
    // the whole way.
    const prox = this.active
      ? 1 - smoothstep(reach * 0.55, reach, Math.max(edge, 0))
      : 0;
    // The patch of outline that answers widens as the pointer closes in.
    const spread = 0.06 + 0.07 * prox;

    // Pointer direction from the centre, normalised to the pill's own
    // proportions, so "nearest side" means the same at either end.
    const mx = p.x + p.w / 2;
    const my = p.y + p.h / 2;
    let dirX = 0;
    let dirY = 0;
    if (this.active) {
      dirX = (this.px - mx) / (p.w / 2);
      dirY = (this.py - my) / (p.h / 2);
      const l = Math.hypot(dirX, dirY);
      if (l > 1) {
        dirX /= l;
        dirY /= l;
      }
    }

    this.recoil +=
      ((this.pressed ? 1 : 0) - this.recoil) * (this.pressed ? 0.3 : 0.06);

    // Now and then, while nothing is near, one strand twitches out.
    if (this.twitchy && prox < 0.02 && this.inside < 0.05 && t > this.nextTwitch) {
      const st = this.strands[Math.floor(this.rand() * this.strands.length)];
      st.twitch = 0.16 + this.rand() * 0.2;
      st.twitchUntil = t + 380 + this.rand() * 420;
      this.nextTwitch = t + 1600 + this.rand() * 3200;
    }

    let tugX = 0;
    let tugY = 0;
    let tugW = 0;
    let engage = 0;
    const ncx = this.nx.fill(0);
    const ncy = this.ny.fill(0);
    const ncw = this.nw.fill(0);
    const last = NODES - 1;

    for (const st of this.strands) {
      outline(p, st.s);
      const nx = pt.nx;
      const ny = pt.ny;
      const ax = pt.x - nx * INSET;
      const ay = pt.y - ny * INSET;

      // 1. Reach for the pointer.
      let grab = 0;
      let gx = 0;
      let gy = 0;
      if (prox > 0) {
        const ang = st.ringAngle + t * 0.0009 * st.spin;
        const tx = this.px + Math.cos(ang) * st.ring * k - ax;
        const ty = this.py + Math.sin(ang) * st.ring * k - ay;
        const dist = Math.hypot(tx, ty) || 1;
        const facing = (nx * tx + ny * ty) / dist;
        let ds = Math.abs(st.s - near);
        ds = Math.min(ds, 1 - ds);
        const region = Math.exp(-((ds / spread) ** 2));
        const g =
          prox * region * smoothstep(-0.15, 0.55, facing) * (1 - this.inside);
        grab = smoothstep(st.threshold, st.threshold + 0.2, g);
        const max = reach * st.reach;
        grab *= 1 - smoothstep(max, max * 1.25, dist);
        const len = Math.min(dist, max);
        gx = ax + (tx / dist) * len;
        gy = ay + (ty / dist) * len;
      }

      // 2. Rouse: flare outward, more on the pointer's side and the way
      // it is moving. 3. Rest and twitch.
      const side = Math.max(0, nx * dirX + ny * dirY);
      const lead = Math.max(0, nx * vdx + ny * vdy) * rush;
      // Not every strand answers, and those that do differ in length, so
      // it reads as a writhing mass rather than a fringe.
      const rouse =
        this.inside *
        smoothstep(st.threshold * 0.6, st.threshold * 0.6 + 0.25, 0.35 + 0.45 * side + 0.4 * lead) *
        (0.55 + 0.45 * side + 0.3 * lead);
      if (t > st.twitchUntil) st.twitch = 0;
      const free = Math.max(rouse, st.rest, st.twitch);

      // Extension, through an underdamped spring: it overshoots going out
      // and recoils coming back.
      const goal = Math.max(grab, free) * (1 - 0.85 * this.recoil);
      st.ev = (st.ev + (goal - st.e) * st.kE) * 0.8;
      st.e += st.ev;
      if (st.e < 0) {
        st.e = 0;
        st.ev = Math.max(st.ev, 0);
      }

      // Where a free strand points: its normal, curling slowly either way,
      // leaning toward the pointer and swept along by its motion.
      const curl = Math.sin(t * st.freq * 0.6 + st.phase) * 0.9 * P.wobble;
      const cc = Math.cos(curl);
      const cs = Math.sin(curl);
      const flen =
        P.flare * st.length * k * (0.75 + 0.25 * Math.sin(t * st.freq + st.phase * 2));
      // Roused strands hang heavy: they droop as they reach.
      let fx = ax + (nx * cc - ny * cs) * flen;
      let fy = ay + (nx * cs + ny * cc) * flen + flen * 0.45 * this.inside;
      if (this.active) {
        fx += ((this.px - ax) * 0.12 + this.vx * 2) * this.inside;
        fy += ((this.py - ay) * 0.12 + this.vy * 2) * this.inside;
      }

      const wg = grab / (grab + free + 1e-4);
      const dx = gx * wg + fx * (1 - wg) - ax;
      const dy = gy * wg + fy * (1 - wg) - ay;
      const L = Math.hypot(dx, dy);
      const goalX = ax + dx * st.e;
      const goalY = ay + dy * st.e;
      // A grip goes taut, and so does anything being whipped about.
      const slack =
        (st.slack + 0.25 * this.inside * (1 - wg)) * (1 - 0.75 * rush) * (1 - 0.4 * wg);
      const seg = (st.e * L * (1 + slack)) / last;
      // Across the strand, for the travelling wave.
      const qx = L > 0 ? -dy / L : -ny;
      const qy = L > 0 ? dx / L : nx;

      const x = st.x;
      const y = st.y;
      x[0] = st.px[0] = ax;
      y[0] = st.py[0] = ay;
      const cohere = this.cw[last] > 0 ? 0.02 * wg : 0;
      for (let j = 1; j < NODES; j++) {
        const u = j / last;
        const vx = (x[j] - st.px[j]) * DAMP;
        const vy = (y[j] - st.py[j]) * DAMP;
        st.px[j] = x[j];
        st.py[j] = y[j];
        const wave =
          Math.sin(t * st.freq - u * 4.5 + st.phase) +
          0.45 * Math.sin(t * st.freq * 1.9 + u * 8 + st.phase * 1.7);
        const amp =
          P.wobble * (0.22 + 0.14 * this.inside) * Math.sin(Math.PI * u) * st.e * k;
        let fx2 = qx * wave * amp + this.vx * 0.012 * u;
        let fy2 = qy * wave * amp + this.vy * 0.012 * u + GRAVITY * (1 - 0.8 * wg) * k;
        if (cohere && this.cw[j] > 0) {
          fx2 += (this.cx[j] / this.cw[j] - x[j]) * cohere * u;
          fy2 += (this.cy[j] / this.cw[j] - y[j]) * cohere * u;
        }
        if (j === last) {
          fx2 += (goalX - x[j]) * st.kTip;
          fy2 += (goalY - y[j]) * st.kTip;
        }
        x[j] += vx + fx2;
        y[j] += vy + fy2;
      }

      // Hold the chain together, root pinned.
      for (let it = 0; it < ITERATIONS; it++) {
        for (let j = 1; j < NODES; j++) {
          const ddx = x[j] - x[j - 1];
          const ddy = y[j] - y[j - 1];
          const d = Math.hypot(ddx, ddy);
          if (d < 1e-6) continue;
          const diff = (d - seg) / d;
          if (j === 1) {
            x[j] -= ddx * diff;
            y[j] -= ddy * diff;
          } else {
            x[j - 1] += ddx * diff * 0.5;
            y[j - 1] += ddy * diff * 0.5;
            x[j] -= ddx * diff * 0.5;
            y[j] -= ddy * diff * 0.5;
          }
        }
      }

      // Ease out kinks, and keep the strand from cutting behind the
      // button: anything deeper than the roots slides back to that depth,
      // so a strand wraps round the outline instead of through it.
      for (let j = 1; j < last; j++) {
        x[j] += ((x[j - 1] + x[j + 1]) / 2 - x[j]) * 0.12;
        y[j] += ((y[j - 1] + y[j + 1]) / 2 - y[j]) * 0.12;
      }
      if (st.e > 0.02) {
        const r = p.h / 2;
        const a = Math.max(p.w - p.h, 0);
        for (let j = 2; j < NODES; j++) {
          const ccx = clamp(x[j], p.x + r, p.x + r + a);
          const ox = x[j] - ccx;
          const oy = y[j] - (p.y + r);
          const d = Math.hypot(ox, oy);
          if (d > 1e-6 && d - r < -INSET) {
            const to = (r - INSET) / d;
            x[j] = ccx + ox * to;
            y[j] = p.y + r + oy * to;
          }
        }
      }

      const hold = grab * st.e;
      if (hold > 0.01) {
        tugX += (x[last] - ax) * hold;
        tugY += (y[last] - ay) * hold;
        tugW += hold;
        for (let j = 0; j < NODES; j++) {
          ncx[j] += x[j] * hold;
          ncy[j] += y[j] * hold;
          ncw[j] += hold;
        }
      }
      engage = Math.max(engage, hold, rouse);
    }
    [this.cx, this.nx] = [ncx, this.cx];
    [this.cy, this.ny] = [ncy, this.cy];
    [this.cw, this.nw] = [ncw, this.cw];

    // The button is tugged a few px toward whatever is holding it.
    let tx = 0;
    let ty = 0;
    if (tugW > 0) {
      const l = Math.hypot(tugX, tugY) || 1;
      const pull = 3 * k * Math.min(tugW / 3, 1) * Math.min(l / tugW / 60, 1);
      tx = (tugX / l) * pull;
      ty = (tugY / l) * pull * 0.6;
    }
    this.tugX += (tx - this.tugX) * 0.12;
    this.tugY += (ty - this.tugY) * 0.12;
    this.engage += (engage - this.engage) * 0.1;

    this.squashV =
      (this.squashV + ((this.pressed ? 1 : 0) - this.squash) * 0.3) * 0.62;
    this.squash += this.squashV;

    // The catchlight slides toward the pointer, within the top of the pill.
    const lit = Math.max(prox, this.inside);
    const hx = this.active
      ? 50 + clamp((this.px - mx) / p.w, -0.5, 0.5) * 56
      : REST_HX;
    const hy = this.active
      ? 22 + clamp((this.py - my) / p.h, -1.5, 1.5) * 10
      : REST_HY;
    this.hx += (REST_HX + (hx - REST_HX) * lit - this.hx) * 0.08;
    this.hy += (REST_HY + (hy - REST_HY) * lit - this.hy) * 0.08;
  }

  /* ── drawing ─────────────────────────────────────────────────── */

  /** Smooth a strand's nodes into samples with normals and widths. */
  private sample(st: Strand) {
    const { x, y, sx, sy, nx, ny, w } = st;
    let i = 0;
    for (let n = 0; n < NODES - 1; n++) {
      const a = Math.max(n - 1, 0);
      const c = n + 1;
      const d = Math.min(n + 2, NODES - 1);
      for (let s = 0; s < SUB; s++) {
        const t = s / SUB;
        const t2 = t * t;
        const t3 = t2 * t;
        // Catmull-Rom through the nodes: the curve passes through every
        // one, so what is drawn is exactly what was simulated.
        sx[i] =
          0.5 *
          (2 * x[n] +
            (-x[a] + x[c]) * t +
            (2 * x[a] - 5 * x[n] + 4 * x[c] - x[d]) * t2 +
            (-x[a] + 3 * x[n] - 3 * x[c] + x[d]) * t3);
        sy[i] =
          0.5 *
          (2 * y[n] +
            (-y[a] + y[c]) * t +
            (2 * y[a] - 5 * y[n] + 4 * y[c] - y[d]) * t2 +
            (-y[a] + 3 * y[n] - 3 * y[c] + y[d]) * t3);
        i++;
      }
    }
    sx[i] = x[NODES - 1];
    sy[i] = y[NODES - 1];

    let total = 0;
    for (let j = 1; j < SAMPLES; j++)
      total += Math.hypot(sx[j] - sx[j - 1], sy[j] - sy[j - 1]);
    // Not drawn until it is properly out from under the button.
    if (total < INSET + 1.5) return false;

    const k = this.k;
    const base = st.width * k * Math.min(1, st.e * 2.2);
    let arc = 0;
    for (let j = 0; j < SAMPLES; j++) {
      const j0 = Math.max(j - 1, 0);
      const j1 = Math.min(j + 1, SAMPLES - 1);
      let tx = sx[j1] - sx[j0];
      let ty = sy[j1] - sy[j0];
      const l = Math.hypot(tx, ty) || 1;
      tx /= l;
      ty /= l;
      nx[j] = -ty;
      ny[j] = tx;
      if (j > 0) arc += Math.hypot(sx[j] - sx[j - 1], sy[j] - sy[j - 1]);
      const u = arc / total;
      // Tapering to a hair at the tip, with a swollen, gooey root where
      // it leaves the button.
      w[j] =
        0.35 +
        base * (0.18 + 0.82 * Math.pow(1 - u, 1.1)) +
        base * 1.2 * Math.exp(-((arc / (7 * k)) ** 2));
    }
    return true;
  }

  /** Add a strand's outline to the current path. */
  private ribbon(st: Strand, ox: number, oy: number, grow: number) {
    const { sx, sy, nx, ny, w } = st;
    const ctx = this.ctx;
    ctx.moveTo(sx[0] + ox + nx[0] * (w[0] / 2 + grow), sy[0] + oy + ny[0] * (w[0] / 2 + grow));
    for (let j = 1; j < SAMPLES; j++) {
      const h = w[j] / 2 + grow;
      ctx.lineTo(sx[j] + ox + nx[j] * h, sy[j] + oy + ny[j] * h);
    }
    for (let j = SAMPLES - 1; j >= 0; j--) {
      const h = w[j] / 2 + grow;
      ctx.lineTo(sx[j] + ox - nx[j] * h, sy[j] + oy - ny[j] * h);
    }
    ctx.closePath();
  }

  /** The wet highlight: a thin band riding the side that faces the light. */
  private sheen(st: Strand) {
    const { sx, sy, nx, ny, w } = st;
    const ctx = this.ctx;
    const band = (j: number, side: 1 | -1) => {
      // Continuous in the strand's angle: the band drifts across the
      // centre as the strand turns, instead of jumping sides.
      const lit = nx[j] * LIGHT_X + ny[j] * LIGHT_Y;
      const off = lit * w[j] * 0.28;
      const half = w[j] * 0.17 * (0.6 + 0.4 * Math.abs(lit)) * smoothstep(0.8, 2.2, w[j]);
      ctx.lineTo(sx[j] + nx[j] * (off + side * half), sy[j] + ny[j] * (off + side * half));
    };
    ctx.moveTo(sx[0], sy[0]);
    for (let j = 0; j < SAMPLES; j++) band(j, 1);
    for (let j = SAMPLES - 1; j >= 0; j--) band(j, -1);
    ctx.closePath();
  }

  /**
   * Hair-thin filaments that peel off a strand and rejoin it further out,
   * plus the odd web strung between neighbours.
   */
  private threads() {
    const ctx = this.ctx;
    const t = this.time;
    const k = this.k;
    const strands = this.strands;
    for (const st of strands) {
      if (!st.live || st.e < 0.2) continue;
      const fade = Math.min(1, (st.e - 0.2) * 2);
      for (const f of st.threads) {
        const ia = Math.round(f.a * (SAMPLES - 1));
        const ib = Math.round(f.b * (SAMPLES - 1));
        ctx.moveTo(st.sx[ia], st.sy[ia]);
        for (let j = ia + 1; j <= ib; j++) {
          const u = (j - ia) / (ib - ia);
          const off =
            f.amp * k * Math.sin(Math.PI * u) *
            (0.55 + 0.45 * Math.sin(t * f.freq + f.phase + u * 3)) * fade;
          ctx.lineTo(st.sx[j] + st.nx[j] * off, st.sy[j] + st.ny[j] * off);
        }
      }
    }
    const m1 = Math.round(SAMPLES * 0.45);
    const m2 = Math.round(SAMPLES * 0.6);
    for (let i = 0; i < strands.length; i++) {
      const a = strands[i];
      const b = strands[(i + 1) % strands.length];
      if (!a.live || !b.live || a.e < 0.35 || b.e < 0.35) continue;
      const dx = b.sx[m2] - a.sx[m1];
      const dy = b.sy[m2] - a.sy[m1];
      const d = Math.hypot(dx, dy);
      if (d < 3 || d > 30 * k) continue;
      ctx.moveTo(a.sx[m1], a.sy[m1]);
      ctx.quadraticCurveTo(
        a.sx[m1] + dx / 2,
        a.sy[m1] + dy / 2 + 3 + d * 0.15,
        b.sx[m2],
        b.sy[m2],
      );
    }
  }

  private draw() {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);

    let any = false;
    for (const st of this.strands) {
      st.live = this.sample(st);
      any ||= st.live;
    }
    if (!any) return;
    const live = this.strands.filter((st) => st.live);

    // Each pass covers every strand before the next begins, so strands
    // that overlap fuse: the bodies paint over each other's rims and
    // only the outer silhouette keeps one.
    ctx.fillStyle = SHADOW;
    ctx.beginPath();
    for (const st of live) this.ribbon(st, 1.5, 3.5, 0);
    ctx.fill();

    ctx.fillStyle = RIM;
    ctx.beginPath();
    for (const st of live) this.ribbon(st, 0, 0, 0.75);
    ctx.fill();
    ctx.strokeStyle = RIM;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    this.threads();
    ctx.stroke();

    ctx.fillStyle = BODY;
    ctx.beginPath();
    for (const st of live) this.ribbon(st, 0, 0, 0);
    ctx.fill();
    ctx.strokeStyle = BODY;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    this.threads();
    ctx.stroke();

    ctx.fillStyle = SHEEN;
    ctx.beginPath();
    for (const st of live) this.sheen(st);
    ctx.fill();
  }
}
