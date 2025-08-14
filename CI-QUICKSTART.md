# 🚀 CI/CD Quick Start Guide

This guide provides **1-3 commands** to get your entire Pokemon app running locally or in CI/CD.

## 📋 Prerequisites

- Node.js 16+ installed
- Git repository cloned

## ⚡ Quick Commands (1-3 steps max)

### **Option 1: Full Automated Setup (1 command)**

```bash
npm run ci:quick
```

This runs: `npm install` → start backend → health checks → run all tests

### **Option 2: Backend + Tests Only (1 command)**

```bash
npm run ci:setup
```

Starts backend → verifies with curl → runs tests

### **Option 3: Full Stack with Frontend (1 command)**

```bash
npm run ci:full
```

Starts backend → starts frontend → verifies both → runs tests

### **Option 4: Tests Only (if servers already running)**

```bash
npm run ci:test-only
```

Just runs tests (assumes servers are already running)

## 🔄 CI/CD Workflow

The automated script handles this entire flow:

1. **📦 Install dependencies** (`npm install`)
2. **🧹 Clean up** existing processes on ports 3000/3001
3. **🚀 Start backend** with health checks
4. **✅ Verify with curl** (`curl http://localhost:3000/api/pokemon/1`)
5. **🎨 Start frontend** (optional, with `--frontend` flag)
6. **🧪 Run all tests** (API + E2E tests)
7. **🧹 Cleanup** all processes when done

## 🎯 Individual Test Commands

```bash
# Run only API tests (Mikr.us integration)
npm run test:api

# Run only E2E tests (frontend automation)
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/random-pokemon.spec.ts
```

## 🐛 Troubleshooting

### Port Already in Use

The script automatically kills processes on ports 3000/3001 before starting.

### Health Check Fails

- Backend health check: `http://localhost:3000/api/pokemon/types`
- Frontend health check: `http://localhost:3001`
- Timeout: 60 seconds with 2-second intervals

### Manual Verification

```bash
# Check if backend is running
curl http://localhost:3000/api/pokemon/1

# Check if frontend is running
curl http://localhost:3001
```

## 🏗️ CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Pokemon App Tests
  run: npm run ci:quick
```

### Local Development

```bash
# Quick test run
npm run ci:setup

# Development with frontend
npm run ci:full
```

## 📁 Project Structure

```
pokedex/
├── scripts/ci-setup.js     # Main automation script
├── tests/
│   ├── api/               # Mikr.us API integration tests
│   └── e2e/               # Frontend E2E tests
│       ├── pokemon-search.spec.ts
│       ├── team-management.spec.ts
│       ├── random-pokemon.spec.ts  # ⭐ Gen 1 validation
│       ├── region-navigation.spec.ts
│       └── app-smoke.spec.ts
└── playwright.config.ts   # Test configuration
```

## ✨ Features Tested

- **🔍 Pokemon Search** - Core search functionality
- **👥 Team Management** - Add/remove Pokemon, team limits
- **🎲 Random Pokemon** - Generation 1 enforcement (IDs 1-151)
- **🗺️ Region Navigation** - Region switching
- **💨 Smoke Tests** - App stability and error handling

---

**🎮 Ready to test your Pokemon app? Just run `npm run ci:quick` and you're done!**
