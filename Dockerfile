FROM node:22.3.0 AS builder
WORKDIR /usr/src/app

ARG GIT_COMMIT
ARG GIT_REF
ARG GIT_COMMIT_DATE
ARG GIT_COMMIT_NUMBER

COPY applications/ applications/
COPY services/ services/
COPY packages/ packages/
COPY .npmrc cloudflare.build.sh package-lock.json package.json turbo.json ./

# Build app
RUN --mount=type=cache,target=/root/.npm \
  DO_BUILD_BACKEND=true \
  BASE_PATH=/_BASE_PATH_DOCKER_REPLACE__ \
  BACKEND=/_BASE_PATH_DOCKER_REPLACE__/api \
  GIT_COMMIT=$GIT_COMMIT \
  GIT_REF=$GIT_REF \
  GIT_COMMIT_DATE=$GIT_COMMIT_DATE \
  GIT_COMMIT_NUMBER=$GIT_COMMIT_NUMBER \
    sh ./cloudflare.build.sh

# Final stage
FROM node:22.3.0 AS node

WORKDIR /usr/src/app

# Install Prisma for database migrations
RUN --mount=type=cache,target=/root/.npm npm i -g prisma && \
  chmod -R a+rwx /usr/local/lib/node_modules/prisma

COPY --chmod=777 ./docker/ws/docker-entrypoint.sh ./docker/ws/docker-healthcheck.sh .

RUN chmod a+rwx /usr/src/app && mkdir /usr/src/app/database && chmod a+rwx /usr/src/app/database

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
COPY --from=builder /usr/src/app/.dist /usr/src/app/html-template

USER 1000:1000
VOLUME /usr/src/app/database
EXPOSE 80
HEALTHCHECK CMD ./docker-healthcheck.sh
ENTRYPOINT ["./docker-entrypoint.sh"]