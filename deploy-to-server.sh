#!/bin/bash

# Configuration
SERVER_USER="polo"
SERVER_IP="192.168.1.44"
DEST_DIR="~/file-manager-deploy"

echo "🚀 Starting deployment to $SERVER_IP..."

# 1. Sync files to the server (excluding node_modules and git)
# This ensures a clean transfer of your API, Worker, and Client source code
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude 'deploy-to-server.sh' \
      ./ $SERVER_USER@$SERVER_IP:$DEST_DIR

# 2. Run Docker commands on the server via SSH
ssh $SERVER_USER@$SERVER_IP << 'EOF'
  set -e
  cd ~/file-manager-deploy

  # Note: You have 'docker-compose.example.yml' in your files.
  # Docker looks for 'docker-compose.yml' by default.
  # Let's make sure it exists or tell Docker which file to use:
  if [ ! -f "docker-compose.yml" ]; then
    cp docker-compose.example.yml docker-compose.yml
  fi

  docker compose up --build -d
  docker image prune -f
EOF
