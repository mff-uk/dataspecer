# Docker testing environment

The purpose of the environment is to test generated artifacts. One possible example would be to create an XML document, validate it against the schema, perform lifting, and then the lowering. The environment should contain all necessary tools to easily test the artifacts, such as XML validators, JSON schema validators, etc. The cli will be included to easily generate artifacts inside the container.

Please keep in mind that this is still an experimental feature. More details are in the [Github discussion](https://github.com/mff-uk/dataspecer/discussions/183).

To build the Docker image, execute
```shell
sudo docker build -t dataspecer .
```

To execute a shell script `script.sh` in context of current working directory, use:
```shell
sudo docker run -i --rm -v "$PWD":/usr/src/app dataspecer < script.sh
```
