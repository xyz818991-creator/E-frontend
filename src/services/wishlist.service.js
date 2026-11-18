export const wishlistService = {
  getWishlist: () => JSON.parse(localStorage.getItem('wishlist') || '[]'),
  saveWishlist: (items) => localStorage.setItem('wishlist', JSON.stringify(items)),
  toggleItem: (item) => {
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = list.some((it) => it.id === item.id);
    const updated = exists ? list.filter((it) => it.id !== item.id) : [...list, item];
    localStorage.setItem('wishlist', JSON.stringify(updated));
    return updated;
  }
};

export default wishlistService;
