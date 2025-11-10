# Optional CI/CD Dependencies

These are optional dependencies that can enhance your CI/CD pipeline:

## Prettier (Code Formatting)

```bash
bun add -d prettier
```

## Husky & Lint-Staged (Pre-commit Hooks)

```bash
bun add -d husky lint-staged
npx husky install
npx husky add .husky/pre-commit "bunx lint-staged"
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

## Lighthouse CI

```bash
npm install -g @lhci/cli
```

## pa11y-ci (Accessibility Testing)

```bash
npm install -g pa11y-ci
```

## Vercel CLI

```bash
npm install -g vercel
```

## Testing Libraries (Future Implementation)

```bash
bun add -d vitest @testing-library/react @testing-library/jest-dom
bun add -d @playwright/test
bun add -d msw
```

## Bundle Analyzer (Already in dependencies)

No additional installation needed - already configured in package.json

## Note

Most of these tools are used in the CI/CD pipeline and don't need to be installed locally unless you want to run them during development.
