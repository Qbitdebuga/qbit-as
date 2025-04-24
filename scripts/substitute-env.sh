#!/bin/bash

# Script to substitute environment variables in Kubernetes manifests
# Usage: ./substitute-env.sh [docker_registry_value]

# Default value if not provided
DOCKER_REGISTRY=${1:-"myaccount"}

# Create directory for processed files
PROCESSED_DIR="processed-k8s"
mkdir -p $PROCESSED_DIR

echo "Using Docker registry: $DOCKER_REGISTRY"
echo "Processing Kubernetes manifests..."

# Process each YAML file
for file in k8s/*.yaml; do
  filename=$(basename $file)
  echo "Processing $file..."
  
  # Replace variables with actual values
  sed -e "s|\${DOCKER_REGISTRY}|$DOCKER_REGISTRY|g" \
      $file > $PROCESSED_DIR/$filename
done

echo "All files processed. Results in $PROCESSED_DIR/"
echo "Use kubectl apply -f $PROCESSED_DIR/ to apply these manifests." 