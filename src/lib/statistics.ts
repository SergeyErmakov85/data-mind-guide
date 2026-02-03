// Statistical utility functions for labs

/**
 * Generate random samples from different distributions
 */
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
        // Box-Muller transform
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        samples.push(5 + z * 1.5); // mean=5, sd=1.5
        break;
      case 'exponential':
        samples.push(-Math.log(Math.random()) * 2); // lambda=0.5
        break;
      case 'bimodal':
        // Mixture of two normals
        if (Math.random() < 0.5) {
          const u1b = Math.random();
          const u2b = Math.random();
          const z1 = Math.sqrt(-2 * Math.log(u1b)) * Math.cos(2 * Math.PI * u2b);
          samples.push(3 + z1 * 0.8);
        } else {
          const u1b = Math.random();
          const u2b = Math.random();
          const z2 = Math.sqrt(-2 * Math.log(u1b)) * Math.cos(2 * Math.PI * u2b);
          samples.push(7 + z2 * 0.8);
        }
        break;
    }
  }
  
  return samples;
};

/**
 * Calculate mean of an array
 */
export const mean = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

/**
 * Calculate variance of an array
 */
export const variance = (arr: number[], sample = true): number => {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const squaredDiffs = arr.map(val => Math.pow(val - m, 2));
  const divisor = sample ? arr.length - 1 : arr.length;
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / divisor;
};

/**
 * Calculate standard deviation
 */
export const standardDeviation = (arr: number[], sample = true): number => {
  return Math.sqrt(variance(arr, sample));
};

/**
 * Calculate standard error of the mean
 */
export const standardError = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return standardDeviation(arr) / Math.sqrt(arr.length);
};

/**
 * Calculate confidence interval
 */
export const confidenceInterval = (
  arr: number[],
  confidenceLevel: number = 0.95
): { lower: number; upper: number; mean: number; margin: number } => {
  const m = mean(arr);
  const se = standardError(arr);
  
  // Z-score for common confidence levels
  const zScores: Record<number, number> = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };
  
  const z = zScores[confidenceLevel] || 1.96;
  const margin = z * se;
  
  return {
    mean: m,
    lower: m - margin,
    upper: m + margin,
    margin,
  };
};

/**
 * Calculate histogram bins
 */
export const histogram = (
  data: number[],
  bins: number = 20
): { binStart: number; binEnd: number; count: number; frequency: number }[] => {
  if (data.length === 0) return [];
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins || 1;
  
  const result = Array.from({ length: bins }, (_, i) => ({
    binStart: min + i * binWidth,
    binEnd: min + (i + 1) * binWidth,
    count: 0,
    frequency: 0,
  }));
  
  data.forEach(value => {
    let binIndex = Math.floor((value - min) / binWidth);
    if (binIndex >= bins) binIndex = bins - 1;
    if (binIndex < 0) binIndex = 0;
    result[binIndex].count++;
  });
  
  result.forEach(bin => {
    bin.frequency = bin.count / data.length;
  });
  
  return result;
};

/**
 * Normal PDF for visualization
 */
export const normalPDF = (x: number, mean: number, sd: number): number => {
  const coefficient = 1 / (sd * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(sd, 2));
  return coefficient * Math.exp(exponent);
};

/**
 * Generate normal curve data points
 */
export const generateNormalCurve = (
  mean: number,
  sd: number,
  points: number = 100
): { x: number; y: number }[] => {
  const result: { x: number; y: number }[] = [];
  const start = mean - 4 * sd;
  const end = mean + 4 * sd;
  const step = (end - start) / points;
  
  for (let x = start; x <= end; x += step) {
    result.push({ x, y: normalPDF(x, mean, sd) });
  }
  
  return result;
};

/**
 * Calculate t-statistic
 */
export const tStatistic = (
  sampleMean: number,
  populationMean: number,
  se: number
): number => {
  if (se === 0) return 0;
  return (sampleMean - populationMean) / se;
};

/**
 * Approximate p-value from t-statistic (two-tailed)
 * Using normal approximation for large samples
 */
export const approximatePValue = (t: number): number => {
  // Standard normal CDF approximation
  const x = Math.abs(t);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = t < 0 ? -1 : 1;
  const z = 1 / (1 + p * x);
  const y = 1 - (((((a5 * z + a4) * z) + a3) * z + a2) * z + a1) * z * Math.exp(-x * x / 2);
  
  const cdf = 0.5 * (1 + sign * y);
  return 2 * (1 - cdf); // Two-tailed
};

/**
 * Skewness calculation
 */
export const skewness = (arr: number[]): number => {
  if (arr.length < 3) return 0;
  const m = mean(arr);
  const sd = standardDeviation(arr, false);
  if (sd === 0) return 0;
  
  const n = arr.length;
  const sum = arr.reduce((acc, val) => acc + Math.pow((val - m) / sd, 3), 0);
  return (n / ((n - 1) * (n - 2))) * sum;
};

/**
 * Kurtosis calculation (excess kurtosis)
 */
export const kurtosis = (arr: number[]): number => {
  if (arr.length < 4) return 0;
  const m = mean(arr);
  const sd = standardDeviation(arr, false);
  if (sd === 0) return 0;
  
  const n = arr.length;
  const sum = arr.reduce((acc, val) => acc + Math.pow((val - m) / sd, 4), 0);
  const rawKurtosis = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sum;
  const correction = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
  return rawKurtosis - correction;
};
