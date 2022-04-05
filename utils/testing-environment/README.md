# Docker testing environment

Use `docker build -t dataspecer .` to build the testing environment image.

To execute a shell script in context of current working directory, use:
```bash
docker run -i --rm -v "$PWD":/usr/src/app dataspecer < example.sh
```
