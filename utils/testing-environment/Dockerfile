FROM node:16-buster
WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get install -y libxml2-utils python3-pip openjdk-11-jre
RUN npm install i -g xslt3
RUN pip3 install Pygments
RUN wget https://dlcdn.apache.org/jena/binaries/apache-jena-4.4.0.tar.gz
RUN tar -zxf apache-jena-4.4.0.tar.gz -C /usr/local
RUN rm apache-jena-4.4.0.tar.gz
ENV JENA_HOME=/usr/local/apache-jena-4.4.0
ENV PATH="/usr/local/apache-jena-4.4.0/bin:${PATH}"


# Install dataspacecer cli (you need to build the project first)
COPY dataspecer /bin/dataspecer

ENTRYPOINT []
CMD ["bash"]
