# BUILD STAGE
FROM node:18-alpine AS builder

WORKDIR /usr/src/app
COPY applications/client applications/client
COPY packages packages
COPY schemas schemas
COPY .npmrc package-lock.json package.json .

RUN npm instal

RUN npx turbo run build --filter client

# RELEASE STAGE
FROM nginx:alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/applications/client/build /usr/share/nginx/html