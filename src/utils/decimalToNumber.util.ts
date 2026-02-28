// src/utils/decimalToNumber.util.ts
export function decimalToNumber(x: any): number {
  if (x == null) return 0;

  // Works for Decimal128, string, or number
  if (typeof x === 'object' && typeof x.toString === 'function') {
    const s = x.toString();
    const n = Number(s);
    return Number.isNaN(n) ? 0 : n;
  }

  const n = Number(x);
  return Number.isNaN(n) ? 0 : n;
}
