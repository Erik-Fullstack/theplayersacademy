#!/bin/sh

set -e
echo "database is running..."
RETRIES=0
MAX_RETRIES=20
while [ "$RETRIES" -lt "$MAX_RETRIES" ]; do
    if nc -z -v -w5 group7 5432; then
        break
    fi
    echo "Waiting for database to be ready..."
    sleep 2
    RETRIES=$((RETRIES + 1))
    if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
        echo "Database is not ready after $RETRIES attempts. Exiting."
        exit 1
    fi
done

echo "Database is ready."

echo "Running Prisma migration..."
npx prisma migrate deploy

echo "Starting app..."

exec npm start
