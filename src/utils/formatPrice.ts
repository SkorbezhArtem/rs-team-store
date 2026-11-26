const integerFormatter = new Intl.NumberFormat('ru-BY', {
  style: 'currency',
  currency: 'BYN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat('ru-BY', {
  style: 'currency',
  currency: 'BYN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const normalized = Object.is(rounded, -0) ? 0 : rounded;
  return (Number.isInteger(normalized) ? integerFormatter : decimalFormatter).format(normalized);
}
