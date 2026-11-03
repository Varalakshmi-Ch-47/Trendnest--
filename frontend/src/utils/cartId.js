const STORAGE_KEY = 'ecommerce_cart_id';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let memoryCartId = null;

function generateId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function getCartId() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && UUID_PATTERN.test(saved)) {
      return saved;
    }
    const created = generateId();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch (error) {
    // localStorage can be blocked in some browsers. Keep the id in memory instead.
    if (!memoryCartId) {
      memoryCartId = generateId();
    }
    return memoryCartId;
  }
}