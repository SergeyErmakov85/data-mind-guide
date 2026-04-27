/**
 * Линейная/множественная регрессия с диагностикой.
 * Без сторонних библиотек: матричные операции реализованы вручную.
 */

import { normalCDF, qnorm } from './distributions';

export type Matrix = number[][];

// ============ Матричные операции ============

export const transpose = (A: Matrix): Matrix => {
  const m = A.length;
  const n = A[0].length;
  const T: Matrix = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) T[j][i] = A[i][j];
  return T;
};

export const matmul = (A: Matrix, B: Matrix): Matrix => {
  const m = A.length;
  const n = B[0].length;
  const k = B.length;
  const C: Matrix = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let l = 0; l < k; l++) {
      const a = A[i][l];
      if (a === 0) continue;
      for (let j = 0; j < n; j++) C[i][j] += a * B[l][j];
    }
  }
  return C;
};

export const matvec = (A: Matrix, v: number[]): number[] => {
  const m = A.length;
  const n = v.length;
  const out = new Array(m).fill(0);
  for (let i = 0; i < m; i++) {
    let s = 0;
    for (let j = 0; j < n; j++) s += A[i][j] * v[j];
    out[i] = s;
  }
  return out;
};

/** Гаусс-Жордан инверсия p×p. Возвращает null при сингулярности. */
export const inverse = (A: Matrix): Matrix | null => {
  const n = A.length;
  const M: Matrix = A.map((row, i) => {
    const r = row.slice();
    const id = new Array(n).fill(0);
    id[i] = 1;
    return r.concat(id);
  });
  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivotRow][col])) pivotRow = r;
    }
    if (Math.abs(M[pivotRow][col]) < 1e-12) return null;
    [M[col], M[pivotRow]] = [M[pivotRow], M[col]];
    const pivot = M[col][col];
    for (let j = 0; j < 2 * n; j++) M[col][j] /= pivot;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      if (factor === 0) continue;
      for (let j = 0; j < 2 * n; j++) M[r][j] -= factor * M[col][j];
    }
  }
  return M.map((row) => row.slice(n));
};

// ============ Регрессия ============

export interface RegressionResult {
  /** Коэффициенты включая интерсепт: [β0, β1, ...] */
  coef: number[];
  /** SE для каждого коэффициента (классическая или HC3) */
  se: number[];
  /** t-статистики */
  tStat: number[];
  /** p-values (двусторонний, через нормальное приближение) */
  pValue: number[];
  rSquared: number;
  adjRSquared: number;
  fStat: number;
  fPValue: number;
  df1: number;
  df2: number;
  n: number;
  k: number; // число предикторов (без интерсепта)
  residuals: number[];
  fitted: number[];
  rmse: number;
  /** Cook's distance по наблюдениям */
  cooks: number[];
  /** Leverage h_ii */
  leverage: number[];
  /** SE-метод */
  seMethod: 'classical' | 'hc3';
}

/**
 * @param X матрица предикторов БЕЗ интерсепта (n × k)
 * @param y вектор отклика длины n
 * @param robust если true — HC3
 */
export function fitOLS(X: Matrix, y: number[], robust = false): RegressionResult | null {
  const n = y.length;
  const k = X[0].length;
  // Добавляем столбец единиц для интерсепта
  const Xd: Matrix = X.map((row) => [1, ...row]);
  const p = k + 1;

  const Xt = transpose(Xd);
  const XtX = matmul(Xt, Xd);
  const XtXi = inverse(XtX);
  if (!XtXi) return null;
  const Xty = matvec(Xt, y);
  const coef = matvec(XtXi, Xty);

  const fitted = matvec(Xd, coef);
  const residuals = y.map((v, i) => v - fitted[i]);
  const meanY = y.reduce((s, v) => s + v, 0) / n;
  const ssRes = residuals.reduce((s, r) => s + r * r, 0);
  const ssTot = y.reduce((s, v) => s + (v - meanY) ** 2, 0);
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  const dfRes = n - p;
  const dfReg = p - 1;
  const adjRSquared = dfRes > 0 ? 1 - ((1 - rSquared) * (n - 1)) / dfRes : 0;
  const sigma2 = ssRes / Math.max(dfRes, 1);
  const rmse = Math.sqrt(sigma2);

  // Leverage h_ii = диагональ X (X'X)^-1 X'
  const leverage = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const xi = Xd[i];
    let h = 0;
    for (let a = 0; a < p; a++) {
      let s = 0;
      for (let b = 0; b < p; b++) s += xi[b] * XtXi[b][a];
      h += s * xi[a];
    }
    leverage[i] = Math.min(Math.max(h, 0), 1);
  }

  // Ковариация коэффициентов
  let covBeta: Matrix;
  if (robust) {
    // HC3: (X'X)^-1 X' diag(e_i^2 / (1-h_ii)^2) X (X'X)^-1
    // Сначала формируем W * X (где W диагональна)
    const WX: Matrix = Xd.map((row, i) => {
      const denom = (1 - leverage[i]) ** 2;
      const w = denom > 1e-10 ? (residuals[i] ** 2) / denom : residuals[i] ** 2;
      return row.map((v) => v * w);
    });
    const XtWX = matmul(Xt, WX);
    covBeta = matmul(matmul(XtXi, XtWX), XtXi);
  } else {
    covBeta = XtXi.map((row) => row.map((v) => v * sigma2));
  }
  const se = covBeta.map((row, i) => Math.sqrt(Math.max(row[i], 0)));
  const tStat = coef.map((b, i) => (se[i] > 0 ? b / se[i] : 0));
  // Двусторонний p через нормальное приближение
  const pValue = tStat.map((t) => 2 * (1 - normalCDF(Math.abs(t))));

  // F-тест: ((SST - SSR) / dfReg) / (SSR / dfRes)
  const fStat = dfReg > 0 && ssRes > 0 ? ((ssTot - ssRes) / dfReg) / (ssRes / dfRes) : 0;
  // Грубая аппроксимация p_F через хи-квадрат (df1*F ~ chi2_df1) при больших df2
  const fPValue = approxFPValue(fStat, dfReg, dfRes);

  // Cook's distance: D_i = (e_i^2 / (p * sigma^2)) * (h_ii / (1-h_ii)^2)
  const cooks = residuals.map((e, i) => {
    const denom = (1 - leverage[i]) ** 2;
    if (denom < 1e-10 || sigma2 < 1e-12) return 0;
    return (e * e) / (p * sigma2) * (leverage[i] / denom);
  });

  return {
    coef,
    se,
    tStat,
    pValue,
    rSquared,
    adjRSquared,
    fStat,
    fPValue,
    df1: dfReg,
    df2: dfRes,
    n,
    k,
    residuals,
    fitted,
    rmse,
    cooks,
    leverage,
    seMethod: robust ? 'hc3' : 'classical',
  };
}

/** Грубое приближение p-value для F-распределения через нормальную аппроксимацию Wilson-Hilferty. */
function approxFPValue(F: number, df1: number, df2: number): number {
  if (F <= 0 || df1 <= 0 || df2 <= 0) return 1;
  // Преобразование Paulson/Wilson-Hilferty
  const a = 2 / (9 * df1);
  const b = 2 / (9 * df2);
  const num = (1 - b) * Math.pow(F, 1 / 3) - (1 - a);
  const den = Math.sqrt(b * Math.pow(F, 2 / 3) + a);
  if (den < 1e-12) return F > 1 ? 0 : 1;
  const z = num / den;
  return 1 - normalCDF(z);
}

// ============ Confidence band для простой регрессии ============

/**
 * 95% confidence band для среднего отклика ŷ(x*).
 * Возвращает массив { x, yHat, lower, upper } по сетке.
 */
export function confidenceBand(
  x: number[],
  y: number[],
  result: RegressionResult,
  gridSize = 80,
): { x: number; yHat: number; lower: number; upper: number }[] {
  if (result.k !== 1) return [];
  const n = x.length;
  const meanX = x.reduce((s, v) => s + v, 0) / n;
  const ssX = x.reduce((s, v) => s + (v - meanX) ** 2, 0);
  const sigma2 = (result.rmse) ** 2;
  const xMin = Math.min(...x);
  const xMax = Math.max(...x);
  const z = qnorm(0.975);
  const out: { x: number; yHat: number; lower: number; upper: number }[] = [];
  for (let i = 0; i < gridSize; i++) {
    const xi = xMin + ((xMax - xMin) * i) / (gridSize - 1);
    const yHat = result.coef[0] + result.coef[1] * xi;
    const seMean = Math.sqrt(sigma2 * (1 / n + ((xi - meanX) ** 2) / (ssX || 1)));
    const margin = z * seMean;
    out.push({ x: xi, yHat, lower: yHat - margin, upper: yHat + margin });
  }
  return out;
}

// ============ LOESS-light: скользящее среднее по окну ============

export function movingAverageSmooth(
  x: number[],
  y: number[],
  bandwidth = 0.3,
): { x: number; y: number }[] {
  const n = x.length;
  if (n === 0) return [];
  const indices = x.map((_, i) => i).sort((a, b) => x[a] - x[b]);
  const xs = indices.map((i) => x[i]);
  const ys = indices.map((i) => y[i]);
  const w = Math.max(3, Math.floor(bandwidth * n));
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - Math.floor(w / 2));
    const hi = Math.min(n, lo + w);
    let s = 0;
    for (let j = lo; j < hi; j++) s += ys[j];
    out.push({ x: xs[i], y: s / (hi - lo) });
  }
  return out;
}

// ============ Q-Q plot quantiles ============

export function qqPoints(residuals: number[]): { theoretical: number; sample: number }[] {
  const n = residuals.length;
  if (n === 0) return [];
  const sorted = residuals.slice().sort((a, b) => a - b);
  // Стандартизуем sample-квантили
  const mean = sorted.reduce((s, v) => s + v, 0) / n;
  const sd = Math.sqrt(sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(n - 1, 1));
  return sorted.map((v, i) => {
    const p = (i + 0.5) / n;
    return {
      theoretical: qnorm(p),
      sample: sd > 0 ? (v - mean) / sd : 0,
    };
  });
}
