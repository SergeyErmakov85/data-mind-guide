/**
 * Sample size & statistical power calculations.
 *
 * Approximations follow Cohen (1988): "Statistical Power Analysis for
 * the Behavioral Sciences" and standard normal-approximation formulas.
 *
 * No external dependencies — pure functions, deterministic, client-safe.
 */

/* ───────────────────────── Normal distribution ───────────────────────── */

/**
 * Standard normal PDF.
 */
export const dnorm = (x: number): number =>
  Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

/**
 * Standard normal CDF using Abramowitz & Stegun 7.1.26 approximation.
 * Max error ~7.5e-8.
 */
export function pnorm(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return 0.5 * (1 + sign * y);
}

/**
 * Inverse standard normal CDF — Acklam's algorithm.
 * Domain (0,1). Accuracy ~1.15e-9.
 * Reference: P. J. Acklam, "An algorithm for computing the inverse normal cdf".
 */
export function qnorm(p: number): number {
  if (p <= 0 || p >= 1 || Number.isNaN(p)) {
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    return NaN;
  }

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      ((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]
    ) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
      q
    ) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(
    ((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]
  ) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

/* ─────────────────────── Critical z values ─────────────────────── */

/**
 * z_{1-α/2} for two-sided, z_{1-α} for one-sided.
 */
export const zAlpha = (alpha: number, twoSided: boolean): number =>
  qnorm(1 - alpha / (twoSided ? 2 : 1));

/**
 * z_{1-β} = z corresponding to desired power.
 */
export const zPower = (power: number): number => qnorm(power);

/* ─────────────────────── Chi-square approximations ─────────────────────── */

/** Standard normal noncentral approximation for chi² critical value (Wilson–Hilferty). */
function chiSqCrit(df: number, alpha: number): number {
  const z = qnorm(1 - alpha);
  const h = 2 / (9 * df);
  const v = 1 - h + z * Math.sqrt(h);
  return df * v * v * v;
}

/**
 * Power of a chi² test with noncentrality parameter λ at significance α.
 * Uses Wilson–Hilferty cube-root normal approximation for noncentral χ².
 */
function chiSqPower(df: number, lambda: number, alpha: number): number {
  const xc = chiSqCrit(df, alpha);
  const nu = df + lambda;
  const denom = Math.sqrt(2 * (df + 2 * lambda));
  if (denom <= 0) return alpha;
  const z = (xc - nu) / denom;
  return 1 - pnorm(z);
}

/* ───────────────────────── Public API types ───────────────────────── */

export interface PowerInputBase {
  alpha: number;
  power: number;
  twoSided?: boolean;
}

export interface TTestInput extends PowerInputBase {
  d: number;
  ratio?: number; // n2 / n1
}

export interface CorrInput extends PowerInputBase {
  r: number;
}

export interface ChiSqInput {
  w: number;
  df: number;
  alpha: number;
  power: number;
}

export interface PropInput extends PowerInputBase {
  p1: number;
  p2?: number; // if omitted → one-proportion vs 0.5
}

export interface AnovaInput {
  f: number;
  k: number;
  alpha: number;
  power: number;
}

export interface SampleSizeResult {
  n: number;        // n per group / total — semantic depends on test
  nTotal: number;
  formula: string;
  details: Record<string, number | string>;
}

/* ───────────────────────── Independent t-test ───────────────────────── */

/**
 * n per group for independent two-sample t-test (Cohen's d).
 * Iterates: starts with z-approx, then refines using df = n1+n2-2.
 */
export function tTestN(input: TTestInput): SampleSizeResult {
  const { d, alpha, power } = input;
  const twoSided = input.twoSided ?? true;
  const ratio = input.ratio && input.ratio > 0 ? input.ratio : 1;

  const za = zAlpha(alpha, twoSided);
  const zb = zPower(power);
  if (d === 0 || !Number.isFinite(d)) {
    return {
      n: Infinity,
      nTotal: Infinity,
      formula: "n_1 = (1 + 1/k)·(z_{α/2} + z_β)² / d²",
      details: { d, alpha, power, ratio, note: "d must be non-zero" },
    };
  }

  // Initial z-approximation (per group, equal n).
  // For unequal: n1 = (1 + 1/ratio) * (za+zb)^2 / d^2
  const factor = 1 + 1 / ratio;
  let n1 = (factor * (za + zb) ** 2) / (d * d);

  // Iterate using t-distribution via normal approximation of df.
  // Standard refinement: n1_{i+1} = factor * (t_{α/2,df} + t_{β,df})² / d²
  // where df = n1*(1+ratio) - 2. We approximate t critical via z*(1 + 1/(4*df)).
  for (let i = 0; i < 30; i++) {
    const n1Int = Math.ceil(n1);
    const df = Math.max(1, n1Int * (1 + ratio) - 2);
    const adj = 1 + 1 / (4 * df);
    const tA = za * adj;
    const tB = zb * adj;
    const next = (factor * (tA + tB) ** 2) / (d * d);
    if (Math.abs(next - n1) < 1e-4) {
      n1 = next;
      break;
    }
    n1 = next;
  }

  const n1Final = Math.ceil(n1);
  const n2Final = Math.ceil(n1Final * ratio);
  return {
    n: n1Final,
    nTotal: n1Final + n2Final,
    formula: "n_1 = (1 + 1/k)·(z_{α/2} + z_β)² / d²,  с поправкой по t-df",
    details: {
      d,
      alpha,
      power,
      ratio,
      twoSided: twoSided ? "two-sided" : "one-sided",
      n1: n1Final,
      n2: n2Final,
    },
  };
}

/** Power achieved with given n per group (n2 = n*ratio). */
export function tTestPower(
  d: number,
  n1: number,
  alpha: number,
  twoSided = true,
  ratio = 1,
): number {
  if (n1 < 2) return 0;
  const za = zAlpha(alpha, twoSided);
  const df = Math.max(1, n1 * (1 + ratio) - 2);
  const adj = 1 + 1 / (4 * df);
  const ncp = Math.abs(d) * Math.sqrt(n1 / (1 + 1 / ratio));
  return 1 - pnorm(za * adj - ncp);
}

/* ───────────────────────── Pearson correlation ───────────────────────── */

/**
 * n for testing H0: ρ = 0 using Fisher's z transform.
 * z' = 0.5 * ln((1+r)/(1-r)),  SE = 1/sqrt(n-3)
 * n = ((z_α/2 + z_β) / z')² + 3
 */
export function corrN(input: CorrInput): SampleSizeResult {
  const { r, alpha, power } = input;
  const twoSided = input.twoSided ?? true;
  if (Math.abs(r) >= 1 || r === 0) {
    return {
      n: Infinity,
      nTotal: Infinity,
      formula: "n = ((z_{α/2} + z_β) / z')² + 3",
      details: { r, alpha, power, note: "|r| must be in (0,1)" },
    };
  }
  const zr = 0.5 * Math.log((1 + r) / (1 - r));
  const za = zAlpha(alpha, twoSided);
  const zb = zPower(power);
  const n = Math.ceil(((za + zb) / zr) ** 2 + 3);
  return {
    n,
    nTotal: n,
    formula: "n = ((z_{α/2} + z_β) / z'_r)² + 3,  z'_r = ½·ln((1+r)/(1-r))",
    details: {
      r,
      "z'": Number(zr.toFixed(4)),
      alpha,
      power,
      twoSided: twoSided ? "two-sided" : "one-sided",
    },
  };
}

export function corrPower(r: number, n: number, alpha: number, twoSided = true): number {
  if (n <= 3 || Math.abs(r) >= 1) return 0;
  const zr = 0.5 * Math.log((1 + r) / (1 - r));
  const se = 1 / Math.sqrt(n - 3);
  const za = zAlpha(alpha, twoSided);
  return 1 - pnorm(za - Math.abs(zr) / se);
}

/* ───────────────────────── Chi-square ───────────────────────── */

/**
 * n for χ² test (Cohen's w as effect size). λ = n·w².
 * Solves chiSqPower(df, n·w², α) = power by bisection.
 */
export function chiSqN(input: ChiSqInput): SampleSizeResult {
  const { w, df, alpha, power } = input;
  if (w <= 0 || df < 1) {
    return {
      n: Infinity,
      nTotal: Infinity,
      formula: "λ = n·w²",
      details: { w, df, alpha, power, note: "w>0 and df>=1 required" },
    };
  }
  let lo = 4;
  let hi = 100000;
  let n = hi;
  for (let i = 0; i < 60; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const p = chiSqPower(df, mid * w * w, alpha);
    if (p >= power) {
      n = mid;
      hi = mid;
    } else {
      lo = mid + 1;
    }
    if (lo >= hi) break;
  }
  return {
    n,
    nTotal: n,
    formula: "λ = n·w²;  ищем минимальное n при котором мощность ≥ 1-β",
    details: { w, df, alpha, power },
  };
}

export function chiSqPowerAt(w: number, df: number, n: number, alpha: number): number {
  return chiSqPower(df, n * w * w, alpha);
}

/* ───────────────────────── Proportions ───────────────────────── */

/**
 * Two-proportion z-test (equal n per group):
 *   n = (z_α/2·√(2·p̄·q̄) + z_β·√(p1q1+p2q2))² / (p1-p2)²
 * One-proportion (vs p0=p2 or 0.5):
 *   n = (z_α/2·√(p0·q0) + z_β·√(p1·q1))² / (p1-p0)²
 */
export function propN(input: PropInput): SampleSizeResult {
  const { p1, alpha, power } = input;
  const twoSided = input.twoSided ?? true;
  const za = zAlpha(alpha, twoSided);
  const zb = zPower(power);

  if (input.p2 === undefined) {
    const p0 = 0.5;
    if (p1 === p0) {
      return {
        n: Infinity,
        nTotal: Infinity,
        formula: "одна пропорция: n = (z_{α/2}·√(p₀q₀) + z_β·√(p₁q₁))² / (p₁-p₀)²",
        details: { p1, p0, alpha, power },
      };
    }
    const num =
      za * Math.sqrt(p0 * (1 - p0)) + zb * Math.sqrt(p1 * (1 - p1));
    const n = Math.ceil((num * num) / (p1 - p0) ** 2);
    return {
      n,
      nTotal: n,
      formula: "n = (z_{α/2}·√(p₀q₀) + z_β·√(p₁q₁))² / (p₁-p₀)²",
      details: { p1, p0, alpha, power, twoSided: twoSided ? "two-sided" : "one-sided" },
    };
  }

  const p2 = input.p2;
  if (p1 === p2) {
    return {
      n: Infinity,
      nTotal: Infinity,
      formula: "две пропорции: формула Cohen 6.4.1",
      details: { p1, p2, alpha, power },
    };
  }
  const pBar = (p1 + p2) / 2;
  const term1 = za * Math.sqrt(2 * pBar * (1 - pBar));
  const term2 = zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
  const n = Math.ceil(((term1 + term2) ** 2) / (p1 - p2) ** 2);
  return {
    n,
    nTotal: 2 * n,
    formula: "n = (z_{α/2}·√(2p̄q̄) + z_β·√(p₁q₁+p₂q₂))² / (p₁-p₂)²",
    details: {
      p1,
      p2,
      pBar: Number(pBar.toFixed(4)),
      alpha,
      power,
      twoSided: twoSided ? "two-sided" : "one-sided",
    },
  };
}

export function propPower(p1: number, p2: number, n: number, alpha: number, twoSided = true): number {
  if (n < 2 || p1 === p2) return 0;
  const za = zAlpha(alpha, twoSided);
  const pBar = (p1 + p2) / 2;
  const seNull = Math.sqrt(2 * pBar * (1 - pBar) / n);
  const seAlt = Math.sqrt((p1 * (1 - p1) + p2 * (1 - p2)) / n);
  const z = (Math.abs(p1 - p2) - za * seNull) / seAlt;
  return pnorm(z);
}

/* ───────────────────────── ANOVA one-way ───────────────────────── */

/**
 * One-way ANOVA, Cohen's f. df1 = k-1, df2 = N-k.
 * Noncentrality λ = N·f². Bisect on N.
 */
export function anovaN(input: AnovaInput): SampleSizeResult {
  const { f, k, alpha, power } = input;
  if (f <= 0 || k < 2) {
    return {
      n: Infinity,
      nTotal: Infinity,
      formula: "λ = N·f²,  df₁ = k-1",
      details: { f, k, alpha, power, note: "f>0 and k>=2 required" },
    };
  }
  const df1 = k - 1;

  let lo = k * 2;
  let hi = 200000;
  let nTotal = hi;
  for (let i = 0; i < 60; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const lambda = mid * f * f;
    // Approximate F-test power via χ² with df1 (asymptotically equivalent for large df2)
    const p = chiSqPower(df1, lambda, alpha);
    if (p >= power) {
      nTotal = mid;
      hi = mid;
    } else {
      lo = mid + 1;
    }
    if (lo >= hi) break;
  }
  const perGroup = Math.ceil(nTotal / k);
  const adjusted = perGroup * k;
  return {
    n: perGroup,
    nTotal: adjusted,
    formula: "λ = N·f²,  N = k·n,  ищем минимальное N при мощности ≥ 1-β",
    details: { f, k, alpha, power, perGroup, total: adjusted },
  };
}

export function anovaPowerAt(f: number, k: number, nTotal: number, alpha: number): number {
  return chiSqPower(k - 1, nTotal * f * f, alpha);
}
