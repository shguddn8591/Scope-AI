#!/bin/bash

# Scope-AI: One-click Start Script

echo "🚀 Starting Scope-AI Setup..."

# 1. Start Backend
echo "📦 Initializing Backend (FastAPI)..."
cd backend
# Check for python3
if ! command -v python3 &> /dev/null
then
    echo "❌ Error: python3 is not installed."
    exit
fi

# Run backend in background
python3 main.py &
BACKEND_PID=$!
echo "✅ Backend started on http://localhost:8000 (PID: $BACKEND_PID)"

# 2. Start Frontend
echo "📦 Initializing Frontend (Next.js)..."
cd ../frontend
# Check for npm
if ! command -v npm &> /dev/null
then
    echo "❌ Error: npm is not installed."
    kill $BACKEND_PID
    exit
fi

# Run frontend
echo "✅ Starting Frontend on http://localhost:3000"
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
