export const cartStore = {
  getItems: () => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  },
  setItems: (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
  },
  addItem: (item) => {
    const items = cartStore.getItems();
    const index = items.findIndex((i) => i.id === item.id);
    if (index > -1) {
      items[index].quantity = (items[index].quantity || 1) + (item.quantity || 1);
    } else {
      items.push({ ...item, quantity: item.quantity || 1 });
    }
    cartStore.setItems(items);
    return items;
  },
  removeItem: (id) => {
    const items = cartStore.getItems().filter((i) => i.id !== id);
    cartStore.setItems(items);
    return items;
  },
  clear: () => {
    localStorage.removeItem('cart');
  }
};

export default cartStore;
