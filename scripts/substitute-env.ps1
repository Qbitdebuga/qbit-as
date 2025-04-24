# PowerShell script to substitute environment variables in Kubernetes manifests
# Usage: .\substitute-env.ps1 [docker_registry_value]

# Default value if not provided
param(
    [string]$DockerRegistry = "myaccount"
)

# Create directory for processed files
$ProcessedDir = "processed-k8s"
if (-not (Test-Path $ProcessedDir)) {
    New-Item -ItemType Directory -Path $ProcessedDir | Out-Null
}

Write-Host "Using Docker registry: $DockerRegistry"
Write-Host "Processing Kubernetes manifests..."

# Process each YAML file
Get-ChildItem -Path "k8s" -Filter "*.yaml" | ForEach-Object {
    $filename = $_.Name
    $inputPath = $_.FullName
    $outputPath = Join-Path $ProcessedDir $filename
    
    Write-Host "Processing $inputPath..."
    
    # Replace variables with actual values
    (Get-Content -Path $inputPath) -replace '\${DOCKER_REGISTRY}', $DockerRegistry | Set-Content -Path $outputPath
}

Write-Host "All files processed. Results in $ProcessedDir/"
Write-Host "Use kubectl apply -f $ProcessedDir/ to apply these manifests." 