// API service for FocusBrief - Vercel deployment with Gemini 3 Flash
import { getToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const STORAGE_KEY = 'focusbrief_capsules';

export interface CapsuleData {
  id: string;
  title: string;
  summary: string;
  actions: string[];
  priority: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  tags: string[];
  readTime: number;
  source: string;
  sourceType: string;
  createdAt: string;
  keyInsights?: string[];
  deadline?: string | null;
  processedWith?: string;
}

interface ProcessResponse {
  success: boolean;
  capsule?: CapsuleData;
  error?: string;
  rawResponse?: string;
}

interface CapsulesResponse {
  capsules: CapsuleData[];
}

// Get auth headers
function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Local storage helpers
function getStoredCapsules(): CapsuleData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCapsulesToStorage(capsules: CapsuleData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules));
}

function addCapsuleToStorage(capsule: CapsuleData): void {
  const capsules = getStoredCapsules();
  capsules.unshift(capsule);
  saveCapsulesToStorage(capsules);
}

// Process text content with Gemini 3 Flash
export async function processContent(
  content: string,
  sourceType: string = 'text',
  source: string = 'Manual'
): Promise<ProcessResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/process`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, sourceType, source }),
    });

    if (response.status === 401) {
      return { success: false, error: 'Sesión expirada. Por favor, inicia sesión de nuevo.' };
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process content');
    }

    const result = await response.json();

    // Save to localStorage
    if (result.success && result.capsule) {
      addCapsuleToStorage(result.capsule);
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Process URL with Gemini 3 Flash
export async function processURL(url: string): Promise<ProcessResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/process-url`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ url }),
    });

    if (response.status === 401) {
      return { success: false, error: 'Sesión expirada. Por favor, inicia sesión de nuevo.' };
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process URL');
    }

    const result = await response.json();

    // Save to localStorage
    if (result.success && result.capsule) {
      addCapsuleToStorage(result.capsule);
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get all capsules from localStorage
export async function getCapsules(): Promise<CapsulesResponse> {
  return { capsules: getStoredCapsules() };
}

// Get single capsule from localStorage
export async function getCapsule(id: string): Promise<{ capsule?: CapsuleData }> {
  const capsules = getStoredCapsules();
  const capsule = capsules.find(c => c.id === id);
  return { capsule };
}

// Delete capsule from localStorage
export async function deleteCapsule(id: string): Promise<{ success: boolean }> {
  const capsules = getStoredCapsules();
  const filtered = capsules.filter(c => c.id !== id);
  saveCapsulesToStorage(filtered);
  return { success: true };
}

// Health check
export async function healthCheck(): Promise<{ status: string; model: string; timestamp: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return null;
  }
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
  });
}

// Clear all capsules
export function clearAllCapsules(): void {
  localStorage.removeItem(STORAGE_KEY);
}
