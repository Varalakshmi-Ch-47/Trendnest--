export function getStockInfo(quantity) {
  if (quantity <= 0) {
    return { text: 'Out of stock', level: 'out' };
  }
  if (quantity <= 5) {
    return { text: `Only ${quantity} left`, level: 'low' };
  }
  return { text: 'In stock', level: 'ok' };
}