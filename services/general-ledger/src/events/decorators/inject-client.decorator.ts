import { Inject } from '@nestjs/common';

/**
 * Decorator for injecting a specific message client
 * Maps client names to the actual injection tokens used in the application
 * 
 * @param clientName The name of the client to inject
 */
export const InjectClient = (clientName: string) => {
  // Map client names to injection tokens
  const clientMap = {
    'ACCOUNT_SERVICE': 'RABBITMQ_CLIENT',
    'JOURNAL_ENTRY_SERVICE': 'RABBITMQ_CLIENT',
    'USER_SERVICE': 'RABBITMQ_CLIENT',
    // Add more mappings as needed
  };

  // Get the actual injection token or use the client name if not mapped
  const injectionToken = clientMap[clientName] || clientName;
  
  return Inject(injectionToken);
}; 