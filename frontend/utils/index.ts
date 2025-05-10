export const getUrl = () => {
  if (typeof window !== 'undefined') {
    // client
    return process.env.NEXT_PUBLIC_BACKEND_URL!;
  }
  // server
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL!;
};
