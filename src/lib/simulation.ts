// Simulation utilities: random sampling, correlated data, Anscombe-like sets.

// Box-Muller — standard normal
export function randn(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface Point { x: number; y: number; }

function standardize(arr: number[]): number[] {
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
  const sd = Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length) || 1;
  return arr.map((v) => (v - mean) / sd);
}

/** Generate (x, y) with target Pearson r. y = r·x + sqrt(1-r²)·noise, then standardize both. */
export function generateCorrelated(n: number, r: number): Point[] {
  const r1 = Math.max(-0.999, Math.min(0.999, r));
  const xRaw = Array.from({ length: n }, () => randn());
  const noise = Array.from({ length: n }, () => randn());
  const yRaw = xRaw.map((x, i) => r1 * x + Math.sqrt(1 - r1 * r1) * noise[i]);
  const x = standardize(xRaw);
  const y = standardize(yRaw);
  return x.map((xi, i) => ({ x: xi, y: y[i] }));
}

export type Scenario = 'normal' | 'outliers' | 'curve' | 'hetero';

export function generateScenario(n: number, r: number, scenario: Scenario): Point[] {
  if (scenario === 'normal') return generateCorrelated(n, r);

  if (scenario === 'outliers') {
    const pts = generateCorrelated(n - Math.max(2, Math.floor(n * 0.04)), r);
    const k = Math.max(2, Math.floor(n * 0.04));
    for (let i = 0; i < k; i++) {
      pts.push({ x: 3 + Math.random() * 1.5, y: -3 - Math.random() * 1.5 });
    }
    return pts;
  }

  if (scenario === 'curve') {
    // U-shape: y ≈ x² with noise — Pearson r ≈ 0
    const xRaw = Array.from({ length: n }, () => (Math.random() * 4 - 2));
    const yRaw = xRaw.map((x) => x * x + 0.3 * randn());
    const x = standardize(xRaw);
    const y = standardize(yRaw);
    return x.map((xi, i) => ({ x: xi, y: y[i] }));
  }

  if (scenario === 'hetero') {
    // Variance grows with x
    const xRaw = Array.from({ length: n }, () => randn());
    const yRaw = xRaw.map((x) => r * x + (0.2 + Math.abs(x)) * randn());
    const x = standardize(xRaw);
    const y = standardize(yRaw);
    return x.map((xi, i) => ({ x: xi, y: y[i] }));
  }

  return generateCorrelated(n, r);
}

/** Pearson r */
export function pearsonR(pts: Point[]): number {
  const n = pts.length;
  if (n < 2) return 0;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const p of pts) {
    const a = p.x - mx, b = p.y - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}

/** Covariance matrix [sxx, sxy; sxy, syy] */
export function covMatrix(pts: Point[]): { sxx: number; syy: number; sxy: number; mx: number; my: number } {
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0, syy = 0, sxy = 0;
  for (const p of pts) {
    const a = p.x - mx, b = p.y - my;
    sxx += a * a; syy += b * b; sxy += a * b;
  }
  const d = Math.max(1, n - 1);
  return { sxx: sxx / d, syy: syy / d, sxy: sxy / d, mx, my };
}

/** Linear regression (OLS) y = a + b·x */
export function ols(pts: Point[]): { a: number; b: number } {
  const c = covMatrix(pts);
  const b = c.sxx === 0 ? 0 : c.sxy / c.sxx;
  const a = c.my - b * c.mx;
  return { a, b };
}

/** 2x2 eigen-decomp for symmetric matrix [[a,b],[b,d]] → eigenvalues (λ1≥λ2) and angle (rad) of λ1's eigvec */
export function eigen2x2(a: number, b: number, d: number) {
  const tr = a + d;
  const det = a * d - b * b;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  // eigenvector of l1
  let vx = b, vy = l1 - a;
  if (Math.abs(vx) < 1e-12 && Math.abs(vy) < 1e-12) { vx = 1; vy = 0; }
  const angle = Math.atan2(vy, vx);
  return { l1: Math.max(0, l1), l2: Math.max(0, l2), angle };
}

/** Mahalanobis distance squared for one point given covariance */
export function mahalanobisSq(p: Point, c: ReturnType<typeof covMatrix>): number {
  const dx = p.x - c.mx, dy = p.y - c.my;
  const det = c.sxx * c.syy - c.sxy * c.sxy;
  if (det <= 0) return 0;
  const ixx = c.syy / det, iyy = c.sxx / det, ixy = -c.sxy / det;
  return dx * dx * ixx + 2 * dx * dy * ixy + dy * dy * iyy;
}

// ---------- Anscombe-like quartet (3 sets here) ----------
// Classic Anscombe values, all r ≈ 0.816
const ANSCOMBE_X = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
export const ANSCOMBE_SETS: { id: string; label: string; pts: Point[] }[] = [
  {
    id: 'I',
    label: 'I — линейная',
    pts: ANSCOMBE_X.map((x, i) => ({ x, y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68][i] })),
  },
  {
    id: 'II',
    label: 'II — кривая',
    pts: ANSCOMBE_X.map((x, i) => ({ x, y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74][i] })),
  },
  {
    id: 'III',
    label: 'III — выброс',
    pts: ANSCOMBE_X.map((x, i) => ({ x, y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73][i] })),
  },
];
