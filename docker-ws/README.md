# Dataspecer web server as a Docker image

## Use instructions

- The container exposes port 80.
- Mount `/usr/src/app/database` directory to your local directory that would contain `database.db` file and `stores`. If the directory is empty, files would be created.
- If you want to run the Dataspecer under different user, use `USER` env variable with desired UID.
- You MUST specify full base URL using `BASE_URL` env. Some backend functionalities need to know the domain name and the relative subdirectory is also important. If you are using reverse proxy, it is expected that the base path *is preserved*. (For example, `https://example.com/dataspecer-instance-1/schema` should point to `http://localhost:3001/dataspecer-instance-1/schema`)

Use the following docker run command:
```bash
docker run -it --name dataspecer -eBASE_URL=http://localhost/ -eUSER=1000 --mount ./database:/usr/src/app/database -p80:80 ghcr.io/dataspecer/ws
```

Or use following docker-compose file
```yaml
services:
  dataspecer:
    image: ghcr.io/dataspecer/ws
    environment:
      BASE_URL: http://localhost
      USER: 1000
    ports:
      - 80:80 # Change the first number to your desired port
    volumes:
      - ./database:/usr/src/app/database
      #- ./main.config.js:/usr/src/main.config.js # Backend configuration
```

## Build instructions

This directory contains necessary files to build Docker image for the whole Dataspecer web server.

Run the following command from the parent (root) directory to build the image yourself:

```bash
docker build -t dataspecer -f docker-ws/Dockerfile .
```