@echo off
echo.
echo ========================================
echo 🎮 Pokemon App - Quick Test Runner
echo ========================================
echo.

if "%1"=="full" (
    echo Running FULL setup with frontend...
    npm run ci:full
) else if "%1"=="quick" (
    echo Running QUICK setup with install...
    npm run ci:quick
) else if "%1"=="test-only" (
    echo Running tests only...
    npm run ci:test-only
) else (
    echo Running standard setup...
    npm run ci:setup
)

echo.
echo ========================================
echo ✅ Test execution completed!
echo ========================================
pause
