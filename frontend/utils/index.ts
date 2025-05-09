// Get env or global url if in development use localhost if in production use the global url
export const getUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3002/api'
  }
  return process.env.BACKEND_URL
}

