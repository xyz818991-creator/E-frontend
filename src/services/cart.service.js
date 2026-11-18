export const cartService = {
  getCart: () => JSON.parse(localStorage.getItem('cart') || '[]'),
  saveCart: (items) => localStorage.setItem('cart', JSON.stringify(items)),
  clearCart: () => localStorage.removeItem('cart')
};

export default cartService;
