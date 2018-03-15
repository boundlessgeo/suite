FROM ubuntu:trusty
MAINTAINER Nick Stires<nstires@boundlessgeo.com>
# Forked from https://github.com/boundlessgeo/docker/tree/master/suite-desktop-testing/suite-410/ubuntu
# Internal use only

# Let the conatiner know that there is no tty
ENV DEBIAN_FRONTEND noninteractive

# Upgrade installed packages and install some basics
RUN apt-get -y update \
  && apt-get -y upgrade \
  && apt-get install -y --no-install-recommends \
       unzip vim nano wget git ca-certificates apt-transport-https libyajl2

# Add Boundless gpg.key and customized repo source, then update repos
RUN echo "deb http://suite:B0und1e55%2123@priv-repo.boundlessgeo.com/suite/REPLACE_VERSION/ubuntu/14/ ./" > \
   /etc/apt/sources.list.d/boundless.list


# Install suite
RUN apt-get -y update && apt-get -y --force-yes install \
        boundless-server-geoserver \
        boundless-server-tomcat8 \
        boundless-server-composer \
        boundless-server-quickview \
        boundless-server-geowebcache \
        boundless-server-docs \
        boundless-server-dashboard 

# Install suite extras
RUN apt-get -y update && apt-get -y --force-yes install \
        boundless-server-gs-gdal \
        boundless-server-gs-vectortiles
 

RUN apt-get install -y supervisor \
  && mkdir -p /var/log/supervisor

# Clean up apt-get
RUN apt-get clean

# Fix for nano
ENV TERM xterm

RUN mkdir -p /tmp/tomcat && mkdir /tmp/geoserver && mkdir /tmp/postgresql

# Tomcat setup
#ADD resources/tomcat/* /tmp/tomcat/
#RUN /tmp/tomcat/tomcat-build.sh

# GeoServer setup
#ADD resources/geoserver/* /tmp/geoserver/
#RUN /tmp/geoserver/geoserver-build.sh

# Enable CORS
RUN sed -i '\:</web-app>:i\
    <filter>\
        <filter-name>CorsFilter</filter-name>\
        <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>\
    </filter>\
\
    <filter-mapping>\
        <filter-name>CorsFilter</filter-name>\
        <url-pattern>/*</url-pattern>\
    </filter-mapping>\
\
    <init-param>\
        <param-name>cors.support.credentials</param-name>\
        <param-value>true</param-value>\
    </init-param>' /etc/tomcat8/web.xml

# Copy supervisord configuration
ADD resources/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# for pg: 5432
EXPOSE 8080 8443

RUN rm -rf /var/lib/apt/lists/*

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
