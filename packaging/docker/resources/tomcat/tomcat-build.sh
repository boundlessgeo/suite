#!/bin/bash

set -e

TC_ETC_DIR=/etc/tomcat8


# Configure SSL/wildcard for Tomcat
pushd /tmp/tomcat

  cat server.xml > $TC_ETC_DIR/server.xml
  cp boundless-test-wildcard.jks $TC_ETC_DIR/
  chmod 0640 $TC_ETC_DIR/boundless-test-wildcard.jks
  chgrp tomcat8 $TC_ETC_DIR/boundless-test-wildcard.jks

popd

# Configure CORS for Tomcat
pushd /tmp/tomcat

  cat web.xml > $TC_ETC_DIR/web.xml

popd
