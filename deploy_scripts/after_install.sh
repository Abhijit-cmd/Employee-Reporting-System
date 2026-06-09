#!/bin/bash

set -e

APP_DIR="/var/www/ers.constromat.com/public_html"

cd $APP_DIR

if [ -f .env ]; then
    chmod 600 .env
fi

echo "Installing backend dependencies..."

npm ci --omit=dev

echo "Installing frontend dependencies..."

cd client

npm ci

echo "Building React frontend..."

npm run build

cd ..

echo "Generating Prisma client..."

npx prisma generate

echo "Running database migrations..."

npx prisma migrate deploy