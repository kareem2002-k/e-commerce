export const getUrl = () => {
  if (typeof window !== 'undefined') {
    // We're in the browser — use the public env variable
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  // For SSR/server-side (optional)
  return process.env.BACKEND_URL;
};
