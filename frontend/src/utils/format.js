const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

export function formatPrice(value) {
  return priceFormatter.format(Number(value));
}

export function formatDate(isoString) {
  if (!isoString) {
    return '';
  }
  return new Date(isoString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}