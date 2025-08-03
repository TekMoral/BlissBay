#!/bin/bash
# Test Script for verifying the Dockerized services on Windows (using Git Bash)
# This script uses a helper function to prepend winpty to docker exec commands if needed.

set -e

# Helper function: If winpty is available, use it.
docker_exec() {
  if command -v winpty &>/dev/null; then
    winpty docker exec "$@"
  else
    docker exec "$@"
  fi
}

echo "=============================================="
echo "1. Testing MongoDB Replica Set Configuration"
docker_exec mongo1_test mongosh --quiet --eval "rs.status()"
echo "=============================================="
sleep 2

echo "=============================================="
echo "2. Testing Backend API Communication"
# Replace "/api/health" with a valid endpoint if available.
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)
echo "Backend HTTP status: $HTTP_STATUS"
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "Backend API is running successfully."
else
  echo "Backend API did not respond as expected."
fi
echo "=============================================="
sleep 2

echo "=============================================="
echo "3. Testing Frontend Service"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "Frontend HTTP status: $HTTP_STATUS"
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "Frontend is serving built files correctly."
else
  echo "Frontend is not accessible."
fi
echo "=============================================="

echo "All tests completed."  
============================="
echo "3. Testing Frontend Service"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "Frontend HTTP status: $HTTP_STATUS"
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "Frontend is serving built files correctly."
else
  echo "Frontend is not accessible."
fi
echo "=============================================="

echo "All tests completed."  
