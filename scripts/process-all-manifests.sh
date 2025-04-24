#!/bin/bash

# Script to process and apply all Kubernetes manifests
# Usage: ./process-all-manifests.sh [docker_registry_value]

# Default value if not provided
DOCKER_REGISTRY=${1:-"myaccount"}

# First, run the substitution script
echo -e "\033[0;36mRunning environment variable substitution...\033[0m"
./scripts/substitute-env.sh $DOCKER_REGISTRY

# Check if substitution was successful
if [ $? -ne 0 ]; then
    echo -e "\033[0;31mError: Environment variable substitution failed.\033[0m"
    exit 1
fi

echo -e "\033[0;36mApplying Kubernetes manifests...\033[0m"
echo ""

# Apply infrastructure components first
echo -e "\033[0;32mApplying core infrastructure...\033[0m"
kubectl apply -f processed-k8s/database.yaml
kubectl apply -f processed-k8s/redis.yaml
kubectl apply -f processed-k8s/rabbitmq.yaml
kubectl apply -f processed-k8s/consul.yaml

# Wait for infrastructure to be ready
echo -e "\033[0;33mWaiting for infrastructure to be ready...\033[0m"
kubectl wait --for=condition=available deployment/redis --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres --timeout=300s

# Apply microservices
echo -e "\033[0;32mApplying microservices...\033[0m"
kubectl apply -f processed-k8s/api-gateway.yaml
kubectl apply -f processed-k8s/auth-service.yaml
kubectl apply -f processed-k8s/general-ledger.yaml
kubectl apply -f processed-k8s/accounts-payable.yaml
kubectl apply -f processed-k8s/accounts-receivable.yaml
kubectl apply -f processed-k8s/banking.yaml
kubectl apply -f processed-k8s/fixed-assets.yaml
kubectl apply -f processed-k8s/inventory.yaml
kubectl apply -f processed-k8s/reporting.yaml
kubectl apply -f processed-k8s/web.yaml

# Apply ingress last
echo -e "\033[0;32mApplying ingress...\033[0m"
kubectl apply -f processed-k8s/ingress.yaml

echo -e "\033[0;36mAll manifests applied successfully!\033[0m"
echo ""
echo -e "\033[0;33mTo check deployment status, run:\033[0m"
echo "kubectl get deployments" 