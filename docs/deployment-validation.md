# Post-Deployment Validation

This document outlines the process for validating that all microservices are running correctly after deployment.

## Overview

Post-deployment validation is a crucial step in ensuring that the Qbit Accounting System is functioning correctly. This validation checks the health of all microservices and reports any issues.

## Validation Methods

### 1. Using the Shell Script (Local/Dev Environment)

For local or development environments, use the shell script:

```bash
# Set environment variables if needed
export API_GATEWAY_URL=http://localhost:3001
export AUTH_SERVICE_URL=http://localhost:3002
# ... set other service URLs as needed

# Run the validation script
./scripts/validate-deployment.sh
```

### 2. Using the Kubernetes Job (Production Environment)

For Kubernetes clusters, apply the validation job:

```bash
kubectl apply -f k8s/validate-deployment.yaml
```

To view the validation results:

```bash
kubectl logs jobs/post-deployment-validation
```

## Health Endpoints

Each microservice exposes a `/health` endpoint that provides information about the service's health and its dependencies:

| Service | Endpoint | Checks |
|---------|----------|--------|
| Auth Service | `/health` | Database connectivity, disk space, memory usage |
| General Ledger | `/health` | Database connectivity, disk space, memory usage |
| Accounts Payable | `/health` | Basic service availability |
| Accounts Receivable | `/health` | Basic service availability |
| Banking | `/health` | Basic service availability |
| Fixed Assets | `/health` | Database connectivity, disk space, memory usage |
| Inventory | `/health` | Basic service availability |
| Reporting | `/health` | Basic service availability |
| API Gateway | `/health` | Basic service availability |

Some services also expose specialized health endpoints:

- `/health/live` - Liveness check (is the service running?)
- `/health/ready` - Readiness check (is the service ready to handle requests?)
- `/health/dependencies` - Health of external dependencies

## Troubleshooting

If validation fails, follow these steps:

1. Check which specific services failed in the validation output
2. View the logs for those services:
   ```bash
   # For Kubernetes
   kubectl logs deployment/[service-name]
   
   # For local development
   docker logs [container-name]
   ```
3. Verify that required environment variables are correctly set
4. Ensure database connections are working
5. Check network connectivity between services

## Integration with CI/CD

The validation script is designed to exit with a non-zero code if any service is unhealthy, making it easy to integrate with CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Validate deployment
  run: ./scripts/validate-deployment.sh
  env:
    API_GATEWAY_URL: http://api-gateway:3000
    # ... other service URLs
```

## Extending the Validation

To add validation for new services:

1. Add the service to the validation script
2. Ensure the service exposes a `/health` endpoint
3. Update this documentation with the new service information 