// Error messages and handling utilities for FocusBrief

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  TIMEOUT: 'La solicitud tardó demasiado. Por favor, inténtalo de nuevo.',

  // Authentication errors
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
  UNAUTHORIZED: 'No tienes permiso para realizar esta acción.',
  INVALID_CREDENTIALS: 'Contraseña incorrecta. Por favor, verifica e intenta de nuevo.',

  // Processing errors
  PROCESSING_FAILED: 'Error al procesar el contenido. Por favor, inténtalo de nuevo.',
  INVALID_URL: 'La URL proporcionada no es válida. Verifica el formato.',
  CONTENT_TOO_SHORT: 'El contenido es demasiado corto para procesar.',
  CONTENT_TOO_LONG: 'El contenido es demasiado largo. Máximo 100,000 caracteres.',
  EXTRACTION_FAILED: 'No se pudo extraer el contenido de la URL.',

  // File errors
  FILE_TOO_LARGE: 'El archivo es demasiado grande. Máximo 50MB.',
  UNSUPPORTED_FILE_TYPE: 'Tipo de archivo no soportado.',
  FILE_UPLOAD_FAILED: 'Error al subir el archivo. Por favor, inténtalo de nuevo.',

  // Rate limiting
  RATE_LIMITED: 'Has hecho demasiadas solicitudes. Espera un momento antes de continuar.',

  // Capsule errors
  CAPSULE_NOT_FOUND: 'La cápsula no fue encontrada.',
  CAPSULE_DELETE_FAILED: 'Error al eliminar la cápsula.',

  // AI errors
  AI_UNAVAILABLE: 'El servicio de IA no está disponible. Inténtalo más tarde.',
  AI_RESPONSE_INVALID: 'La IA devolvió una respuesta inválida. Por favor, intenta de nuevo.',

  // Generic errors
  UNKNOWN_ERROR: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
  SERVER_ERROR: 'Error del servidor. Por favor, inténtalo más tarde.',
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

// Recovery suggestions for each error type
export const ERROR_RECOVERY: Partial<Record<ErrorCode, string[]>> = {
  NETWORK_ERROR: [
    'Verifica tu conexión a internet',
    'Intenta recargar la página',
    'Si el problema persiste, espera unos minutos'
  ],
  SESSION_EXPIRED: [
    'Haz clic en "Iniciar sesión" para acceder de nuevo'
  ],
  RATE_LIMITED: [
    'Espera 60 segundos antes de intentar de nuevo',
    'Considera procesar menos contenido a la vez'
  ],
  EXTRACTION_FAILED: [
    'Verifica que la URL sea accesible públicamente',
    'Algunas páginas requieren inicio de sesión',
    'Intenta copiar el texto manualmente'
  ],
  AI_UNAVAILABLE: [
    'El servicio se restablecerá en breve',
    'Intenta de nuevo en unos minutos'
  ]
};

// Map API error messages to user-friendly messages
export function mapApiError(error: string | { message?: string; error?: string }): string {
  const errorMsg = typeof error === 'string'
    ? error
    : error.message || error.error || '';

  const errorLower = errorMsg.toLowerCase();

  // Network errors
  if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('econnrefused')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Timeout
  if (errorLower.includes('timeout') || errorLower.includes('aborted')) {
    return ERROR_MESSAGES.TIMEOUT;
  }

  // Authentication
  if (errorLower.includes('401') || errorLower.includes('unauthorized') || errorLower.includes('sesión')) {
    return ERROR_MESSAGES.SESSION_EXPIRED;
  }

  // Rate limiting
  if (errorLower.includes('429') || errorLower.includes('rate') || errorLower.includes('demasiadas')) {
    return ERROR_MESSAGES.RATE_LIMITED;
  }

  // URL errors
  if (errorLower.includes('url') && errorLower.includes('invalid')) {
    return ERROR_MESSAGES.INVALID_URL;
  }

  // Extraction errors
  if (errorLower.includes('extract') || errorLower.includes('extracción')) {
    return ERROR_MESSAGES.EXTRACTION_FAILED;
  }

  // AI errors
  if (errorLower.includes('gemini') || errorLower.includes('ai') || errorLower.includes('model')) {
    return ERROR_MESSAGES.AI_UNAVAILABLE;
  }

  // File errors
  if (errorLower.includes('file') || errorLower.includes('archivo')) {
    if (errorLower.includes('large') || errorLower.includes('grande')) {
      return ERROR_MESSAGES.FILE_TOO_LARGE;
    }
    if (errorLower.includes('type') || errorLower.includes('tipo')) {
      return ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE;
    }
    return ERROR_MESSAGES.FILE_UPLOAD_FAILED;
  }

  // Server errors
  if (errorLower.includes('500') || errorLower.includes('server')) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }

  // If the error message is already user-friendly (in Spanish), return it
  if (errorMsg.length > 0 && /^[A-ZÁÉÍÓÚ]/.test(errorMsg)) {
    return errorMsg;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

// Get recovery suggestions for an error
export function getRecoverySuggestions(error: string): string[] {
  const errorLower = error.toLowerCase();

  if (errorLower.includes('conexión') || errorLower.includes('network')) {
    return ERROR_RECOVERY.NETWORK_ERROR || [];
  }

  if (errorLower.includes('sesión') || errorLower.includes('expirado')) {
    return ERROR_RECOVERY.SESSION_EXPIRED || [];
  }

  if (errorLower.includes('demasiadas') || errorLower.includes('rate')) {
    return ERROR_RECOVERY.RATE_LIMITED || [];
  }

  if (errorLower.includes('extraer') || errorLower.includes('url')) {
    return ERROR_RECOVERY.EXTRACTION_FAILED || [];
  }

  if (errorLower.includes('ia') || errorLower.includes('servicio')) {
    return ERROR_RECOVERY.AI_UNAVAILABLE || [];
  }

  return [];
}
