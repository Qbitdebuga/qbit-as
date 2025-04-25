import { Inject } from '@nestjs/common';

/**
 * Decorator for injecting a specific message client
 * Maps client names to the actual injection tokens used in the application
 * 
 * @param clientName The name of the client to inject
 */
export function InjectClient(clientName: string): ReturnType<typeof Inject> {
  const clientMap: Record<string, string> = {
    ACCOUNT_SERVICE: 'ACCOUNT_SERVICE_CLIENT',
    JOURNAL_ENTRY_SERVICE: 'JOURNAL_ENTRY_SERVICE_CLIENT',
    USER_SERVICE: 'USER_SERVICE_CLIENT',
  };

  const injectionToken = clientMap[clientName as keyof typeof clientMap] || clientName;
  return Inject(injectionToken);
} 