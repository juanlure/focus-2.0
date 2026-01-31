// Authentication service for FocusBrief
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'focusbrief_token';
const EXPIRY_KEY = 'focusbrief_token_expiry';

export async function login(password: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    if (data.success && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(EXPIRY_KEY, data.expiresAt.toString());
      return true;
    }

    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);

  if (!token || !expiry) {
    return null;
  }

  // Check if expired
  if (Date.now() > parseInt(expiry, 10)) {
    logout();
    return null;
  }

  return token;
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export async function verifyToken(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
}
