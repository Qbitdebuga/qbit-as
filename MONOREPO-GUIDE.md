# Qbit Accounting System Monorepo Guide

This guide explains how to work with the Qbit Accounting System monorepo which is structured using [Turborepo](https://turbo.build/repo).

## Project Structure

```
qbit-accounting/
├── apps/                 # Frontend applications
│   └── web/              # Next.js web application
├── packages/             # Shared packages
│   ├── shared-types/     # Shared TypeScript types
│   ├── ui-components/    # Shared UI components
│   └── api-client/       # API client libraries
├── services/             # Backend microservices
│   ├── api-gateway/      # API Gateway service
│   ├── auth/             # Authentication service
│   └── general-ledger/   # General Ledger service
├── prisma/               # Database schemas and migrations
├── package.json          # Root package configuration
├── turbo.json            # Turborepo configuration
└── .yarnrc               # Yarn configuration
```

## Installing Dependencies

### Add a dependency to a workspace root
```bash
yarn add <package> --dev
```

### Add a dependency to a specific workspace
```bash
yarn workspace <workspace-name> add <package>
```

Example: `yarn workspace general-ledger add @nestjs/terminus`

### Install all dependencies for the entire monorepo
```bash
yarn install
```

### Run a script in a specific workspace
```bash
yarn workspace <workspace-name> <script>
```

Example: `yarn workspace general-ledger install-health-check`

## Common Commands

```bash
yarn dev     # Start development servers
yarn build   # Build all packages and apps
yarn lint    # Lint all code
```

## How Workspaces Function

Internal packages (like `@qbit/shared-types`) are linked locally, not downloaded from yarn registry.

## Development Workflow

1. Clone the repository
```bash
git clone https://github.com/your-org/qbit-accounting.git
cd qbit-accounting
```

2. Install dependencies
- Run `yarn install` from the project root

3. Start development servers
```bash
yarn dev
```

4. When working with shared packages:
- Rebuild dependent packages: `yarn workspace @qbit/shared-types build`
- Use watch mode during development: `yarn workspace @qbit/shared-types dev`

## Best Practices

1. Always run `yarn install` from the project root to ensure workspace linking
2. Leverage shared packages for code reuse between services
3. Use consistent naming for workspaces and packages
4. Keep dependencies in the appropriate workspace, not the root package.json
5. Use the turborepo caching to speed up your builds

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