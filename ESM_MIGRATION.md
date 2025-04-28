# ESM Migration Guide

This document outlines the migration process of the QBIT Accounting System to using ES modules (ESM) instead of CommonJS.

## 🚀 Why Migrate to ESM?

- **Future-proof**: Node.js and the JavaScript ecosystem are moving towards ESM as the standard
- **Better tree-shaking**: ESM allows for better dead code elimination
- **Top-level await**: Use `await` outside of async functions
- **Consistent with modern front-end tools**: Most front-end tools already use ESM

## 📝 Migration Steps

We've provided two helpful scripts to make the migration process smooth:

1. `yarn convert-to-esm`: Converts all services to use ESM
2. `yarn clean-rebuild`: Cleans and rebuilds all services

### Step 1: Preparation

Before running the migration scripts, make sure:

- All your changes are committed to version control
- You're working on a dedicated branch for this migration

```bash
git checkout -b esm-migration
```

### Step 2: Convert All Services to ESM

Run the conversion script:

```bash
yarn convert-to-esm
```

This script will:
- Set `"type": "module"` in each service's package.json
- Update tsconfig.json to use NodeNext module format
- Add .js extensions to all local imports in TypeScript files

### Step 3: Clean and Rebuild All Services

Once the conversion is complete, clean and rebuild all services:

```bash
yarn clean-rebuild
```

### Step 4: Test Each Service

Start each service individually to ensure it works properly:

```bash
yarn workspace @qbit/general-ledger run dev
yarn workspace @qbit/accounts-payable run dev
# etc.
```

### Step 5: Fix Any Remaining Issues

Common issues you might encounter:

- **Missing .js extensions in imports**: Add .js extension to local imports
- **TypeScript class inheritance issues**: Use the `declare` modifier for overridden properties
- **Incorrect module resolution**: Ensure moduleResolution is set to NodeNext in tsconfig.json

## 📚 ESM Coding Guidelines

When working with ESM in the codebase, follow these guidelines:

1. **Always add .js extensions to local imports**:
   ```typescript
   // ✅ Correct
   import { Something } from './something.js';
   
   // ❌ Incorrect
   import { Something } from './something';
   ```

2. **Use `import.meta.url` instead of `__dirname`**:
   ```typescript
   // ✅ Correct
   import { fileURLToPath } from 'url';
   import path from 'path';
   
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   
   // ❌ Incorrect
   const __dirname = ...; // This doesn't exist in ESM
   ```

3. **Use top-level await when appropriate**:
   ```typescript
   // ✅ Correct - ESM allows top-level await
   const data = await fetchData();
   
   // Still valid for function-scoped async operations
   async function getData() {
     return await fetchData();
   }
   ```

4. **Declare overridden properties in class extensions**:
   ```typescript
   // ✅ Correct
   export class Child extends Parent {
     declare propertyFromParent: string;
   }
   
   // ❌ Incorrect
   export class Child extends Parent {
     propertyFromParent: string;
   }
   ```

## ⚙️ Project Configuration

All services now use the following base configuration:

### package.json
```json
{
  "type": "module"
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "esModuleInterop": true
  }
}
```

## 🔄 Reverting (If Necessary)

If you need to revert to CommonJS for any reason:

1. Set `"type": "commonjs"` in package.json (or remove the field entirely)
2. Change module format in tsconfig.json back to `"commonjs"`
3. Remove .js extensions from imports
4. Clean and rebuild 