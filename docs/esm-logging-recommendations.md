# ESM Logging Recommendations for Qbit Accounting System

## Current Issues

When using ES Modules (ESM) in Node.js applications, certain logging libraries and approaches face compatibility issues. This document outlines the challenges encountered and recommended solutions.

## Problems Identified

1. **Dynamic Require Statements**: Many logging libraries use `require()` dynamically, which is not supported in ESM.
   - Example error: `Error: Dynamic require of "fs" is not supported`

2. **Non-ESM Compatible Dependencies**: Libraries like `pino-roll` and `sonic-boom` are not fully ESM-compatible.

3. **File System Access**: ESM has stricter requirements for file system access, complicating log file management.

## Recommended Approaches

### 1. Console-Only Logging in Development

For development environments:
- Use console-only logging (stdout/stderr)
- Disable file logging to avoid ESM compatibility issues
- Configure logging level based on NODE_ENV

```typescript
const logger = new PinoLoggerService({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  fileEnabled: false, // Disable file logging
});
```

### 2. Container-Based Log Management in Production

For production environments, leverage container orchestration:
- Direct all logs to stdout/stderr
- Use Docker or Kubernetes log drivers for collection
- Configure external log rotation at the container level

Example Docker configuration:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 3. Use Centralized Logging Services

Redirect logs to external services instead of local files:
- Send logs to services like Datadog, ELK, or CloudWatch
- Utilize HTTP transport instead of file transport
- These avoid file system access issues entirely

### 4. Alternative ESM-Compatible Solutions

If file-based logging is necessary:
- Use simple append-only file logging without rotation
- Implement external log rotation using OS-level tools like `logrotate`
- Consider newer ESM-native logging libraries

## Implementation in Qbit

Current implementation in the Qbit Accounting System:

1. **Development**: Console-only logging
2. **Production**: Console logging with container-based collection
3. **File Logging**: Disabled by default in ESM context, with warning if enabled

## Future Considerations

1. Evaluate newer logging libraries with better ESM support
2. Consider implementing a custom ESM-compatible log rotation solution
3. Standardize on a container-based logging strategy across all services 