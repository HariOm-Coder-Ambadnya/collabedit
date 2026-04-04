export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
};
