export const authStore = {
  getToken: () => localStorage.getItem('token') || sessionStorage.getItem('token'),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  },
  setSession: (token, user, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
};

export default authStore;
