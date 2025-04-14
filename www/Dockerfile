# Stage 1: Build the Hugo site
FROM node AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm ci && \
    npm run build

# Stage 2: Serve the site with Nginx
FROM nginxinc/nginx-unprivileged:alpine
USER nginx
COPY --from=builder /usr/src/app/public /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]