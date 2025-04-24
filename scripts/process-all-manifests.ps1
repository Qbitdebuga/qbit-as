# PowerShell script to process and apply all Kubernetes manifests
# Usage: .\process-all-manifests.ps1 [docker_registry_value]

param(
    [string]$DockerRegistry = "myaccount"
)

# First, run the substitution script
Write-Host "Running environment variable substitution..." -ForegroundColor Cyan
& .\scripts\substitute-env.ps1 $DockerRegistry

# Check if substitution was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Environment variable substitution failed." -ForegroundColor Red
    exit 1
}

Write-Host "Applying Kubernetes manifests..." -ForegroundColor Cyan
Write-Host ""

# Apply infrastructure components first
Write-Host "Applying core infrastructure..." -ForegroundColor Green
kubectl apply -f processed-k8s/database.yaml
kubectl apply -f processed-k8s/redis.yaml
kubectl apply -f processed-k8s/rabbitmq.yaml
kubectl apply -f processed-k8s/consul.yaml

# Wait for infrastructure to be ready
Write-Host "Waiting for infrastructure to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available deployment/redis --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres --timeout=300s

# Apply microservices
Write-Host "Applying microservices..." -ForegroundColor Green
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
Write-Host "Applying ingress..." -ForegroundColor Green
kubectl apply -f processed-k8s/ingress.yaml

Write-Host "All manifests applied successfully!" -ForegroundColor Cyan
Write-Host ""
Write-Host "To check deployment status, run:" -ForegroundColor Yellow
Write-Host "kubectl get deployments" -ForegroundColor White 