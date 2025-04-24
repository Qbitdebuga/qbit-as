#!/bin/bash

# Script to install and configure External Secrets Operator in Kubernetes
# Usage: ./setup-external-secrets.sh [aws|azure]

# Default provider
PROVIDER=${1:-"aws"}

# Display header
echo ""
echo -e "\033[0;36m=========================================================\033[0m"
echo -e "\033[0;36mQbit Accounting System - External Secrets Setup\033[0m"
echo -e "\033[0;36mSetting up External Secrets with provider: $PROVIDER\033[0m"
echo -e "\033[0;36m=========================================================\033[0m"
echo ""

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "\033[0;31mError: kubectl is not installed or not in PATH\033[0m"
    exit 1
fi

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo -e "\033[0;31mError: helm is not installed or not in PATH\033[0m"
    exit 1
fi

# Create namespace if not exists
echo -e "\033[0;33mCreating qbit namespace...\033[0m"
kubectl create namespace qbit --dry-run=client -o yaml | kubectl apply -f -

# Create external-secrets namespace if not exists
echo -e "\033[0;33mCreating external-secrets namespace...\033[0m"
kubectl create namespace external-secrets --dry-run=client -o yaml | kubectl apply -f -

# Add External Secrets Operator Helm repository
echo -e "\033[0;33mAdding External Secrets Operator Helm repository...\033[0m"
helm repo add external-secrets https://charts.external-secrets.io
helm repo update

# Install External Secrets Operator
echo -e "\033[0;33mInstalling External Secrets Operator...\033[0m"
helm install external-secrets external-secrets/external-secrets \
  --namespace external-secrets \
  --set installCRDs=true \
  --wait

# Wait for External Secrets Operator to be ready
echo -e "\033[0;33mWaiting for External Secrets Operator to be ready...\033[0m"
kubectl -n external-secrets wait --for=condition=available deployment/external-secrets-external-secrets --timeout=60s

# Setup provider-specific configurations
if [ "$PROVIDER" == "aws" ]; then
    echo -e "\033[0;33mSetting up AWS Secrets Manager integration...\033[0m"
    
    # Prompt for AWS credentials
    read -p "Enter AWS Access Key ID: " AWS_ACCESS_KEY_ID
    read -sp "Enter AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
    echo ""
    
    # Create AWS credentials secret
    kubectl -n qbit create secret generic aws-credentials \
        --from-literal=access-key-id="$AWS_ACCESS_KEY_ID" \
        --from-literal=secret-access-key="$AWS_SECRET_ACCESS_KEY" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    echo -e "\033[0;33mApplying AWS SecretStore and ExternalSecret configurations...\033[0m"
    kubectl apply -f k8s/external-secrets/aws-secretsmanager.yaml
    
elif [ "$PROVIDER" == "azure" ]; then
    echo -e "\033[0;33mSetting up Azure Key Vault integration...\033[0m"
    
    # Prompt for Azure credentials
    read -p "Enter Azure Tenant ID: " AZURE_TENANT_ID
    read -p "Enter Azure Client ID: " AZURE_CLIENT_ID
    read -sp "Enter Azure Client Secret: " AZURE_CLIENT_SECRET
    echo ""
    
    # Create Azure credentials secret
    kubectl -n qbit create secret generic azure-credentials \
        --from-literal=tenant-id="$AZURE_TENANT_ID" \
        --from-literal=client-id="$AZURE_CLIENT_ID" \
        --from-literal=client-secret="$AZURE_CLIENT_SECRET" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Replace placeholders in the Azure configuration
    sed -i "s/\${AZURE_TENANT_ID}/$AZURE_TENANT_ID/g" k8s/external-secrets/azure-keyvault.yaml
    
    echo -e "\033[0;33mApplying Azure SecretStore and ExternalSecret configurations...\033[0m"
    kubectl apply -f k8s/external-secrets/azure-keyvault.yaml
    
else
    echo -e "\033[0;31mError: Unsupported provider '$PROVIDER'. Use 'aws' or 'azure'.\033[0m"
    exit 1
fi

echo -e "\033[0;32mExternal Secrets Operator setup completed!\033[0m"
echo -e "\033[0;32mVerify the secrets are created with: kubectl get externalsecrets,secretstore -n qbit\033[0m" 