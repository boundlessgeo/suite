#!/bin/bash

set -e

GS_SECURITY=/var/opt/boundless/suite/geoserver/data/security

pushd /tmp/geoserver
  # Configure PKI for Suite's GeoServer
  cat config.xml > $GS_SECURITY/config.xml

  cat web.xml > /opt/boundless/suite/geoserver/WEB-INF/web.xml

  mkdir -p $GS_SECURITY/filter
  cp -Rv filter/cert $GS_SECURITY/filter/

  mkdir -p $GS_SECURITY/role/default
  cat role/default/roles.xml > $GS_SECURITY/role/default/roles.xml

  mkdir -p $GS_SECURITY/usergroup
  cp -Rv usergroup/cert-ugs $GS_SECURITY/usergroup/

  # Configure JSONP for Suite's GeoServer
  cat web.xml > /opt/boundless/suite/geoserver/WEB-INF/web.xml

  # Copy sample data
  cp *.tif /var/opt/boundless/suite/geoserver/data
  cp *.png /var/opt/boundless/suite/geoserver/data/styles
  
popd