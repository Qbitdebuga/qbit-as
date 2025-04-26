# Deployment Guide for Qbit Accounting System

This guide provides instructions for deploying the Qbit Accounting System to various environments.

## Prerequisites

Before deploying, ensure you have the following:

- Kubernetes cluster (GKE, EKS, AKS, or similar)
- `kubectl` CLI configured with access to your cluster
- `kustomize` CLI (v5.0.0+)
- Docker registry access
- GitHub with Actions enabled
- Required secrets configured in GitHub repository

## Deployment Environments

The system supports the following deployment environments:

- **Development** (dev): For active development
- **Staging** (staging): For pre-production testing
- **Production** (production): For live usage

## Deployment Methods

### Method 1: Automated CI/CD Using GitHub Actions

Our preferred deployment method is through our GitHub Actions pipeline.

#### Setting Up GitHub Actions Secrets

Configure the following secrets in your GitHub repository:

1. **Docker Registry**
   - `DOCKER_HUB_USERNAME`: Docker Hub username
   - `DOCKER_HUB_TOKEN`: Docker Hub access token

2. **Kubernetes**
   - `KUBE_CONFIG`: Base64-encoded kubeconfig file

3. **Database**
   - `POSTGRES_PASSWORD`: Database password
   - `AUTH_DB_URL`: Auth service database URL
   - `GL_DB_URL`: General Ledger database URL
   - `AP_DB_URL`: Accounts Payable database URL
   - `AR_DB_URL`: Accounts Receivable database URL
   - `INVENTORY_DB_URL`: Inventory database URL
   - `FA_DB_URL`: Fixed Assets database URL
   - `BANKING_DB_URL`: Banking database URL
   - `REPORTING_DB_URL`: Reporting database URL

4. **Auth**
   - `JWT_SECRET`: JWT signing secret
   - `REFRESH_TOKEN_SECRET`: Refresh token secret

5. **API Keys**
   - `GL_API_KEY`: General Ledger API key
   - `AP_API_KEY`: Accounts Payable API key
   - `AR_API_KEY`: Accounts Receivable API key
   - `INVENTORY_API_KEY`: Inventory API key

6. **Infrastructure**
   - `RABBITMQ_PASSWORD`: RabbitMQ password

7. **Turborepo**
   - `TURBO_TOKEN`: Token for Turborepo remote caching
   - `TURBO_TEAM`: Team name for Turborepo remote caching

#### Triggering Deployment

The deployment workflow is automatically triggered when:

1. Pushing to the `main` branch (deploys to production)
2. Creating a pull request with the label `deploy-staging` (deploys to staging)

You can also manually trigger a deployment from the Actions tab in GitHub.

### Method 2: Manual Deployment using Kustomize

For manual deployment or troubleshooting, you can use Kustomize directly.

#### 1. Build Docker Images

```bash
# Build all service images
docker-compose build

# Tag and push images
docker tag qbit-api-gateway:latest your-registry/qbit-api-gateway:latest
docker push your-registry/qbit-api-gateway:latest

# Repeat for other services...
```

#### 2. Update Secret Files

Update the secret files in the appropriate overlay directory:

```bash
# Example: Update production secrets
cd k8s/overlays/production
# Edit the secret files: auth-secrets.env, database-secrets.env, etc.
```

#### 3. Deploy Using Kustomize

```bash
# Deploy to staging
kustomize build k8s/overlays/staging | kubectl apply -f -

# Deploy to production
kustomize build k8s/overlays/production | kubectl apply -f -
```

#### 4. Verify Deployment

```bash
# Check deployment status
kubectl get pods -n qbit

# Check services
kubectl get services -n qbit

# View logs
kubectl logs -n qbit deployment/api-gateway
```

### Method 3: Using the Deployment Script

For convenience, we provide a deployment script that handles the deployment process:

```bash
# Deploy to staging
./scripts/deploy.sh --environment staging

# Deploy to production
./scripts/deploy.sh --environment production
```

## Infrastructure Setup

Before the first deployment, you need to set up the infrastructure:

### 1. Create Kubernetes Namespace

```bash
kubectl create namespace qbit
```

### 2. Set Up Database

Deploy PostgreSQL to your cluster:

```bash
kubectl apply -f k8s/database.yaml -n qbit
```

Or configure external database services and update the connection strings in your secrets.

### 3. Set Up RabbitMQ and NATS

```bash
kubectl apply -f k8s/rabbitmq.yaml -n qbit
kubectl apply -f k8s/nats/nats-deployment.yaml -n qbit
```

### 4. Set Up Redis

```bash
kubectl apply -f k8s/redis.yaml -n qbit
```

### 5. Configure Ingress

```bash
kubectl apply -f k8s/ingress.yaml -n qbit
```

## Database Migrations

Database migrations are handled automatically during deployment. To run them manually:

```bash
# For auth service
DATABASE_URL=postgresql://user:password@host:5432/auth yarn workspace auth prisma migrate deploy

# Repeat for other services...
```

## Troubleshooting

### Common Issues

1. **Pod Status is CrashLoopBackOff**
   - Check the logs: `kubectl logs -n qbit pod/<pod-name>`
   - Verify environment variables and secrets

2. **Database Connection Issues**
   - Verify database is running: `kubectl get pods -n qbit | grep postgres`
   - Check connection strings in secrets

3. **Service Unavailable**
   - Check ingress configuration: `kubectl describe ingress -n qbit`
   - Verify service is running: `kubectl get services -n qbit`

### Rollback Procedure

If you need to rollback to a previous version:

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/<deployment-name> -n qbit

# Rollback to specific revision
kubectl rollout undo deployment/<deployment-name> --to-revision=<revision-number> -n qbit
```

## Monitoring

After deployment, you can monitor:

1. **Pod Health**
   ```bash
   kubectl get pods -n qbit
   ```

2. **Resource Usage**
   ```bash
   kubectl top pods -n qbit
   kubectl top nodes
   ```

3. **Logs**
   ```bash
   # Application logs
   kubectl logs -n qbit deployment/api-gateway
   
   # Database logs
   kubectl logs -n qbit deployment/postgres
   ```

## Scaling

To scale a service:

```bash
# Scale manually
kubectl scale deployment/api-gateway --replicas=3 -n qbit

# Configure Horizontal Pod Autoscaler
kubectl autoscale deployment/api-gateway --min=2 --max=5 --cpu-percent=80 -n qbit
```

## Backup and Restore

### Database Backup

```bash
# Create a backup
kubectl exec -n qbit <postgres-pod-name> -- pg_dump -U <username> <database> > backup.sql

# Restore from backup
kubectl exec -i -n qbit <postgres-pod-name> -- psql -U <username> <database> < backup.sql
```

## CI/CD Pipeline Details

Our CI/CD pipeline consists of the following stages:

1. **Build**: Builds all packages and applications
2. **Test**: Runs all tests
3. **Migrate**: Applies database migrations
4. **Deploy**: Deploys the application to the target environment

See the `.github/workflows/deploy.yml` file for detailed pipeline configuration. 