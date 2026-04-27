/**
 * STATISTICS — known-good test cases
 * ----------------------------------
 * Эталонные значения сверены с Сидоренко Е.В. «Методы математической обработки
 * в психологии» (2003) и Наследов А.Д. «Математические методы психологического
 * исследования» (2004), а также с примерами из Navarro & Foxcroft.
 *
 * Используется dev-only панелью на /calculators?debug=1.
 * Это НЕ unit-tests — мы их рендерим, чтобы любой человек мог визуально
 * проверить корректность математики.
 */

import {
  sampleVariance, populationVariance, sampleSd, populationSd, seMean,
  oneSampleT, pairedT, independentT, chiSquareTest,
  pearsonCorrelation, linearRegression, cohensD, oneWayAnova,
} from './statistics';

export interface StatTestCase {
  id: string;
  group: 'descriptive' | 't-test' | 'chi-square' | 'correlation' | 'regression' | 'cohen' | 'anova' | 'edge';
  title: string;
  source: string;
  /** Возвращает массив пар [метка, фактическое, ожидаемое, допуск]. */
  run: () => Array<{ label: string; actual: number | string; expected: number | string; tol?: number }>;
}

const around = (a: number | string, b: number | string, tol = 0.01) => {
  if (typeof a !== 'number' || typeof b !== 'number') return a === b;
  return Math.abs(a - b) <= tol;
};

export const isCasePassing = (
  results: ReturnType<StatTestCase['run']>
): boolean => results.every(r => around(r.actual, r.expected, r.tol ?? 0.01));

export const STATS_TEST_CASES: StatTestCase[] = [
  /* ------------------------------------------------------------------ */
  /*  DESCRIPTIVE                                                        */
  /* ------------------------------------------------------------------ */
  {
    id: 'desc-classic',
    group: 'descriptive',
    title: 'Базовая выборка [2, 4, 4, 4, 5, 5, 7, 9]',
    source: 'M=5; Σ(x−M)²=32 ⇒ σ²=4, s²≈4.571, σ=2, s≈2.138, SE≈0.756',
    run: () => {
      const x = [2, 4, 4, 4, 5, 5, 7, 9];
      return [
        { label: 'sampleVariance (s²)', actual: round(sampleVariance(x), 3), expected: 4.571, tol: 0.005 },
        { label: 'populationVariance (σ²)', actual: round(populationVariance(x), 3), expected: 4 },
        { label: 'sampleSd (s)', actual: round(sampleSd(x), 3), expected: 2.138, tol: 0.005 },
        { label: 'populationSd (σ)', actual: round(populationSd(x), 3), expected: 2 },
        { label: 'SE = s/√n', actual: round(seMean(x), 3), expected: 0.756, tol: 0.005 },
      ];
    },
  },
  {
    id: 'desc-iq',
    group: 'descriptive',
    title: 'IQ-выборка [100,110,120,130,140]',
    source: 'M=120, s=15.811, SE=7.071',
    run: () => {
      const x = [100, 110, 120, 130, 140];
      return [
        { label: 'sampleSd', actual: round(sampleSd(x), 3), expected: 15.811, tol: 0.005 },
        { label: 'SE', actual: round(seMean(x), 3), expected: 7.071, tol: 0.005 },
      ];
    },
  },

  /* ------------------------------------------------------------------ */
  /*  T-TEST                                                             */
  /* ------------------------------------------------------------------ */
  {
    id: 'one-sample-t',
    group: 't-test',
    title: 'Одновыборочный t: [5,6,7,8,9] vs μ₀=5',
    source: 'M=7, s=1.581, SE=0.707, t=2.828, df=4',
    run: () => {
      const r = oneSampleT([5, 6, 7, 8, 9], 5);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 't', actual: round(r.t, 3), expected: 2.828, tol: 0.005 },
        { label: 'df', actual: r.df, expected: 4 },
        { label: 'p (two-tailed)', actual: round(r.p, 3), expected: 0.047, tol: 0.005 },
      ];
    },
  },
  {
    id: 'paired-t',
    group: 't-test',
    title: 'Парный t: до=[10,12,9,11,13], после=[8,10,7,10,11]',
    source: 'diff=[2,2,2,1,2], M_d=1.8, s_d=0.447, t=9.0, df=4',
    run: () => {
      const r = pairedT([10, 12, 9, 11, 13], [8, 10, 7, 10, 11]);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 'meanDiff', actual: round(r.meanDiff, 3), expected: 1.8 },
        { label: 't', actual: round(r.t, 2), expected: 9.0, tol: 0.05 },
        { label: 'df', actual: r.df, expected: 4 },
      ];
    },
  },
  {
    id: 'independent-t-student',
    group: 't-test',
    title: 'Независимый t (Student, equalVariances=true)',
    source: 'A=[1..5] M=3 s=1.581; B=[3..7] M=5 s=1.581; t=-2.0, df=8',
    run: () => {
      const r = independentT([1, 2, 3, 4, 5], [3, 4, 5, 6, 7], { equalVariances: true });
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 't', actual: round(r.t, 3), expected: -2.0, tol: 0.005 },
        { label: 'df', actual: r.df, expected: 8 },
        { label: 'welch flag', actual: String(r.welch), expected: 'false' },
      ];
    },
  },
  {
    id: 'independent-t-welch',
    group: 't-test',
    title: 'Независимый t (Welch, по умолчанию)',
    source: 'Те же выборки: t=-2.0; df_W ≈ 8 (равные дисперсии ⇒ совпадает со Student)',
    run: () => {
      const r = independentT([1, 2, 3, 4, 5], [3, 4, 5, 6, 7]);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 't', actual: round(r.t, 3), expected: -2.0, tol: 0.005 },
        { label: 'df_W', actual: round(r.df, 1), expected: 8.0, tol: 0.1 },
        { label: 'welch flag', actual: String(r.welch), expected: 'true' },
      ];
    },
  },
  {
    id: 'independent-t-welch-unequal',
    group: 't-test',
    title: 'Welch при неравных дисперсиях',
    source: 'A=[10,12,14,16,18] s²=10; B=[1,5,9,13,17] s²=40; meanDiff=5, SE=√10≈3.162, t≈1.581, df_W≈5.88',
    run: () => {
      const r = independentT([10, 12, 14, 16, 18], [1, 5, 9, 13, 17]);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 't', actual: round(r.t, 3), expected: 1.581, tol: 0.005 },
        { label: 'df_W', actual: round(r.df, 2), expected: 5.88, tol: 0.05 },
      ];
    },
  },

  /* ------------------------------------------------------------------ */
  /*  CHI-SQUARE                                                          */
  /* ------------------------------------------------------------------ */
  {
    id: 'chi2-2x2',
    group: 'chi-square',
    title: 'χ² таблица 2×2 [[20,30],[30,20]]',
    source: 'Сидоренко: χ²=4.0, df=1, p≈0.046, V=0.2',
    run: () => {
      const r = chiSquareTest([[20, 30], [30, 20]]);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 'χ²', actual: round(r.chi2, 3), expected: 4.0, tol: 0.01 },
        { label: 'df', actual: r.df, expected: 1 },
        { label: "Cramer's V", actual: round(r.cramersV, 3), expected: 0.2, tol: 0.005 },
        { label: 'lowExpected warning', actual: String(r.lowExpectedWarning), expected: 'false' },
      ];
    },
  },
  {
    id: 'chi2-low-expected',
    group: 'chi-square',
    title: 'χ² с малыми ожидаемыми частотами',
    source: '[[2,3],[4,1]] — ожидаемые < 5 ⇒ предупреждение',
    run: () => {
      const r = chiSquareTest([[2, 3], [4, 1]]);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 'lowExpected warning', actual: String(r.lowExpectedWarning), expected: 'true' },
        { label: 'df', actual: r.df, expected: 1 },
      ];
    },
  },

  /* ------------------------------------------------------------------ */
  /*  CORRELATION                                                         */
  /* ------------------------------------------------------------------ */
  {
    id: 'pearson-perfect',
    group: 'correlation',
    title: 'Идеальная корреляция: y = 2x',
    source: 'r=1.0, r²=1.0',
    run: () => {
      const r = pearsonCorrelation([1, 2, 3, 4, 5], [2, 4, 6, 8, 10]);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 'r', actual: round(r.r, 4), expected: 1.0, tol: 0.0001 },
        { label: 'r²', actual: round(r.r2, 4), expected: 1.0, tol: 0.0001 },
      ];
    },
  },
  {
    id: 'pearson-classic',
    group: 'correlation',
    title: 'Пример Наследова: x=[1,2,3,4,5], y=[2,5,4,5,8]',
    source: 'sxy=12, sxx=10, syy=18.8 ⇒ r=12/√188≈0.875',
    run: () => {
      const r = pearsonCorrelation([1, 2, 3, 4, 5], [2, 5, 4, 5, 8]);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 'r', actual: round(r.r, 3), expected: 0.875, tol: 0.005 },
        { label: 'df', actual: r.df, expected: 3 },
      ];
    },
  },
  {
    id: 'pearson-constant',
    group: 'correlation',
    title: 'σ=0: одна переменная константа',
    source: 'Должно вернуться ok=false с reason',
    run: () => {
      const r = pearsonCorrelation([1, 1, 1, 1, 1], [1, 2, 3, 4, 5]);
      return [
        { label: 'ok', actual: String(r.ok), expected: 'false' },
        { label: 'reason содержит "σ = 0"', actual: r.ok ? '' : (r.reason.includes('σ') ? 'yes' : 'no'), expected: 'yes' },
      ];
    },
  },

  /* ------------------------------------------------------------------ */
  /*  LINEAR REGRESSION                                                   */
  /* ------------------------------------------------------------------ */
  {
    id: 'reg-perfect',
    group: 'regression',
    title: 'Регрессия y = 2x + 1',
    source: 'slope=2, intercept=1, R²=1',
    run: () => {
      const r = linearRegression([1, 2, 3, 4, 5], [3, 5, 7, 9, 11]);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 'slope (β1)', actual: round(r.slope, 4), expected: 2.0 },
        { label: 'intercept (β0)', actual: round(r.intercept, 4), expected: 1.0 },
        { label: 'R²', actual: round(r.r2, 4), expected: 1.0 },
      ];
    },
  },
  {
    id: 'reg-noise',
    group: 'regression',
    title: 'Регрессия x=[1..5], y=[2,5,4,5,8]',
    source: 'sxy=12, sxx=10 ⇒ slope=1.2; intercept=ȳ−slope·x̄=4.8−3.6=1.2; R²=r²≈0.766',
    run: () => {
      const r = linearRegression([1, 2, 3, 4, 5], [2, 5, 4, 5, 8]);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 'slope', actual: round(r.slope, 3), expected: 1.2 },
        { label: 'intercept', actual: round(r.intercept, 3), expected: 1.2 },
        { label: 'R²', actual: round(r.r2, 3), expected: 0.766, tol: 0.005 },
      ];
    },
  },

  /* ------------------------------------------------------------------ */
  /*  COHEN'S D                                                          */
  /* ------------------------------------------------------------------ */
  {
    id: 'cohen-large',
    group: 'cohen',
    title: "d Коэна: A=[10..14], B=[14..18]",
    source: 's_pooled=1.581; d = (12-16)/1.581 ≈ -2.530',
    run: () => {
      const r = cohensD([10, 11, 12, 13, 14], [14, 15, 16, 17, 18]);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 'sdPooled', actual: round(r.sdPooled, 3), expected: 1.581, tol: 0.005 },
        { label: 'd', actual: round(r.d, 3), expected: -2.530, tol: 0.005 },
        { label: 'magnitude', actual: r.magnitude, expected: 'very-large' },
      ];
    },
  },
  {
    id: 'cohen-medium',
    group: 'cohen',
    title: "d Коэна средний эффект",
    source: 'Сдвиг на 1 при s_pooled≈1.764 ⇒ d≈-0.567 (диапазон Cohen «средний»)',
    run: () => {
      const a = [7, 8, 9, 10, 10, 10, 10, 11, 12, 13];
      const b = a.map(v => v + 1);
      const r = cohensD(a, b);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 'd', actual: round(r.d, 3), expected: -0.567, tol: 0.005 },
        { label: 'magnitude', actual: r.magnitude, expected: 'medium' },
      ];
    },
  },

  /* ------------------------------------------------------------------ */
  /*  ANOVA                                                              */
  /* ------------------------------------------------------------------ */
  {
    id: 'anova-classic',
    group: 'anova',
    title: 'ANOVA: 3 группы по 5 наблюдений',
    source: 'A=[1..5], B=[3..7], C=[5..9] ⇒ F=8.0, df=(2,12), η²≈0.571',
    run: () => {
      const r = oneWayAnova([
        [1, 2, 3, 4, 5],
        [3, 4, 5, 6, 7],
        [5, 6, 7, 8, 9],
      ]);
      if (!r.ok) return [{ label: 'error', actual: r.reason, expected: 'ok' }];
      return [
        { label: 'F', actual: round(r.F, 3), expected: 8.0, tol: 0.05 },
        { label: 'df1 (k-1)', actual: r.df1, expected: 2 },
        { label: 'df2 (N-k)', actual: r.df2, expected: 12 },
        { label: 'η²', actual: round(r.etaSquared, 3), expected: 0.571, tol: 0.005 },
      ];
    },
  },

  /* ------------------------------------------------------------------ */
  /*  EDGE CASES                                                          */
  /* ------------------------------------------------------------------ */
  {
    id: 'edge-empty',
    group: 'edge',
    title: 'Пустая выборка → reason',
    source: 'oneSampleT([], 0) ⇒ ok=false',
    run: () => {
      const r = oneSampleT([], 0);
      return [{ label: 'ok', actual: String(r.ok), expected: 'false' }];
    },
  },
  {
    id: 'edge-nan',
    group: 'edge',
    title: 'NaN во входе → reason',
    source: 'pairedT([1,NaN,3],[2,3,4]) ⇒ ok=false',
    run: () => {
      const r = pairedT([1, NaN, 3], [2, 3, 4]);
      return [{ label: 'ok', actual: String(r.ok), expected: 'false' }];
    },
  },
  {
    id: 'edge-infinity',
    group: 'edge',
    title: 'Infinity во входе → reason',
    source: 'cohensD([1,Infinity,3],[1,2,3]) ⇒ ok=false',
    run: () => {
      const r = cohensD([1, Infinity, 3], [1, 2, 3]);
      return [{ label: 'ok', actual: String(r.ok), expected: 'false' }];
    },
  },
  {
    id: 'edge-zero-sd',
    group: 'edge',
    title: 'Все значения одинаковы → SD=0 reason',
    source: 'oneSampleT([5,5,5,5], 5) ⇒ ok=false',
    run: () => {
      const r = oneSampleT([5, 5, 5, 5], 5);
      return [{ label: 'ok', actual: String(r.ok), expected: 'false' }];
    },
  },
  {
    id: 'edge-mismatched',
    group: 'edge',
    title: 'Парный t разной длины → reason',
    source: 'pairedT([1,2],[1,2,3]) ⇒ ok=false',
    run: () => {
      const r = pairedT([1, 2], [1, 2, 3]);
      return [{ label: 'ok', actual: String(r.ok), expected: 'false' }];
    },
  },
];

function round(n: number, digits = 3): number {
  if (!Number.isFinite(n)) return n;
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}
