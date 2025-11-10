#!/bin/bash

# CI/CD Setup Verification Script

echo "🔍 Verifying CI/CD Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check GitHub workflows
echo "📋 Checking GitHub Workflows..."
if [ -f ".github/workflows/ci.yml" ]; then
    echo -e "${GREEN}✓${NC} CI workflow exists"
else
    echo -e "${RED}✗${NC} CI workflow missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".github/workflows/deploy.yml" ]; then
    echo -e "${GREEN}✓${NC} Deploy workflow exists"
else
    echo -e "${RED}✗${NC} Deploy workflow missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".github/workflows/preview-deploy.yml" ]; then
    echo -e "${GREEN}✓${NC} Preview deployment workflow exists"
else
    echo -e "${RED}✗${NC} Preview deployment workflow missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".github/workflows/lighthouse.yml" ]; then
    echo -e "${GREEN}✓${NC} Lighthouse workflow exists"
else
    echo -e "${RED}✗${NC} Lighthouse workflow missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".github/workflows/code-quality.yml" ]; then
    echo -e "${GREEN}✓${NC} Code quality workflow exists"
else
    echo -e "${RED}✗${NC} Code quality workflow missing"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check Dependabot
echo "🤖 Checking Dependabot..."
if [ -f ".github/dependabot.yml" ]; then
    echo -e "${GREEN}✓${NC} Dependabot config exists"
else
    echo -e "${RED}✗${NC} Dependabot config missing"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check scripts
echo "📝 Checking Scripts..."
if [ -f "scripts/deploy.sh" ]; then
    if [ -x "scripts/deploy.sh" ]; then
        echo -e "${GREEN}✓${NC} Deploy script exists and is executable"
    else
        echo -e "${YELLOW}⚠${NC} Deploy script exists but is not executable"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗${NC} Deploy script missing"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check configuration files
echo "⚙️  Checking Configuration Files..."

if [ -f "lighthouserc.js" ]; then
    echo -e "${GREEN}✓${NC} Lighthouse config exists"
else
    echo -e "${RED}✗${NC} Lighthouse config missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "sonar-project.properties" ]; then
    echo -e "${GREEN}✓${NC} SonarCloud config exists"
else
    echo -e "${YELLOW}⚠${NC} SonarCloud config missing (optional)"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f ".prettierrc" ]; then
    echo -e "${GREEN}✓${NC} Prettier config exists"
else
    echo -e "${RED}✗${NC} Prettier config missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".prettierignore" ]; then
    echo -e "${GREEN}✓${NC} Prettier ignore file exists"
else
    echo -e "${YELLOW}⚠${NC} Prettier ignore file missing"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Check package.json scripts
echo "📦 Checking package.json scripts..."

if command -v jq &> /dev/null; then
    SCRIPTS=$(cat package.json | jq -r '.scripts | keys[]')
    
    REQUIRED_SCRIPTS=("build" "start" "lint" "type-check" "test" "dev")
    
    for script in "${REQUIRED_SCRIPTS[@]}"; do
        if echo "$SCRIPTS" | grep -q "^${script}$"; then
            echo -e "${GREEN}✓${NC} Script '$script' exists"
        else
            echo -e "${RED}✗${NC} Script '$script' missing"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    echo -e "${YELLOW}⚠${NC} jq not installed, skipping script verification"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Check environment setup
echo "🔐 Checking Environment Setup..."

if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓${NC} .env.example exists"
else
    echo -e "${YELLOW}⚠${NC} .env.example missing (recommended for documentation)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Check documentation
echo "📚 Checking Documentation..."

if [ -f "docs/CI_CD_DOCUMENTATION.md" ]; then
    echo -e "${GREEN}✓${NC} CI/CD documentation exists"
else
    echo -e "${RED}✗${NC} CI/CD documentation missing"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Summary
echo "════════════════════════════════════════"
echo "Summary:"
echo "════════════════════════════════════════"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Your CI/CD setup is complete and ready to use."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found${NC}"
    echo ""
    echo "Your CI/CD setup is functional but has some optional items missing."
    exit 0
else
    echo -e "${RED}✗ ${ERRORS} error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found${NC}"
    fi
    echo ""
    echo "Please fix the errors above before using the CI/CD pipeline."
    exit 1
fi
