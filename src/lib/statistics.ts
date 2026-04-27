/**
 * ============================================================================
 *  STATISTICS LIBRARY  —  audited & hardened
 *  ----------------------------------------------------------------------
 *  Conventions
 *  ─────────────────────────────────────────────────────────────────────
 *  - "sample*" functions divide by (n-1), Bessel's correction.
 *  - "population*" functions divide by n.
 *  - All inferential helpers return a discriminated union:
 *      { ok: true,  ...stats }  |  { ok: false, reason: string }
 *    so callers can render a meaningful diagnostic instead of NaN.
 *  - All inputs are validated for emptiness, NaN, ±Infinity.
 *
 *  Backward-compat
 *  ─────────────────────────────────────────────────────────────────────
 *  Legacy exports (`mean`, `variance`, `standardDeviation`, `standardError`,
 *  `confidenceInterval`, `histogram`, `normalPDF`, `generateNormalCurve`,
 *  `tStatistic`, `approximatePValue`, `skewness`, `kurtosis`,
 *  `generateSample`) keep their original signatures and behaviour so all
 *  existing lab components continue to work unchanged.
 * ============================================================================
 */

/* ---------------------------------------------------------------------------
 *  TYPES
 * ------------------------------------------------------------------------- */

export type StatResult<T> =
  | ({ ok: true; reason?: undefined } & T)
  | { ok: false; reason: string };

export interface TTestResult {
  t: number;
  df: number;
  /** Two-tailed p-value (approximation, normal for df>=30, Student CDF series otherwise). */
  p: number;
  meanDiff: number;
  se: number;
  /** Welch=true ⇒ Welch–Satterthwaite df, otherwise pooled df = n1+n2-2. */
  welch: boolean;
}

export interface ChiSquareResult {
  chi2: number;
  df: number;
  p: number;
  expected: number[][];
  /** True iff any expected frequency < 5 (Cochran's rule violated). */
  lowExpectedWarning: boolean;
  cramersV: number;
}

export interface PearsonResult {
  r: number;
  /** r² — coefficient of determination. */
  r2: number;
  n: number;
  t: number;
  df: number;
  p: number;
}

export interface RegressionResult {
  /** β1, slope. */
  slope: number;
  /** β0, intercept. */
  intercept: number;
  r2: number;
  /** Residual sum of squares. */
  ssRes: number;
  /** Total sum of squares. */
  ssTot: number;
  n: number;
}

export interface CohenDResult {
  d: number;
  sdPooled: number;
  /** Qualitative bucket per Cohen (1988). */
  magnitude: 'negligible' | 'small' | 'medium' | 'large' | 'very-large';
}

export interface AnovaResult {
  F: number;
  df1: number; // k-1
  df2: number; // N-k
  ssBetween: number;
  ssWithin: number;
  ssTotal: number;
  msBetween: number;
  msWithin: number;
  etaSquared: number;
  p: number;
}

/* ---------------------------------------------------------------------------
 *  GUARDS
 * ------------------------------------------------------------------------- */

const isFiniteNumber = (x: unknown): x is number =>
  typeof x === 'number' && Number.isFinite(x);

/** Returns `null` if the array is empty or contains a non-finite value. */
const cleanArray = (arr: readonly number[]): number[] | null => {
  if (!arr || arr.length === 0) return null;
  for (const v of arr) if (!isFiniteNumber(v)) return null;
  return arr.slice();
};

/* ---------------------------------------------------------------------------
 *  CORE DESCRIPTIVE
 * ------------------------------------------------------------------------- */

/** Arithmetic mean. Returns 0 for empty input (legacy behaviour). */
export const mean = (arr: number[]): number => {
  if (!arr || arr.length === 0) return 0;
  let s = 0;
  for (const v of arr) s += v;
  return s / arr.length;
};

const sumSquaredDeviations = (arr: number[]): number => {
  const m = mean(arr);
  let s = 0;
  for (const v of arr) {
    const d = v - m;
    s += d * d;
  }
  return s;
};

/** Sample variance, divisor (n-1). Requires n ≥ 2. */
export const sampleVariance = (arr: number[]): number => {
  if (!arr || arr.length < 2) return 0;
  return sumSquaredDeviations(arr) / (arr.length - 1);
};

/** Population variance, divisor n. Requires n ≥ 1. */
export const populationVariance = (arr: number[]): number => {
  if (!arr || arr.length === 0) return 0;
  return sumSquaredDeviations(arr) / arr.length;
};

export const sampleSd = (arr: number[]): number => Math.sqrt(sampleVariance(arr));
export const populationSd = (arr: number[]): number => Math.sqrt(populationVariance(arr));

/**
 * Standard error of the mean: SE = s / √n  (uses SAMPLE sd).
 * Note: NEVER s / n — that is a common bug we explicitly guard against.
 */
export const seMean = (arr: number[]): number => {
  if (!arr || arr.length === 0) return 0;
  return sampleSd(arr) / Math.sqrt(arr.length);
};

/* ---------------------------------------------------------------------------
 *  LEGACY DESCRIPTIVE WRAPPERS (kept for existing labs)
 * ------------------------------------------------------------------------- */

/** @deprecated Use `sampleVariance` / `populationVariance`. */
export const variance = (arr: number[], sample = true): number =>
  sample ? sampleVariance(arr) : populationVariance(arr);

/** @deprecated Use `sampleSd` / `populationSd`. */
export const standardDeviation = (arr: number[], sample = true): number =>
  sample ? sampleSd(arr) : populationSd(arr);

/** @deprecated Use `seMean`. Alias kept for back-compat. */
export const standardError = (arr: number[]): number => seMean(arr);

/* ---------------------------------------------------------------------------
 *  DISTRIBUTIONS — random sampling (legacy)
 * ------------------------------------------------------------------------- */

const boxMuller = (): number => {
  const u1 = Math.max(Math.random(), 1e-12);
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

export const generateSample = (
  distribution: 'uniform' | 'normal' | 'exponential' | 'bimodal',
  size: number
): number[] => {
  const samples: number[] = [];
  for (let i = 0; i < size; i++) {
    switch (distribution) {
      case 'uniform':
        samples.push(Math.random() * 10);
        break;
      case 'normal':
        samples.push(5 + boxMuller() * 1.5);
        break;
      case 'exponential':
        samples.push(-Math.log(Math.max(Math.random(), 1e-12)) * 2);
        break;
      case 'bimodal':
        samples.push(Math.random() < 0.5 ? 3 + boxMuller() * 0.8 : 7 + boxMuller() * 0.8);
        break;
    }
  }
  return samples;
};

/* ---------------------------------------------------------------------------
 *  CDFs and p-value helpers
 * ------------------------------------------------------------------------- */

/** Standard normal CDF via Abramowitz & Stegun 26.2.17 approximation. */
const normalCdf = (z: number): number => {
  if (!Number.isFinite(z)) return z > 0 ? 1 : 0;
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + p * x);
  const erf =
    1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
};

/** Two-tailed normal p-value. */
export const approximatePValue = (t: number): number => {
  if (!Number.isFinite(t)) return 1;
  return 2 * (1 - normalCdf(Math.abs(t)));
};

/**
 * Two-tailed p-value for Student's t with df.
 * Uses the regularised incomplete beta function via Lentz's continued fraction.
 * Falls back to the normal approximation for df ≥ 200.
 */
export const tDistTwoTailedP = (t: number, df: number): number => {
  if (!Number.isFinite(t) || !Number.isFinite(df) || df <= 0) return 1;
  if (df >= 200) return approximatePValue(t);
  const x = df / (df + t * t);
  const p = incompleteBeta(x, df / 2, 0.5);
  return Math.min(1, Math.max(0, p));
};

/** Two-tailed p-value for χ² with df via the regularised gamma Q(df/2, x/2). */
export const chiSquareP = (chi2: number, df: number): number => {
  if (!Number.isFinite(chi2) || chi2 < 0 || df <= 0) return 1;
  return Math.min(1, Math.max(0, gammaQ(df / 2, chi2 / 2)));
};

/** One-tailed (upper) p-value for F(df1, df2). */
export const fDistUpperP = (F: number, df1: number, df2: number): number => {
  if (!Number.isFinite(F) || F <= 0 || df1 <= 0 || df2 <= 0) return 1;
  const x = df2 / (df2 + df1 * F);
  return Math.min(1, Math.max(0, incompleteBeta(x, df2 / 2, df1 / 2)));
};

/* ---------- Special functions ---------- */

const logGamma = (x: number): number => {
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += c[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
};

/** Regularised incomplete beta I_x(a, b). */
const incompleteBeta = (x: number, a: number, b: number): number => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) +
    a * Math.log(x) + b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) {
    return bt * betacf(x, a, b) / a;
  }
  return 1 - bt * betacf(1 - x, b, a) / b;
};

const betacf = (x: number, a: number, b: number): number => {
  const MAX_ITER = 200;
  const EPS = 3e-7;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAX_ITER; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
};

/** Regularised upper incomplete gamma Q(a, x). */
const gammaQ = (a: number, x: number): number => {
  if (x < 0 || a <= 0) return 1;
  if (x === 0) return 1;
  if (x < a + 1) return 1 - gammaSeries(a, x);
  return gammaContinuedFraction(a, x);
};

const gammaSeries = (a: number, x: number): number => {
  const MAX_ITER = 200, EPS = 3e-7;
  let ap = a;
  let sum = 1 / a;
  let del = sum;
  for (let n = 0; n < MAX_ITER; n++) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * EPS) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
};

const gammaContinuedFraction = (a: number, x: number): number => {
  const MAX_ITER = 200, EPS = 3e-7;
  let b = x + 1 - a;
  let c = 1 / 1e-30;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= MAX_ITER; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h * Math.exp(-x + a * Math.log(x) - logGamma(a));
};

/* ---------------------------------------------------------------------------
 *  T-TESTS
 * ------------------------------------------------------------------------- */

/** @deprecated Legacy thin t-statistic. Prefer `oneSampleT`. */
export const tStatistic = (
  sampleMean: number,
  populationMean: number,
  se: number
): number => (se === 0 ? 0 : (sampleMean - populationMean) / se);

/** One-sample t-test against a hypothesised μ₀. */
export const oneSampleT = (
  sample: number[],
  mu0: number
): StatResult<TTestResult> => {
  const arr = cleanArray(sample);
  if (!arr) return { ok: false, reason: 'Пустая выборка или нечисловые значения' };
  if (arr.length < 2) return { ok: false, reason: 'Нужно n ≥ 2' };
  if (!isFiniteNumber(mu0)) return { ok: false, reason: 'μ₀ должно быть числом' };

  const m = mean(arr);
  const s = sampleSd(arr);
  if (s === 0) return { ok: false, reason: 'Все значения одинаковы (SD = 0)' };

  const se = s / Math.sqrt(arr.length);
  const t = (m - mu0) / se;
  const df = arr.length - 1;
  return { ok: true, t, df, p: tDistTwoTailedP(t, df), meanDiff: m - mu0, se, welch: false };
};

/** Paired (dependent-samples) t-test. */
export const pairedT = (
  group1: number[],
  group2: number[]
): StatResult<TTestResult> => {
  const a = cleanArray(group1);
  const b = cleanArray(group2);
  if (!a || !b) return { ok: false, reason: 'Пустые/нечисловые данные' };
  if (a.length !== b.length) return { ok: false, reason: 'Парные выборки должны быть одинаковой длины' };
  if (a.length < 2) return { ok: false, reason: 'Нужно n ≥ 2 пар' };

  const diffs = a.map((v, i) => v - b[i]);
  const md = mean(diffs);
  const sd = sampleSd(diffs);
  if (sd === 0) return { ok: false, reason: 'Все разности равны (SD = 0)' };

  const se = sd / Math.sqrt(diffs.length);
  const t = md / se;
  const df = diffs.length - 1;
  return { ok: true, t, df, p: tDistTwoTailedP(t, df), meanDiff: md, se, welch: false };
};

/**
 * Independent two-sample t-test.
 * Default = Welch (does NOT assume equal variances).
 * Pass `equalVariances: true` for the classical pooled (Student) version.
 */
export const independentT = (
  group1: number[],
  group2: number[],
  options: { equalVariances?: boolean } = {}
): StatResult<TTestResult> => {
  const a = cleanArray(group1);
  const b = cleanArray(group2);
  if (!a || !b) return { ok: false, reason: 'Пустые/нечисловые данные' };
  if (a.length < 2 || b.length < 2) return { ok: false, reason: 'Каждая группа должна иметь n ≥ 2' };

  const n1 = a.length, n2 = b.length;
  const m1 = mean(a), m2 = mean(b);
  const v1 = sampleVariance(a), v2 = sampleVariance(b);
  const meanDiff = m1 - m2;

  if (options.equalVariances) {
    // Student pooled
    const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
    if (sp2 === 0) return { ok: false, reason: 'Объединённая дисперсия = 0' };
    const se = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
    const t = meanDiff / se;
    const df = n1 + n2 - 2;
    return { ok: true, t, df, p: tDistTwoTailedP(t, df), meanDiff, se, welch: false };
  }

  // Welch (default) — does NOT assume equal variances
  const se2 = v1 / n1 + v2 / n2;
  if (se2 === 0) return { ok: false, reason: 'Дисперсии обеих групп = 0' };
  const se = Math.sqrt(se2);
  const t = meanDiff / se;
  // Welch–Satterthwaite df
  const num = se2 * se2;
  const den = (v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1);
  const df = den === 0 ? n1 + n2 - 2 : num / den;
  return { ok: true, t, df, p: tDistTwoTailedP(t, df), meanDiff, se, welch: true };
};

/* ---------------------------------------------------------------------------
 *  CHI-SQUARE TEST OF INDEPENDENCE
 * ------------------------------------------------------------------------- */

export const chiSquareTest = (observed: number[][]): StatResult<ChiSquareResult> => {
  if (!observed || observed.length < 2) return { ok: false, reason: 'Нужно ≥ 2 строки' };
  const cols = observed[0]?.length ?? 0;
  if (cols < 2) return { ok: false, reason: 'Нужно ≥ 2 столбца' };
  for (const row of observed) {
    if (row.length !== cols) return { ok: false, reason: 'Строки должны быть одинаковой длины' };
    for (const v of row) {
      if (!isFiniteNumber(v) || v < 0) return { ok: false, reason: 'Частоты должны быть неотрицательными числами' };
    }
  }
  const rows = observed.length;
  const rowTotals = observed.map(r => r.reduce((s, v) => s + v, 0));
  const colTotals = Array.from({ length: cols }, (_, c) => observed.reduce((s, r) => s + r[c], 0));
  const total = rowTotals.reduce((s, v) => s + v, 0);
  if (total === 0) return { ok: false, reason: 'Сумма частот = 0' };

  const expected = observed.map((_, r) =>
    Array.from({ length: cols }, (_, c) => (rowTotals[r] * colTotals[c]) / total)
  );

  let chi2 = 0;
  let lowExpected = false;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const e = expected[r][c];
      if (e < 5) lowExpected = true;
      if (e > 0) {
        const o = observed[r][c];
        chi2 += (o - e) * (o - e) / e;
      }
    }
  }

  const df = (rows - 1) * (cols - 1);
  const p = chiSquareP(chi2, df);
  const minDim = Math.min(rows, cols);
  const cramersV = minDim > 1 ? Math.sqrt(chi2 / (total * (minDim - 1))) : 0;

  return {
    ok: true,
    chi2,
    df,
    p,
    expected,
    lowExpectedWarning: lowExpected,
    cramersV,
  };
};

/* ---------------------------------------------------------------------------
 *  PEARSON CORRELATION
 * ------------------------------------------------------------------------- */

export const pearsonCorrelation = (
  xs: number[],
  ys: number[]
): StatResult<PearsonResult> => {
  const a = cleanArray(xs);
  const b = cleanArray(ys);
  if (!a || !b) return { ok: false, reason: 'Пустые/нечисловые данные' };
  if (a.length !== b.length) return { ok: false, reason: 'x и y должны быть одинаковой длины' };
  if (a.length < 3) return { ok: false, reason: 'Нужно n ≥ 3' };

  const mx = mean(a), my = mean(b);
  let sxx = 0, syy = 0, sxy = 0;
  for (let i = 0; i < a.length; i++) {
    const dx = a[i] - mx, dy = b[i] - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  if (sxx === 0 || syy === 0) {
    return { ok: false, reason: 'σ = 0 — корреляция не определена (одна из переменных константа)' };
  }

  const r = sxy / Math.sqrt(sxx * syy);
  const n = a.length;
  const df = n - 2;
  const t = r * Math.sqrt(df / Math.max(1 - r * r, 1e-12));
  return { ok: true, r, r2: r * r, n, t, df, p: tDistTwoTailedP(t, df) };
};

/* ---------------------------------------------------------------------------
 *  LINEAR REGRESSION
 * ------------------------------------------------------------------------- */

export const linearRegression = (
  xs: number[],
  ys: number[]
): StatResult<RegressionResult> => {
  const a = cleanArray(xs);
  const b = cleanArray(ys);
  if (!a || !b) return { ok: false, reason: 'Пустые/нечисловые данные' };
  if (a.length !== b.length) return { ok: false, reason: 'x и y должны быть одинаковой длины' };
  if (a.length < 2) return { ok: false, reason: 'Нужно n ≥ 2' };

  const mx = mean(a), my = mean(b);
  let sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < a.length; i++) {
    const dx = a[i] - mx, dy = b[i] - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  if (sxx === 0) return { ok: false, reason: 'Все значения x равны — наклон не определён' };

  // β1 = cov(x,y) / var(x), β0 = ȳ - β1·x̄
  const slope = sxy / sxx;
  const intercept = my - slope * mx;

  // SS_res = Σ(y - ŷ)², SS_tot = Σ(y - ȳ)²
  let ssRes = 0;
  for (let i = 0; i < a.length; i++) {
    const yhat = intercept + slope * a[i];
    const e = b[i] - yhat;
    ssRes += e * e;
  }
  const ssTot = syy;
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { ok: true, slope, intercept, r2, ssRes, ssTot, n: a.length };
};

/* ---------------------------------------------------------------------------
 *  COHEN'S d
 * ------------------------------------------------------------------------- */

const cohenMagnitude = (absD: number): CohenDResult['magnitude'] => {
  if (absD < 0.2) return 'negligible';
  if (absD < 0.5) return 'small';
  if (absD < 0.8) return 'medium';
  if (absD < 1.2) return 'large';
  return 'very-large';
};

/** Cohen's d for two independent groups using POOLED sample SD. */
export const cohensD = (
  group1: number[],
  group2: number[]
): StatResult<CohenDResult> => {
  const a = cleanArray(group1);
  const b = cleanArray(group2);
  if (!a || !b) return { ok: false, reason: 'Пустые/нечисловые данные' };
  if (a.length < 2 || b.length < 2) return { ok: false, reason: 'Каждая группа должна иметь n ≥ 2' };

  const n1 = a.length, n2 = b.length;
  const m1 = mean(a), m2 = mean(b);
  const v1 = sampleVariance(a), v2 = sampleVariance(b);

  // SD_pooled = √( ((n1-1)s1² + (n2-1)s2²) / (n1+n2-2) )
  const sdPooled = Math.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2));
  if (sdPooled === 0) return { ok: false, reason: 'SD_pooled = 0 — данные без разброса' };

  const d = (m1 - m2) / sdPooled;
  return { ok: true, d, sdPooled, magnitude: cohenMagnitude(Math.abs(d)) };
};

/* ---------------------------------------------------------------------------
 *  ONE-WAY ANOVA
 * ------------------------------------------------------------------------- */

export const oneWayAnova = (groups: number[][]): StatResult<AnovaResult> => {
  if (!groups || groups.length < 2) return { ok: false, reason: 'Нужно ≥ 2 групп' };
  const cleaned: number[][] = [];
  for (const g of groups) {
    const c = cleanArray(g);
    if (!c) return { ok: false, reason: 'Группа содержит пустые/нечисловые значения' };
    if (c.length < 2) return { ok: false, reason: 'Каждая группа должна иметь n ≥ 2' };
    cleaned.push(c);
  }

  const k = cleaned.length;
  const N = cleaned.reduce((s, g) => s + g.length, 0);
  const grandMean = cleaned.flat().reduce((s, v) => s + v, 0) / N;

  let ssBetween = 0;
  let ssWithin = 0;
  for (const g of cleaned) {
    const m = mean(g);
    ssBetween += g.length * (m - grandMean) ** 2;
    for (const v of g) ssWithin += (v - m) ** 2;
  }
  const ssTotal = ssBetween + ssWithin;
  const df1 = k - 1;
  const df2 = N - k;
  if (df2 <= 0) return { ok: false, reason: 'df_within ≤ 0 — слишком мало наблюдений' };

  const msBetween = ssBetween / df1;
  const msWithin = ssWithin / df2;
  if (msWithin === 0) return { ok: false, reason: 'MS_within = 0 — нет внутригрупповой вариативности' };

  const F = msBetween / msWithin;
  const etaSquared = ssTotal === 0 ? 0 : ssBetween / ssTotal;
  const p = fDistUpperP(F, df1, df2);

  return { ok: true, F, df1, df2, ssBetween, ssWithin, ssTotal, msBetween, msWithin, etaSquared, p };
};

/* ---------------------------------------------------------------------------
 *  CONFIDENCE INTERVAL  (legacy API preserved)
 * ------------------------------------------------------------------------- */

export const confidenceInterval = (
  arr: number[],
  confidenceLevel: number = 0.95
): { lower: number; upper: number; mean: number; margin: number } => {
  const m = mean(arr);
  const se = seMean(arr);
  const zScores: Record<number, number> = { 0.90: 1.645, 0.95: 1.96, 0.99: 2.576 };
  const z = zScores[confidenceLevel] || 1.96;
  const margin = z * se;
  return { mean: m, lower: m - margin, upper: m + margin, margin };
};

/* ---------------------------------------------------------------------------
 *  HISTOGRAM, NORMAL PDF, MOMENTS — legacy
 * ------------------------------------------------------------------------- */

export const histogram = (
  data: number[],
  bins: number = 20
): { binStart: number; binEnd: number; count: number; frequency: number }[] => {
  if (!data || data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins || 1;
  const result = Array.from({ length: bins }, (_, i) => ({
    binStart: min + i * binWidth,
    binEnd: min + (i + 1) * binWidth,
    count: 0,
    frequency: 0,
  }));
  for (const value of data) {
    let idx = Math.floor((value - min) / binWidth);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    result[idx].count++;
  }
  for (const bin of result) bin.frequency = bin.count / data.length;
  return result;
};

export const normalPDF = (x: number, mu: number, sd: number): number => {
  if (sd <= 0) return 0;
  const c = 1 / (sd * Math.sqrt(2 * Math.PI));
  const e = -((x - mu) ** 2) / (2 * sd * sd);
  return c * Math.exp(e);
};

export const generateNormalCurve = (
  mu: number,
  sd: number,
  points: number = 100
): { x: number; y: number }[] => {
  const result: { x: number; y: number }[] = [];
  const start = mu - 4 * sd;
  const end = mu + 4 * sd;
  const step = (end - start) / points;
  for (let x = start; x <= end; x += step) {
    result.push({ x, y: normalPDF(x, mu, sd) });
  }
  return result;
};

export const skewness = (arr: number[]): number => {
  if (!arr || arr.length < 3) return 0;
  const m = mean(arr);
  const sd = populationSd(arr);
  if (sd === 0) return 0;
  const n = arr.length;
  let sum = 0;
  for (const v of arr) sum += ((v - m) / sd) ** 3;
  return (n / ((n - 1) * (n - 2))) * sum;
};

export const kurtosis = (arr: number[]): number => {
  if (!arr || arr.length < 4) return 0;
  const m = mean(arr);
  const sd = populationSd(arr);
  if (sd === 0) return 0;
  const n = arr.length;
  let sum = 0;
  for (const v of arr) sum += ((v - m) / sd) ** 4;
  const raw = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sum;
  const correction = (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
  return raw - correction;
};
