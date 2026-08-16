#!/bin/bash
set -e

cd /app/backend
npx prisma migrate deploy
node dist/main.js &
BACKEND_PID=$!

cd /app/frontend
npx next start -p 3000 &
FRONTEND_PID=$!

envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/sites-enabled/default
nginx -g "daemon off;" &
NGINX_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID $NGINX_PID 2>/dev/null" TERM INT
wait -n $BACKEND_PID $FRONTEND_PID $NGINX_PID
