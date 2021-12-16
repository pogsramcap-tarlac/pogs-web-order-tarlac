export const LOGIN = 'auth/LOGIN';
export const LOGOUT = 'auth/LOGOUT';
export const GUEST = 'auth/GUEST';

export const login = () => ({
  type: LOGIN,
});

export const logout = () => ({
  type: LOGOUT,
});

export const guest = () => ({
  type: GUEST,
});
