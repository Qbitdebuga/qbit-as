/**
 * Safely extracts message and stack from an unknown error
 */
export function formatError(error: unknown): { message: string | null; stack?: string } {
  if (error instanceof Error) {
    return { 
      message: error.message,
      stack: error.stack
    };
  }
  
  // For string errors
  if (typeof error === 'string') {
    return { message: error };
  }
  
  // For other types, stringify if possible
  try {
    const message = JSON.stringify(error);
    return { message };
  } catch {
    return { message: 'Unknown error' };
  }
} 