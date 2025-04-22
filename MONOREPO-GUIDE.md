# Qbit Accounting System Monorepo Guide

This document provides guidance for working with the Qbit Accounting System monorepo, especially regarding dependency management and common operations.

## Monorepo Structure

```
qbit-as/
├── apps/                # Frontend applications
├── packages/            # Shared libraries
│   └── shared-types/    # Shared TypeScript types
├── services/            # Backend microservices
│   ├── api-gateway/
│   ├── auth/
│   ├── general-ledger/
│   └── ...
├── package.json         # Root package file
└── .npmrc               # NPM configuration
```

## Workspace Dependency Management

### Installing Dependencies

- **Root dependencies**: Run from the project root
  ```
  npm install <package> --save-dev
  ```

- **Service/app dependencies**: Run from the project root with workspace flag
  ```
  npm install <package> --workspace=<workspace-name>
  ```
  Example: `npm install @nestjs/terminus --workspace=general-ledger`

- **All workspaces**: Install dependencies in all workspaces
  ```
  npm install
  ```

### Running Scripts

- **Service/app scripts**: Run from the project root with workspace flag
  ```
  npm run <script> --workspace=<workspace-name>
  ```
  Example: `npm run install-health-check --workspace=general-ledger`

- **Root scripts**: Run common tasks for all workspaces
  ```
  npm run dev     # Start development servers
  npm run build   # Build all packages and apps
  npm run lint    # Lint all code
  ```

## Working With Internal Packages

Internal packages (like `@qbit/shared-types`) are linked locally, not downloaded from npm.

1. Always reference internal packages using the exact name in their package.json
2. Use the workspace protocol in path mapping in tsconfig.json when needed
3. Build dependent packages before building services

### Troubleshooting Common Issues

1. **404 Not Found for internal packages**:
   - Make sure the package name in package.json matches the import name
   - Run `npm install` from the project root
   - Verify the package is included in the workspaces array in root package.json

2. **TypeScript path resolution issues**:
   - Check tsconfig.json path mappings in the service/app
   - Ensure path mappings point to the source files, not built files for development

3. **Changes not being reflected**:
   - Rebuild dependent packages: `npm run build --workspace=@qbit/shared-types`
   - Use watch mode during development: `npm run dev --workspace=@qbit/shared-types`

## Best Practices

1. Always run `npm install` from the project root to ensure workspace linking
2. Use `--workspace` flag when adding dependencies to specific services/apps
3. Keep track of dependent package versions to avoid conflicts
4. Run build scripts in the correct order (dependencies first)
5. Use the tsconfig paths for importing from local packages during development 