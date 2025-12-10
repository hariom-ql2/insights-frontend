#!/bin/bash
set -e

# Get API base URL from environment variable (default to /api for nginx proxy)
API_BASE_URL=${VITE_API_BASE_URL:-/api}

echo "Injecting API_BASE_URL: $API_BASE_URL"

echo "Replacing API URLs in built files..."

# Replace all variations of localhost:5001 and http://localhost:5001 with relative /api path
# This allows nginx to proxy requests to the backend service
# Also handle template literals and various quote styles
find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i \
    -e "s|http://localhost:5001|${API_BASE_URL}|g" \
    -e "s|https://localhost:5001|${API_BASE_URL}|g" \
    -e "s|http://insights-backend.insights-backend.svc.cluster.local:80|${API_BASE_URL}|g" \
    -e "s|localhost:5001|${API_BASE_URL}|g" \
    -e "s|'http://localhost:5001'|\"${API_BASE_URL}\"|g" \
    -e "s|\"http://localhost:5001\"|\"${API_BASE_URL}\"|g" \
    -e "s|\`http://localhost:5001\`|\`${API_BASE_URL}\`|g" \
    -e "s|'http://insights-backend.insights-backend.svc.cluster.local:80'|\"${API_BASE_URL}\"|g" \
    -e "s|\"http://insights-backend.insights-backend.svc.cluster.local:80\"|\"${API_BASE_URL}\"|g" \
    -e "s|\`http://insights-backend.insights-backend.svc.cluster.local:80\`|\`${API_BASE_URL}\`|g" \
    {} \;

echo "API URL injection complete. Starting nginx..."

# Test nginx configuration
nginx -t

# Start nginx in foreground
exec nginx -g "daemon off;"

