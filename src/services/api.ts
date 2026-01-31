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
  extractedText?: string | null;
  mediaAnalysis?: string | null;
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

// Supported file types by Gemini 3 Flash
export const SUPPORTED_FILE_TYPES = {
  image: {
    extensions: ['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif'],
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'],
    maxSize: 7 * 1024 * 1024, // 7MB
    label: 'Imágenes'
  },
  audio: {
    extensions: ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.aac', '.webm'],
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/flac', 'audio/ogg', 'audio/aac', 'audio/webm'],
    maxSize: 50 * 1024 * 1024, // 50MB
    label: 'Audio'
  },
  video: {
    extensions: ['.mp4', '.webm', '.mov', '.mpeg', '.wmv', '.flv', '.3gp'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/mpeg', 'video/wmv', 'video/x-flv', 'video/3gpp'],
    maxSize: 50 * 1024 * 1024, // 50MB
    label: 'Video'
  },
  document: {
    extensions: ['.pdf', '.txt'],
    mimeTypes: ['application/pdf', 'text/plain'],
    maxSize: 50 * 1024 * 1024, // 50MB
    label: 'Documentos'
  }
};

// Get all supported extensions
export function getAllSupportedExtensions(): string {
  return Object.values(SUPPORTED_FILE_TYPES)
    .flatMap(t => t.extensions)
    .join(',');
}

// Get all supported MIME types
export function getAllSupportedMimeTypes(): string {
  return Object.values(SUPPORTED_FILE_TYPES)
    .flatMap(t => t.mimeTypes)
    .join(',');
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

// Process URL with Gemini 3 Flash (YouTube, web pages)
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

// Process file with Gemini 3 Flash (images, audio, video, PDF)
export async function processFile(
  file: File
): Promise<ProcessResponse> {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file);

    const response = await fetch(`${API_BASE_URL}/process-file`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fileData: base64Data,
        mimeType: file.type,
        fileName: file.name,
        source: file.name
      }),
    });

    if (response.status === 401) {
      return { success: false, error: 'Sesión expirada. Por favor, inicia sesión de nuevo.' };
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process file');
    }

    const result = await response.json();

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

// Get all capsules from Backend (with localStorage fallback)
export async function getCapsules(): Promise<CapsulesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/capsules`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      saveCapsulesToStorage(data.capsules); // Update local cache
      return data;
    }
    throw new Error('Failed to fetch from API');
  } catch (error) {
    console.warn('API fetch failed, falling back to localStorage:', error);
    return { capsules: getStoredCapsules() };
  }
}

// Get single capsule from Backend
export async function getCapsule(id: string): Promise<{ capsule?: CapsuleData }> {
  try {
    const response = await fetch(`${API_BASE_URL}/capsules/${id}`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('API fetch failed for single capsule:', error);
  }

  // Fallback to local
  const capsules = getStoredCapsules();
  const capsule = capsules.find(c => c.id === id);
  return { capsule };
}

// Delete capsule from Backend and localStorage
export async function deleteCapsule(id: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/capsules/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error('Failed to delete from backend');
    }
  } catch (error) {
    console.error('API delete failed:', error);
  }

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
