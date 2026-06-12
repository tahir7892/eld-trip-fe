import axios from 'axios';

// Production (Vercel HTTPS) uses same-origin /api proxy — see vercel.json.
// Direct http:// backend URLs are blocked as mixed content from https:// pages.
const API_BASE =
  import.meta.env.VITE_BASE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:8000/api');

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000,
});

client.interceptors.request.use((config) => {
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. The route may be very long — please try again.'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Cannot reach the server. Make sure the Django backend is running.'));
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return error.message || 'Something went wrong.';
  if (typeof data.error === 'string') return data.error;
  if (typeof data.detail === 'string') return data.detail;
  if (data.current_cycle_used?.[0]) return data.current_cycle_used[0];
  const firstKey = Object.keys(data)[0];
  if (firstKey && Array.isArray(data[firstKey])) return data[firstKey][0];
  return JSON.stringify(data);
}

export async function calculateTrip(tripData) {
  const response = await client.post('/trips/calculate/', tripData);
  return response.data;
}

export async function searchLocations(query) {
  const response = await client.get('/trips/locations/search/', {
    params: { q: query },
    timeout: 15000,
  });
  return response.data.results || [];
}

export default client;
