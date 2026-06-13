export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

if (!BACKEND_URL) {
  console.warn(
    '[ColabEdit] WARNING: VITE_BACKEND_URL is not set.\n' +
    'All API requests will use relative URLs and WILL FAIL on Vercel.\n' +
    'Fix: Add VITE_BACKEND_URL in Vercel → Settings → Environment Variables, then redeploy.'
  );
}

export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
};
