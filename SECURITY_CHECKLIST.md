# 🔐 Security Checklist — NorthAcoustics

Pre-commit validation to ensure no secrets, credentials, or sensitive data are exposed.

---

## 🎯 Purpose

Before committing to GitHub, verify that:
- ❌ NO secrets in code
- ❌ NO API keys exposed
- ❌ NO .env files committed
- ❌ NO passwords in files
- ✅ Code is clean and safe for public repository

---

## 🚀 Quick Check (Before Every Commit)

```bash
# Run this BEFORE git commit
npm run security:check

# Or manually:
./scripts/security-check.sh
```

---

## ✅ Manual Checklist

### 1. Environment Files

```bash
# ✅ Should NOT be committed:
- [ ] .env
- [ ] .env.local
- [ ] .env.development.local
- [ ] .env.test.local
- [ ] .env.production.local

# ✅ Should be in .gitignore:
git status | grep "\.env"
# Result: (nothing should show)

# ✅ Verify .env.example exists (WITHOUT real values):
[ -f .env.example ] && echo "✓ .env.example exists"
grep -i "=https\|=eyJ\|=sk_" .env.example && echo "❌ REAL VALUES IN .env.example!" || echo "✓ .env.example has no real values"
```

### 2. Secrets in Code

```bash
# ❌ Check for hardcoded secrets
grep -r "SUPABASE_SERVICE_ROLE_KEY" apps/ packages/ && echo "❌ SERVICE ROLE KEY FOUND!" || echo "✓ No service role keys"

grep -r "SUPABASE_DB_PASSWORD" apps/ packages/ && echo "❌ DB PASSWORD FOUND!" || echo "✓ No DB passwords"

grep -r "firebase-adminsdk" . && echo "❌ Firebase admin SDK found!" || echo "✓ No Firebase secrets"

grep -r "sk_live_\|sk_test_" . && echo "❌ Stripe keys found!" && echo "✓ No Stripe keys" || true

grep -r "OPENAI_API_KEY\|openai-key" . && echo "❌ OpenAI key found!" || echo "✓ No OpenAI keys"
```

### 3. AWS Credentials

```bash
# ❌ Check for AWS credentials
grep -r "AKIA[0-9A-Z]\{16\}" . && echo "❌ AWS Access Key found!" || echo "✓ No AWS keys"

grep -r "aws_secret_access_key\|AWS_SECRET" . && echo "❌ AWS secret found!" || echo "✓ No AWS secrets"

grep -r "\.aws/" . && echo "⚠️  AWS config directory found" || echo "✓ No AWS config directories"
```

### 4. Private Keys & Certificates

```bash
# ❌ Check for private keys
find . -type f \( -name "*.pem" -o -name "*.key" -o -name "*.pfx" -o -name "*.p12" \) ! -path "./node_modules/*" ! -path "./.git/*" && echo "❌ Private key files found!" || echo "✓ No private keys"

grep -r "BEGIN PRIVATE KEY\|BEGIN RSA PRIVATE KEY" . && echo "❌ Private key content found!" || echo "✓ No private key content"
```

### 5. Database Credentials

```bash
# ❌ Check for database connection strings
grep -r "postgres://\|mysql://\|mongodb://\|mongodb+srv://" . --exclude-dir=node_modules --exclude-dir=.git && echo "⚠️  Database URLs found (verify they're not production)" || echo "✓ No direct DB URLs"

grep -r "password=" . --exclude-dir=node_modules --exclude-dir=.git && echo "⚠️  Passwords found in code" || echo "✓ No passwords in code"
```

### 6. API Keys & Tokens

```bash
# ❌ Check for common API keys
grep -r "api_key\|apiKey\|API_KEY" . --exclude-dir=node_modules --exclude-dir=.git | grep -v ".ts" && echo "⚠️  API key references found" || echo "✓ No obvious API keys"

grep -r "Bearer\|Authorization:" . --exclude="*.log" --exclude-dir=node_modules && echo "⚠️  Bearer tokens might be exposed" || echo "✓ No visible tokens"

grep -r "auth.*token\|token.*=.*eyJ\|JWT\|jwt" . --exclude-dir=node_modules | head -5 && echo "⚠️  Check JWT handling" || echo "✓ No hardcoded JWTs"
```

### 7. Comments with Secrets

```bash
# ❌ Check for secrets in comments
grep -ri "password\|secret\|key\|token\|credential" . --exclude-dir=node_modules --exclude-dir=.git | grep -v ".git" | head -10

# Review if any matches look like actual secrets
# Real example:
# ❌ // TODO: Use apiKey: "sk_test_51234567890"
# ✅ // TODO: Add API key validation
```

### 8. Configuration Files

```bash
# ❌ Check for secrets in JSON/YAML
grep -r "secret\|password\|key\|token" *.json *.yaml *.yml 2>/dev/null | grep -v node_modules | grep -v ".git"

# Should not match actual values, only configuration templates
```

### 9. Git History

```bash
# ✅ Check if secrets were ever committed
git log -p --all -S "SUPABASE_SERVICE_ROLE_KEY" -- . 2>/dev/null && echo "⚠️  Service role key in history" || echo "✓ No service role keys in history"

git log -p --all -S "password\|secret\|token" -- . 2>/dev/null | head -20 && echo "⚠️  Review git history" || echo "✓ Clean git history"
```

---

## 🤖 Automated Checks

### Pre-commit Hook (Optional but Recommended)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Prevent committing secrets

echo "🔐 Running security checks..."

# Check for .env files
if git diff --cached --name-only | grep -E "\.env" > /dev/null; then
    echo "❌ ERROR: .env file staged for commit!"
    exit 1
fi

# Check for hardcoded secrets
if git diff --cached | grep -E "SUPABASE_SERVICE_ROLE|password.*=|api_key.*=" > /dev/null; then
    echo "⚠️  WARNING: Possible secrets in staged changes"
    echo "Review before committing"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Security checks passed"
exit 0
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 🔍 Script: Complete Security Validation

Create `scripts/security-check.sh`:

```bash
#!/bin/bash
set -e

echo "🔐 Running comprehensive security check..."
echo ""

FAILED=0

# Check 1: .env files
echo "1. Checking for .env files..."
if git status --short | grep -E "\.env" > /dev/null 2>&1; then
    echo "❌ FAIL: .env file detected in working directory"
    FAILED=1
else
    echo "✓ PASS: No .env files staged"
fi

# Check 2: .gitignore includes .env
echo "2. Checking .gitignore..."
if grep -q "^\.env" .gitignore; then
    echo "✓ PASS: .env in .gitignore"
else
    echo "❌ FAIL: .env not in .gitignore"
    FAILED=1
fi

# Check 3: Secrets in code
echo "3. Checking for hardcoded secrets..."
if git diff --cached | grep -E "SUPABASE_SERVICE_ROLE_KEY|password.*=|api_key.*=" > /dev/null 2>&1; then
    echo "❌ FAIL: Possible secrets in staged changes"
    FAILED=1
else
    echo "✓ PASS: No obvious secrets"
fi

# Check 4: Private keys
echo "4. Checking for private keys..."
if find . -type f \( -name "*.pem" -o -name "*.key" \) ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null; then
    echo "⚠️  WARNING: Private key files found"
else
    echo "✓ PASS: No private key files"
fi

# Check 5: AWS credentials
echo "5. Checking for AWS credentials..."
if grep -r "AKIA[0-9A-Z]\{16\}" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null; then
    echo "❌ FAIL: AWS access key detected"
    FAILED=1
else
    echo "✓ PASS: No AWS keys"
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo "✅ All security checks passed!"
    exit 0
else
    echo "❌ Security checks failed. Please review."
    exit 1
fi
```

Usage:
```bash
chmod +x scripts/security-check.sh
./scripts/security-check.sh
```

---

## 📋 Before Each Commit Verification

```bash
# Full verification routine
echo "=== Pre-Commit Security Check ==="

# 1. Check for secrets
echo "1. Scanning for secrets..."
npm run security:check || {
    echo "❌ Security check failed"
    exit 1
}

# 2. Check linting
echo "2. Running linter..."
npm run lint || {
    echo "❌ Linter found issues"
    exit 1
}

# 3. Review git diff
echo "3. Review staged changes..."
git diff --cached | head -50
echo "..."
read -p "Continue with commit? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 4. Commit
git commit -m "..."
```

---

## 🚨 If You Accidentally Commit Secrets

### Immediate Actions

```bash
# 1. DO NOT PUSH
# 2. Immediately revoke exposed secrets in Supabase/GitHub
# 3. Reset the commit
git reset HEAD~1

# 4. Remove the file from staging
git reset HEAD path/to/file

# 5. Fix the file (remove secrets)
# 6. Add .env to .gitignore (if not already there)
echo ".env" >> .gitignore

# 7. Stage only the files you meant to commit
git add .gitignore CONTRIBUTING.md README.md
git commit -m "feat: add documentation"

# 8. Do NOT push the commit with secrets
# 9. Notify repo admin immediately
```

### If Already Pushed to GitHub

```bash
# This is more serious. Contact repo admin immediately.

# Option 1: Delete branch and recreate
git push origin :feature/branch-name  # Delete remote branch
git branch -D feature/branch-name     # Delete local branch

# Option 2: Use git-filter-repo to remove from history
# (Complex, requires expert help)

# Option 3: Force push (use with extreme caution)
git revert HEAD
git push origin main --force-with-lease
```

---

## ✅ Final Checklist Before Pushing

```bash
□ npm run security:check passes
□ npm run lint passes
□ npm run typecheck passes
□ npm run build succeeds
□ .env files are NOT staged
□ .env.local is in .gitignore
□ No secrets in commit message
□ No console.log() statements left
□ Git diff looks correct
□ Commit message follows conventions
□ Ready to git push
```

---

## 📞 Questions?

- **Secrets accidentally exposed?** → Immediately regenerate in Supabase + GitHub
- **Unsure if a file should be committed?** → Check `.gitignore`
- **Need to add a new secret?** → Use GitHub Secrets for CI/CD, not code

---

**Status**: ✅ Ready to use  
**Last Updated**: 2026-05-26  
**Maintained by**: phrepich@gmail.com
