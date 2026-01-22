export const setAuth = (token, user) => {
  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminUser', JSON.stringify(user));
};

export const getAuth = () => {
  const token = localStorage.getItem('adminToken');
  const userStr = localStorage.getItem('adminUser');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
};

export const clearAuth = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};
