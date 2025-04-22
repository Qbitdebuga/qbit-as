/**
 * Utility to help prevent problematic browser extensions from breaking the application
 */

/**
 * This function attempts to patch the window object to prevent certain
 * extension errors, particularly from crypto wallets like MetaMask
 */
export function protectFromExtensionErrors(): void {
  // Execute only in browser context
  if (typeof window === 'undefined') return;

  try {
    // Watch for specific keys being accessed that might cause errors
    const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    
    Object.getOwnPropertyDescriptor = function(obj: any, prop: PropertyKey) {
      // Create a safe wrapper for problematic extension calls
      if (obj === null || obj === undefined) {
        console.warn(`Browser extension tried to access property "${String(prop)}" on null/undefined`);
        return undefined;
      }
      
      return originalGetOwnPropertyDescriptor(obj, prop);
    };
    
    // Monitor any attempts to inject content scripts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'SCRIPT') {
              const scriptNode = node as HTMLScriptElement;
              // If the script is from a known problematic extension, log it
              if (scriptNode.src && scriptNode.src.includes('chrome-extension://egjidjbpglichdcondbcbdnbeeppgdph')) {
                console.warn('Detected problematic script injection from extension:', scriptNode.src);
              }
            }
          });
        }
      });
    });
    
    // Start observing once DOM is loaded
    window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.documentElement, { 
        childList: true, 
        subtree: true 
      });
    });
    
    console.info('Protection against extension errors is active');
  } catch (error) {
    console.error('Error setting up extension protection:', error);
  }
} 