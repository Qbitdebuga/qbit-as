#!/bin/bash
set -e

# Set default values
NAMESPACE=${NAMESPACE:-qbit}
ENVIRONMENT=${ENVIRONMENT:-staging}
CONFIG_PATH=${CONFIG_PATH:-k8s/overlays/$ENVIRONMENT}

# Help message
function show_help {
  echo "Qbit Accounting System Deployment Script"
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -e, --environment    Environment to deploy to (default: staging)"
  echo "  -n, --namespace      Kubernetes namespace (default: qbit)"
  echo "  -c, --config         Path to kustomize configuration (default: k8s/overlays/\$ENVIRONMENT)"
  echo "  -h, --help           Show this help message"
  echo ""
  exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -e|--environment)
      ENVIRONMENT="$2"
      shift
      shift
      ;;
    -n|--namespace)
      NAMESPACE="$2"
      shift
      shift
      ;;
    -c|--config)
      CONFIG_PATH="$2"
      shift
      shift
      ;;
    -h|--help)
      show_help
      ;;
    *)
      shift
      ;;
  esac
done

echo "🚀 Deploying to $ENVIRONMENT environment in $NAMESPACE namespace"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
  echo "❌ kubectl is not installed. Please install kubectl first."
  exit 1
fi

# Check if kustomize is available
if ! command -v kustomize &> /dev/null; then
  echo "❌ kustomize is not installed. Please install kustomize first."
  exit 1
fi

# Verify kubectl connection
echo "🔍 Verifying Kubernetes connection"
kubectl cluster-info || {
  echo "❌ Failed to connect to Kubernetes cluster. Please check your kubeconfig."
  exit 1
}

# Create namespace if it doesn't exist
echo "📁 Creating namespace $NAMESPACE if it doesn't exist"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply kustomize configuration
echo "📦 Applying kustomize configuration from $CONFIG_PATH"
kubectl apply -k $CONFIG_PATH -n $NAMESPACE

# Wait for deployments to be ready
echo "⏳ Waiting for deployments to be ready..."
DEPLOYMENTS=$(kubectl get deployments -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')
for DEPLOYMENT in $DEPLOYMENTS; do
  echo "⏳ Waiting for deployment $DEPLOYMENT"
  kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE --timeout=300s
done

echo "✅ Deployment completed successfully!"
echo "Check the status with: kubectl get pods -n $NAMESPACE" 