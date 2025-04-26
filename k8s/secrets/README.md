# Kubernetes Secrets Configuration for QBit Accounting System

This directory contains Kubernetes Secret manifests for the QBit Accounting System microservices.

## Important Security Notices

- **NEVER commit actual secret values to version control!**
- These files contain placeholders that MUST be replaced with actual values in your deployment environment.
- For production environments, use a secrets management solution like Hashicorp Vault, AWS Secrets Manager, or Kubernetes External Secrets Operator.

## Encoding Secrets

In production, all secret values should be base64 encoded. You can encode a value using:

```bash
echo -n 'your-secret-value' | base64
```

Then replace the `stringData` section with `data` and use the encoded values.

## Secrets Files

1. **auth-secrets.yaml**: Authentication service secrets
2. **api-gateway-secrets.yaml**: API Gateway service secrets
3. **accounts-receivable-secrets.yaml**: Accounts Receivable service secrets
4. **general-ledger-secrets.yaml**: General Ledger service secrets

## Usage in Kubernetes

Apply the secrets to your Kubernetes cluster:

```bash
# For development/testing only - NOT FOR PRODUCTION
kubectl apply -f k8s/secrets/

# For production, use a proper secrets management solution
```

## Referencing Secrets in Deployments

These secrets are referenced in the Kubernetes deployments using:

```yaml
envFrom:
- secretRef:
    name: service-name-secrets
```

## Rotating Secrets

Regularly rotate all secrets, especially in production environments:

1. Generate new secret values
2. Update the Kubernetes Secret objects
3. Restart the affected pods to pick up the new values

## Secret Structure Maintenance

If you add new services or required secrets, make sure to:
1. Create a corresponding secret YAML file
2. Document the purpose of each secret
3. Update the deployment files to reference the new secrets 