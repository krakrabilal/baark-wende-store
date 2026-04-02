#!/bin/bash
echo "============================================"
echo "  REINSTALLATION BAARK WENDE STORE"
echo "============================================"

echo "Etape 1: Suppression des anciens fichiers..."
rm -rf node_modules
rm -f package-lock.json
echo "OK."

echo "Etape 2: Installation des dependances..."
npm install --legacy-peer-deps

echo "Etape 3: Installation de Firebase..."
npm install firebase --legacy-peer-deps

echo "============================================"
echo "  INSTALLATION TERMINEE !"
echo "  Lancez maintenant: npm start"
echo "============================================"
