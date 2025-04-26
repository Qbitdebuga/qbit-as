# Versioning Guide for Qbit Accounting System

This project uses [Changesets](https://github.com/changesets/changesets) to manage versions, create changelogs, and publish packages.

## Using Changesets

### Adding a Changeset

When making changes to packages that will be published to NPM, you should create a changeset to document your changes:

```bash
yarn changeset
```

This will start an interactive CLI that will ask you:

1. Which packages you have modified
2. What type of version bump is needed (patch, minor, major)
3. A description of the changes

This will create a Markdown file in the `.changeset` directory, which should be committed with your changes.

### Versioning Packages

The versioning process happens automatically when changes are merged to the main branch. A GitHub Action will:

1. Create a PR that bumps versions and updates changelogs according to the changesets
2. When that PR is merged, it will trigger another workflow that publishes the packages to NPM

### Manual Versioning

If you need to manually update versions:

```bash
yarn version-packages
```

This command will consume all changesets, bumping versions and updating changelogs accordingly.

### Manual Publishing

If you need to manually publish packages:

```bash
yarn release
```

This will build all packages and publish them to NPM.

## Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/) principles:

- **Patch** (`0.0.x`): Bug fixes and minor changes that don't affect the API
- **Minor** (`0.x.0`): New features that don't break existing functionality
- **Major** (`x.0.0`): Breaking changes that require updates to dependent code

## Monorepo Package Dependencies

When packages within the monorepo depend on each other, their versions are managed automatically:

- If Package A depends on Package B, and Package B receives a patch update, Package A will also receive a patch update in its internal dependency.
- Major and minor version bumps to dependencies will not automatically update dependent packages.

## Changesets Configuration

The Changesets configuration is defined in `.changeset/config.json`. Notable settings include:

- `updateInternalDependencies`: Set to "patch", meaning when a package is updated, all packages that depend on it will have their dependencies updated (but their version will not bump).
- `ignore`: Packages listed here will not have their versions bumped or be published.

## Best Practices

1. Create changesets for all notable changes
2. Write clear and concise changeset descriptions
3. Use the PR template's checklist to verify you've created necessary changesets
4. When in doubt, prefer minor version bumps over patch
5. Always use major version bumps for breaking changes 