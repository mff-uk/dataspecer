#!/bin/sh

URL="http://localhost/api/data-specification"

response=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ "$response" -eq 200 ]; then
  echo "Health check passed"
  exit 0
else
  echo "Health check failed"
  exit 1
fi