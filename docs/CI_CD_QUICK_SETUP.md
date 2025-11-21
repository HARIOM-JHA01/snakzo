# CI/CD Quick Setup Guide

## For Repository Owners/Admins

### 1. Initial GitHub Setup (5 minutes)

1. **Enable GitHub Actions**
   - Go to Repository Settings → Actions → General
   - Enable "Allow all actions and reusable workflows"
   - Enable "Read and write permissions" for workflows

2. **Set up Branch Protection**
   - Go to Settings → Branches
   - Add rule for `main` branch:
     - ✅ Require pull request reviews before merging
     - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - Select required status checks:
       - `Lint and Type Check`
       - `Build Application`
       - `Run Tests`

### 2. Vercel Setup (10 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
cd /path/to/snakzo
vercel link

# Get your credentials
vercel whoami  # Note your ORG_ID
cat .vercel/project.json  # Note your PROJECT_ID
```

To get your Vercel token:

1. Go to https://vercel.com/account/tokens
2. Create a new token with appropriate scope
3. Copy the token

### 3. Configure GitHub Secrets (5 minutes)

Go to: **Repository Settings → Secrets and variables → Actions → New repository secret**

Add these secrets one by one:

**Required:**

```
DATABASE_URL         = postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET      = (generate with: openssl rand -base64 32)
NEXTAUTH_URL         = https://yourdomain.com
REDIS_URL            = your-upstash-redis-url
STRIPE_PUBLIC_KEY    = pk_test_xxx
STRIPE_SECRET_KEY    = sk_test_xxx
VERCEL_TOKEN         = your-vercel-token-from-step-2
VERCEL_ORG_ID        = your-org-id-from-step-2
VERCEL_PROJECT_ID    = your-project-id-from-step-2
PRODUCTION_URL       = https://yourdomain.com
```

**Optional (but recommended):**

```
SONAR_TOKEN          = (from sonarcloud.io)
CODECOV_TOKEN        = (from codecov.io)
LHCI_GITHUB_APP_TOKEN = (for Lighthouse CI)
```

### 4. Configure Vercel Environment Variables (5 minutes)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all the same environment variables (except Vercel tokens)
3. Select environment: Production, Preview, Development

### 5. Test the Setup (2 minutes)

```bash
# Create a test branch
git checkout -b test-ci-cd

# Make a small change
echo "# CI/CD Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: CI/CD pipeline"
git push origin test-ci-cd

# Create a PR on GitHub
# Watch the CI/CD workflows run!
```

### 6. Optional: Set up SonarCloud (5 minutes)

1. Go to https://sonarcloud.io
2. Sign in with GitHub
3. Import your repository
4. Copy your organization key and project key
5. Update `sonar-project.properties` with your keys
6. Add `SONAR_TOKEN` to GitHub secrets

---

## For Contributors

### Running CI Checks Locally

Before pushing your code, run these commands:

```bash
# Install dependencies
bun install

# Type check
bun run type-check

# Lint
bun run lint

# Format check
bun run format:check

# Fix formatting issues
bun run format

# Build
bun run build

# Run tests (when implemented)
bun run test
```

### Pre-commit Hooks (Optional)

To automatically run checks before committing:

```bash
# Install husky and lint-staged
bun add -d husky lint-staged

# Initialize husky
bunx husky install

# Add pre-commit hook
bunx husky add .husky/pre-commit "bunx lint-staged"
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

---

## Troubleshooting

### CI Workflow Fails

**Problem:** "Build Application" job fails
**Solution:**

1. Ensure all environment variables are set in GitHub Secrets
2. Check that `DATABASE_URL` is accessible from GitHub Actions
3. Verify Prisma schema is up to date

**Problem:** "Lint and Type Check" fails
**Solution:**

```bash
# Fix locally first
bun run lint
bun run type-check
```

### Deployment Fails

**Problem:** Vercel deployment fails
**Solution:**

1. Check Vercel dashboard for detailed logs
2. Verify all environment variables are set in Vercel
3. Ensure database is accessible from Vercel

**Problem:** Health check fails
**Solution:**

1. Wait a few minutes for deployment to stabilize
2. Check production URL is correct
3. Verify app is actually running on Vercel

### Preview Deployment Issues

**Problem:** Preview URL not generated
**Solution:**

1. Check Vercel token has correct permissions
2. Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
3. Look at workflow logs for specific errors

---

## Key Files Reference

| File                                   | Purpose                      |
| -------------------------------------- | ---------------------------- |
| `.github/workflows/ci.yml`             | Main CI pipeline             |
| `.github/workflows/deploy.yml`         | Production deployment        |
| `.github/workflows/preview-deploy.yml` | PR previews                  |
| `.github/workflows/lighthouse.yml`     | Performance testing          |
| `.github/workflows/code-quality.yml`   | Code quality checks          |
| `.github/dependabot.yml`               | Automated dependency updates |
| `lighthouserc.js`                      | Lighthouse thresholds        |
| `sonar-project.properties`             | SonarCloud config            |
| `.prettierrc`                          | Code formatting rules        |
| `scripts/deploy.sh`                    | Manual deployment script     |
| `scripts/verify-cicd.sh`               | Verify CI/CD setup           |

---

## Best Practices

1. ✅ **Always create PRs** - Never push directly to `main`
2. ✅ **Wait for CI** - Don't merge until all checks pass
3. ✅ **Review preview** - Test features in preview environment
4. ✅ **Check health** - Monitor deployments after merge
5. ✅ **Keep updated** - Merge Dependabot PRs regularly
6. ✅ **Write tests** - Add tests for new features (when test suite is implemented)
7. ✅ **Monitor performance** - Review Lighthouse reports

---

## Getting Help

- **CI/CD Issues:** Check workflow logs in GitHub Actions
- **Deployment Issues:** Check Vercel dashboard
- **Documentation:** See `docs/CI_CD_DOCUMENTATION.md`
- **Verification:** Run `./scripts/verify-cicd.sh`

---

**Setup Time:** ~30 minutes total
**Last Updated:** November 10, 2025
