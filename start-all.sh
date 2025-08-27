#!/bin/bash

echo "Starting SRE Monorepo Applications..."
echo

echo "Killing existing Node processes..."
pkill -f "node" 2>/dev/null || true
sleep 2

echo "Cleaning up ports..."
npx kill-port 3000 3001 3002 3003 >/dev/null 2>&1 || true
sleep 2

echo "Starting applications..."
echo

echo "[1/4] Starting Main App (Port 3000)..."
cd apps/main && PORT=3000 npm run dev &
cd ../..
sleep 3

echo "[2/4] Starting Brain App (Port 3001)..."
cd apps/brain && PORT=3001 npm run dev &
cd ../..
sleep 3

echo "[3/4] Starting Profile App (Port 3002)..."
cd apps/profile && PORT=3002 npm run dev &
cd ../..
sleep 3

echo "[4/4] Starting Writer App (Port 3003)..."
cd apps/writer && PORT=3003 npm run dev &
cd ../..

echo
echo "All applications are starting..."
echo
echo "URLs:"
echo "- Main:    http://localhost:3000"
echo "- Brain:   http://localhost:3001"
echo "- Profile: http://localhost:3002"
echo "- Writer:  http://localhost:3003"
echo
echo "Or use .lvh.me domains:"
echo "- Main:    http://main.lvh.me:3000"
echo "- Brain:   http://brain.lvh.me:3001"
echo "- Profile: http://profile.lvh.me:3002"
echo "- Writer:  http://writer.lvh.me:3003"
echo
echo "Press Ctrl+C to stop all processes"
wait