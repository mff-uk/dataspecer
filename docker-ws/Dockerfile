FROM node:22.3.0 AS builder
WORKDIR /usr/src/app

COPY applications/ applications/
COPY services/ services/
COPY packages/ packages/
COPY docker-ws/ docker-ws/
COPY .npmrc cloudflare.build.sh package-lock.json package.json turbo.json ./

# Build app
RUN --mount=type=cache,target=/root/.npm \
  DO_BUILD_BACKEND=true \
  BASE_PATH=/_BASE_PATH_DOCKER_REPLACE__ \
  BACKEND=/_BASE_PATH_DOCKER_REPLACE__/api \
    sh ./cloudflare.build.sh

# Final stage
FROM node:22.3.0 AS node
FROM nginx:1.27.1 AS nginx

RUN apt-get update && apt-get install sudo

WORKDIR /usr/src/app

# Copy nodejs binaries from one container to another
COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

# Install Prisma for database migrations
RUN --mount=type=cache,target=/root/.npm npm i -g prisma && \
  chmod -R a+rwx /usr/local/lib/node_modules/prisma

# Configure nginx
COPY --chmod=777 ./docker-ws/nginx.conf /etc/nginx/nginx.conf-template
RUN chmod -R a+rwx /etc/nginx/

COPY --chmod=777 ./docker-ws/docker-entrypoint.sh ./docker-ws/docker-healthcheck.sh .

RUN chmod a+rwx /usr/share/nginx/html && mkdir /usr/src/app/database && chmod a+rwx /usr/src/app/database

# Copy backend service
COPY --from=builder /usr/src/app/node_modules/.prisma/client/*.so.node /usr/src/app/dist/
COPY --from=builder /usr/src/app/services/backend/dist/backend-bundle.js /usr/src/app/dist/
COPY --from=builder /usr/src/app/services/backend/prisma/ /usr/src/app/dist
COPY services/backend/main.config.sample.js /usr/src/app/main.config.js

# Run prisma migrate to apply migrations to local database
RUN mkdir -p /usr/src/app/database && \
  npx prisma migrate deploy --schema dist/schema.prisma && \
  chmod -R a+rwx /usr/src/app/database

# Copy frontend
COPY --from=builder /usr/src/app/.dist /usr/share/nginx/html-template

EXPOSE 80
HEALTHCHECK CMD ./docker-healthcheck.sh
ENTRYPOINT ["./docker-entrypoint.sh"]