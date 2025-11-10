# CI/CD Setup Documentation

## Overview

This project uses GitHub Actions for continuous integration and continuous deployment (CI/CD). The pipeline includes automated testing, code quality checks, security scanning, and deployment to Vercel.

## Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:** Push and Pull Requests to `main` and `develop` branches

**Jobs:**

- **Lint and Type Check**: Runs ESLint and TypeScript type checking
- **Build**: Builds the Next.js application
- **Test**: Runs unit and integration tests
- **Security Scan**: Runs security vulnerability scanning with Trivy

**Required Secrets:**

- `DATABASE_URL`: PostgreSQL database connection string
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `NEXTAUTH_URL`: Application URL for authentication
- `REDIS_URL`: Redis connection string (Upstash)
- `STRIPE_PUBLIC_KEY`: Stripe publishable key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `CODECOV_TOKEN`: Codecov token for coverage reports (optional)

### 2. Deployment Pipeline (`.github/workflows/deploy.yml`)

**Triggers:** Push to `main` branch or manual dispatch

**Jobs:**

- **Deploy**: Deploys to Vercel production
- **Post-Deploy Checks**: Health checks and cache warming

**Required Secrets:**

- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `PRODUCTION_URL`: Production URL for health checks
- All environment variables from CI pipeline

### 3. Preview Deployment (`.github/workflows/preview-deploy.yml`)

**Triggers:** Pull Requests to `main` and `develop` branches

**Jobs:**

- **Preview Deploy**: Creates a preview deployment on Vercel
- Automatically comments PR with preview URL

**Required Secrets:** Same as deployment pipeline

### 4. Lighthouse Performance (`.github/workflows/lighthouse.yml`)

**Triggers:**

- Pull Requests to `main`
- Weekly schedule (Monday 9 AM UTC)
- Manual dispatch

**Jobs:**

- **Lighthouse Audits**: Runs comprehensive Lighthouse performance tests
- **Core Web Vitals**: Checks performance metrics against thresholds

**Required Secrets:**

- `LHCI_GITHUB_APP_TOKEN`: Lighthouse CI GitHub app token (optional)
- `PRODUCTION_URL`: URL to test (defaults to production)

### 5. Code Quality (`.github/workflows/code-quality.yml`)

**Triggers:** Push and Pull Requests to `main` and `develop` branches

**Jobs:**

- **SonarCloud Analysis**: Code quality and security analysis
- **Format Check**: Prettier code formatting validation
- **Accessibility Check**: pa11y accessibility testing
- **Bundle Analysis**: Bundle size analysis

**Required Secrets:**

- `SONAR_TOKEN`: SonarCloud authentication token

## Setup Instructions

### 1. GitHub Repository Setup

1. Fork or clone the repository
2. Enable GitHub Actions in repository settings

### 2. Vercel Setup

1. Sign up for [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables in Vercel dashboard
4. Get Vercel credentials:

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login and link project
   vercel login
   vercel link

   # Get tokens (save these as GitHub secrets)
   vercel whoami  # Get ORG_ID
   cat .vercel/project.json  # Get PROJECT_ID
   ```

### 3. GitHub Secrets Configuration

Navigate to: `Repository Settings → Secrets and variables → Actions`

Add the following secrets:

**Required for all workflows:**

```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://yourdomain.com
REDIS_URL=your-redis-url
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
PRODUCTION_URL=https://yourdomain.com
```

**Optional:**

```
CODECOV_TOKEN=your-codecov-token
SONAR_TOKEN=your-sonarcloud-token
LHCI_GITHUB_APP_TOKEN=your-lighthouse-token
```

### 4. SonarCloud Setup (Optional)

1. Sign up for [SonarCloud](https://sonarcloud.io)
2. Import your GitHub repository
3. Get your organization key and project key
4. Update `sonar-project.properties` with your keys
5. Add `SONAR_TOKEN` to GitHub secrets

### 5. Codecov Setup (Optional)

1. Sign up for [Codecov](https://codecov.io)
2. Link your GitHub repository
3. Get upload token
4. Add `CODECOV_TOKEN` to GitHub secrets

### 6. Local Development

Install dependencies:

```bash
bun install
```

Run tests:

```bash
bun run test
```

Type check:

```bash
bun run type-check
```

Lint:

```bash
bun run lint
```

Format code:

```bash
bun run format
```

### 7. Manual Deployment

To deploy manually using the deployment script:

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Set environment variables
export DATABASE_URL="postgresql://..."
export VERCEL_TOKEN="your-token"
export PRODUCTION_URL="https://yourdomain.com"

# Run deployment
./scripts/deploy.sh
```

## Performance Thresholds

The Lighthouse CI enforces the following thresholds:

- **Performance**: Minimum score of 80
- **Accessibility**: Minimum score of 90
- **Best Practices**: Minimum score of 90
- **SEO**: Minimum score of 90

**Core Web Vitals:**

- First Contentful Paint (FCP): ≤ 2000ms
- Largest Contentful Paint (LCP): ≤ 2500ms
- Cumulative Layout Shift (CLS): ≤ 0.1
- Total Blocking Time (TBT): ≤ 300ms
- Speed Index: ≤ 3000ms

## Automated Updates

Dependabot is configured to:

- Check for npm package updates weekly
- Check for GitHub Actions updates weekly
- Automatically create PRs for updates
- Ignore major version updates for critical dependencies

## Troubleshooting

### Build Fails

1. Check if all environment variables are set correctly
2. Verify database connection
3. Ensure Prisma migrations are up to date

### Deployment Fails

1. Check Vercel dashboard for error logs
2. Verify Vercel tokens are valid
3. Ensure database is accessible from Vercel

### Tests Fail

1. Check test logs in GitHub Actions
2. Run tests locally: `bun run test`
3. Verify database connection for integration tests

### Lighthouse Fails

1. Check performance scores in artifacts
2. Review optimization recommendations
3. Consider adjusting thresholds if needed

## Monitoring

After deployment, monitor:

- **Vercel Dashboard**: Deployment status and logs
- **GitHub Actions**: Workflow runs and artifacts
- **SonarCloud**: Code quality metrics
- **Codecov**: Test coverage trends
- **Sentry**: Runtime errors and performance

## Best Practices

1. **Always create a PR**: Never push directly to `main`
2. **Wait for CI checks**: Ensure all checks pass before merging
3. **Review preview deployment**: Test features in preview environment
4. **Monitor post-deployment**: Check health checks and error rates
5. **Keep dependencies updated**: Review and merge Dependabot PRs regularly
6. **Maintain test coverage**: Add tests for new features
7. **Follow code quality standards**: Address SonarCloud issues

## Support

For issues with CI/CD pipeline, please:

1. Check GitHub Actions logs
2. Review this documentation
3. Contact the DevOps team
4. Create an issue in the repository

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
