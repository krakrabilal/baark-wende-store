@echo off
echo ============================================
echo   REINSTALLATION BAARK WENDE STORE
echo ============================================
echo.
echo Etape 1: Suppression des anciens fichiers...
rmdir /s /q node_modules 2>nul
del /f package-lock.json 2>nul
echo OK.
echo.
echo Etape 2: Installation des dependances...
npm install --legacy-peer-deps
echo.
echo Etape 3: Installation de Firebase...
npm install firebase --legacy-peer-deps
echo.
echo ============================================
echo   INSTALLATION TERMINEE !
echo   Lancez maintenant: npm start
echo ============================================
pause
