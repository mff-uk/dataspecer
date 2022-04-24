FROM node:16-buster
WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get install -y libxml2-utils python3-pip
RUN npm install i -g xslt3
RUN pip3 install Pygments

# Install dataspacecer cli (you need to build the project first)
COPY dataspecer /bin/dataspecer

ENTRYPOINT []
CMD ["bash"]
