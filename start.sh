#!/bin/bash

echo "Starting LinguaBridge AI..."

# Kill any existing processes on our ports
lsof -ti:5000,8000,5173 | xargs kill -9 2>/dev/null

# Start Backend
echo "Starting Node.js Backend..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Start AI Service
echo "Starting Python AI Service..."
cd ai-service
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 &
AI_PID=$!
cd ..

# Start Frontend
echo "Starting Vite Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "All services started!"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo "AI APIs:  http://localhost:8000"
echo "Press Ctrl+C to stop all services."

# Wait for any process to exit
wait $FRONTEND_PID $BACKEND_PID $AI_PID
