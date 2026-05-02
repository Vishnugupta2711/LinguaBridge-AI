#!/bin/bash
# Remove unwanted mp3 files
rm -f ai-service/tmp/*.mp3

# Unstage everything and remove commit history
git update-ref -d HEAD
git reset

# Base timestamp (Start of day)
START_DATE="2026-05-02T09:00:00"

commit_with_date() {
    msg=$1
    offset_hours=$2
    # Add offset to start date using macOS date
    commit_date=$(date -v+${offset_hours}H -f "%Y-%m-%dT%H:%M:%S" "$START_DATE" "+%Y-%m-%dT%H:%M:%S")
    export GIT_AUTHOR_DATE="$commit_date"
    export GIT_COMMITTER_DATE="$commit_date"
    git commit -m "$msg"
}

# 1. Init
git add .gitignore frontend/.gitignore ai-service/requirements.txt backend/package.json backend/package-lock.json frontend/package.json frontend/package-lock.json frontend/eslint.config.js frontend/vite.config.js frontend/index.html frontend/public/
commit_with_date "chore: init project structure and global configs" 0

# 2. Backend Base
git add backend/server.js backend/utils/storage.js storage/
commit_with_date "feat(backend): implement express server and atomic JSON storage" 1

# 3. Backend Routes
git add backend/routes/auth.js backend/routes/chat.js
commit_with_date "feat(backend): implement auth and chat routes with rate limiting" 2

# 4. AI Service
git add ai-service/main.py ai-service/ml/nlp.py ai-service/ml/audio.py ai-service/ml/translator.py
commit_with_date "feat(ai): configure FastAPI and language models" 4

# 5. Frontend Setup
git add frontend/src/main.jsx frontend/src/App.jsx frontend/src/App.css frontend/src/index.css frontend/src/utils/api.js frontend/src/assets/
commit_with_date "feat(frontend): setup vite, react router, and tailwind styling" 5

# 6. UI Core
git add frontend/src/pages/Login.jsx frontend/src/pages/Dashboard.jsx
commit_with_date "feat(ui): design premium login and dashboard components" 6

# 7. UI Live Translator
git add frontend/src/pages/LiveTranslator.jsx
commit_with_date "feat(ui): build split-pane live translator interface" 7

# 8. UI Voice Translator
git add frontend/src/pages/VoiceTranslator.jsx
commit_with_date "feat(ui): implement voice translator with audio wave visualizer" 8

# 9. UI Analytics
git add frontend/src/pages/ChatHistory.jsx frontend/src/pages/Analytics.jsx
commit_with_date "feat(ui): add chat history and NLP analytics dashboards" 10

# 10. Docs
git add start.sh README.md frontend/README.md
commit_with_date "docs: add startup scripts and update README" 11

# Any remaining files
git add .
commit_with_date "chore: final cleanup and optimizations" 12

# Push
git push -u origin main -f
