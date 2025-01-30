#!/bin/bash

set -e  # Exit script if any command fails

echo "Pulling latest changes from Git..."
git pull || { echo "Git pull failed!"; exit 1; }

echo "Installing dependencies..."
npm ci || { echo "NPM install failed!"; exit 1; }

echo "Restarting PM2 processes..."
pm2 restart all || { echo "PM2 restart failed!"; exit 1; }

echo "Deployment complete!"
