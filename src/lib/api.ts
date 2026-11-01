const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
export const TOKEN_KEY = 'shade_access_token';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    // A dead session anywhere in the app sends the user back to sign in.
    if (response.status === 401 && token && path !== '/api/auth/login') {
      localStorage.removeItem(TOKEN_KEY);
      window.location.assign('/login');
    }
    throw new ApiError(response.status, body?.error || `Request failed (${response.status})`);
  }
  return body as T;
}

export const post = <T>(path: string, data: unknown) => api<T>(path, { method: 'POST', body: JSON.stringify(data) });

export const API_URL_VALUE = API_URL;
