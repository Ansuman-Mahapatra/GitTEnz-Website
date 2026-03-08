
// Configuration file for API URLs
// You can change the default value here to your deployed backend URL

export const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? "http://localhost:8080" 
    : "https://gittenz.onrender.com");
