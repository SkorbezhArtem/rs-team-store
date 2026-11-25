const formatter = new Intl.NumberFormat('ru-BY', {
  style: 'currency',
  currency: 'BYN',
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return formatter.format(value);
}
