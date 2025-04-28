# Code Quality Standards for Qbit Accounting System

This document outlines the code quality standards and practices enforced in the Qbit Accounting System project.

## Type Checking

Type checking is enforced across all packages and services in the project to ensure type safety and prevent runtime errors.

- All TypeScript code is checked for type errors during the build process
- The `type-check` script is available in all packages and can be run with `yarn type-check`
- Type errors will cause production builds to fail, ensuring only type-safe code is deployed

## Linting

ESLint is used to enforce coding standards and catch potential issues:

- Linting is run during the build process
- Custom ESLint rules are defined for each package to match its specific requirements
- Consistent code formatting is enforced through Prettier integration

## Build Process

The build process is configured in `turbo.json` to ensure all quality checks are performed:

```json
{
  "build": {
    "dependsOn": ["^build", "type-check", "lint"],
    "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
  }
}
```

This ensures that:
1. Dependencies are built first
2. Type checking passes
3. Linting passes
4. Only then is the actual build performed

## Next.js Web Application

The Next.js web application has special configuration:

- Type checking and linting are skipped during development for faster feedback cycles
- Type checking and linting are enforced for production builds
- This is configured in `next.config.js` using environment variables

### Webpack and Turbopack Configuration

The web application is configured to work with both Webpack and Turbopack:

- Development mode uses Turbopack (`next dev --turbopack`) for faster rebuilds
- Production builds use Webpack
- Path aliases are configured for both bundlers in `next.config.js`:
  ```js
  // Webpack configuration
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  // Turbopack configuration
  experimental: {
    turbo: {
      resolveAlias: {
        '@': path.join(__dirname, 'src'),
      },
    },
  },
  ```

## Running Quality Checks Manually

You can run quality checks manually with the following commands:

```bash
# Run type checking across all packages
yarn type-check

# Run linting across all packages
yarn lint

# Run both as part of the build
yarn build
```

## Continuous Integration

These quality checks are enforced in the CI pipeline to prevent merging code that doesn't meet the standards.

---

Following these standards ensures the Qbit Accounting System remains maintainable, reliable, and free of common errors as the codebase grows. 