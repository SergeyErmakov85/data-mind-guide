// Standard normal CDF via Abramowitz & Stegun 26.2.17 approximation.
// Accuracy: |error| < 7.5e-8.
export function normalCDF(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.SQRT2;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return 0.5 * (1.0 + sign * y);
}

// Φ(z) — alias.
export const Phi = normalCDF;

// PDF of N(μ, σ²)
export function normalPDF(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

// CDF of N(μ, σ²)
export function normalCDFGeneral(x: number, mu: number, sigma: number): number {
  return normalCDF((x - mu) / sigma);
}

// P(a ≤ X ≤ b) for N(μ, σ²)
export function normalIntervalProb(a: number, b: number, mu: number, sigma: number): number {
  return normalCDFGeneral(b, mu, sigma) - normalCDFGeneral(a, mu, sigma);
}

// z-score
export function zScore(x: number, mu: number, sigma: number): number {
  return (x - mu) / sigma;
}
