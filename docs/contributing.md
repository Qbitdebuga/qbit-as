# Contributing to Qbit Accounting System

Thank you for your interest in contributing to the Qbit Accounting System! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) to help us maintain a healthy and collaborative community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue in our issue tracker with the following information:

1. **Title**: A clear, concise description of the bug
2. **Description**: Detailed information about the bug
3. **Steps to Reproduce**: Step-by-step instructions to reproduce the bug
4. **Expected Behavior**: What you expected to happen
5. **Actual Behavior**: What actually happened
6. **Screenshots/Logs**: If applicable, add screenshots or logs
7. **Environment**: Your environment details (OS, browser, versions, etc.)

### Requesting Features

If you have a feature request, please create an issue with the following information:

1. **Title**: A clear, concise description of the feature
2. **Description**: Detailed information about the feature
3. **Problem Statement**: What problem this feature would solve
4. **Proposed Solution**: Your ideas for implementing the feature
5. **Alternatives Considered**: Any alternative solutions you've considered
6. **Additional Context**: Any other context, screenshots, etc.

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes following our commit message conventions
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request with a detailed description

## Development Process

### Setting Up the Development Environment

Follow the instructions in the [Getting Started Guide](./getting-started.md) to set up your development environment.

### Branching Strategy

We follow the Gitflow branching model:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `release/*`: Release preparation branches
- `hotfix/*`: Hotfix branches for production issues

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types include:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or fixing tests
- `chore`: Maintenance tasks

Example:
```
feat(auth): implement password reset functionality

- Add password reset API endpoint
- Send reset email
- Add reset form component

Closes #123
```

### Changesets

For changes that affect published packages, please create a changeset:

```bash
yarn changeset
```

This will guide you through the process of documenting your changes for the next release.

### Code Style

We use ESLint and Prettier to enforce code style:

- Run `yarn lint` to check for style issues
- Run `yarn format` to automatically fix style issues

Our code style guidelines:
- Use TypeScript for type safety
- Write clean, self-documenting code
- Add comments for complex logic
- Follow the principle of single responsibility
- Write testable code

### Testing

All code changes should include appropriate tests:

- **Unit Tests**: For individual functions and components
- **Integration Tests**: For service interactions
- **E2E Tests**: For complete user flows

Run tests with:
```bash
yarn test
```

### Documentation

- Update documentation for any changed features
- Document new features, APIs, and components
- Keep code comments up to date
- Use JSDoc for function and class documentation

## Review Process

### Code Review Guidelines

Pull requests require at least one review before they can be merged. Reviewers should check for:

1. Code quality and style adherence
2. Test coverage
3. Documentation
4. Performance considerations
5. Security implications

### Continuous Integration

All pull requests must pass our CI checks:

- Linting
- Type checking
- Tests passing
- Build success

## Release Process

Our release process is managed with Changesets:

1. Changes are merged to `main`
2. GitHub Actions creates a release PR with version updates
3. The release PR is reviewed and merged
4. GitHub Actions publishes the release
5. Release notes are automatically generated

## Getting Help

If you need help with your contribution:

- Check the documentation
- Ask in our GitHub Discussions
- Reach out to the maintainers

## Thank You!

Your contributions help make the Qbit Accounting System better for everyone. We appreciate your time and effort! 