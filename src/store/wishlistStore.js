export const wishlistStore = {
  getItems: () => {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch {
      return [];
    }
  },
  setItems: (items) => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  },
  toggleItem: (item) => {
    const items = wishlistStore.getItems();
    const exists = items.some((i) => i.id === item.id);
    const updated = exists ? items.filter((i) => i.id !== item.id) : [...items, item];
    wishlistStore.setItems(updated);
    return updated;
  },
  clear: () => {
    localStorage.removeItem('wishlist');
  }
};

export default wishlistStore;
