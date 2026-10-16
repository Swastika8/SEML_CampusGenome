export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export function readStored(key) {
  try {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  } catch {
    return null;
  }
}
export async function api(
  path,
  { method = 'GET', body, token = readStored('campus_token'), signal } = {},
) {
  let response;
  try {
    response = await fetch(API_BASE + path, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: signal || AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('We could not reach the campus server. Check your connection and try again.');
  }
  let data;
  try {
    data = await response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('The server returned an unexpected response.');
  }
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong. Please try again.');
    error.status = response.status;
    error.fields = data.errors;
    throw error;
  }
  return data;
}
