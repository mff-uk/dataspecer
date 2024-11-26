FROM node:18-bullseye
WORKDIR /usr/src/app

# Prerequisites
RUN apt-get update

# XML - for XSD validation and XSLT transformation
RUN apt-get install -y libxml2-utils
RUN npm install i -g xslt3

# Apache Jena (e.g. riot for transformations among RDF serializations)
RUN apt-get install -y openjdk-17-jre
RUN wget https://dlcdn.apache.org/jena/binaries/apache-jena-4.5.0.tar.gz
RUN tar -zxf apache-jena-4.5.0.tar.gz -C /usr/local
RUN rm apache-jena-4.5.0.tar.gz
ENV JENA_HOME=/usr/local/apache-jena-4.5.0
ENV PATH="/usr/local/apache-jena-4.5.0/bin:${PATH}"

# rdf-tabular for CSV on the Web validation and transformation
RUN apt-get install -y ruby
RUN gem install rdf-tabular
RUN gem install rdf-turtle

# Syntax highlight
RUN apt-get install -y python3-pip
RUN pip3 install Pygments

ENTRYPOINT []
CMD ["bash"]
