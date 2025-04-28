import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  clean: true,
  format: ['esm', 'cjs'],
  outDir: 'dist',
  target: 'es2022',
  // Generate .d.ts files separately using tsc
  dts: {
    // Custom entry to avoid having to create a separate tsconfig file
    entry: './src/index.ts',
    // Force disable incremental compilation in the dts generation
    compilerOptions: {
      incremental: false,
      skipLibCheck: true,
      declaration: true
    }
  }
});
