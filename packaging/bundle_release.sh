#!/bin/bash

VERSION=1.0.2
TOMCAT_VERSION=8.0.47
BRANDING=boundless-server
STAGE=/tmp/foo
EL6_STAGE=${STAGE}/el/6/x86_64
EL7_STAGE=${STAGE}/el/7/x86_64
TRUSTY_STAGE=${STAGE}/ubuntu/deb
WAR_STAGE=${STAGE}/wars

if [ -d $STAGE ]; then
  rm -rf $STAGE
fi

mkdir -p $EL6_STAGE
mkdir -p $EL7_STAGE
mkdir -p $TRUSTY_STAGE
mkdir -p $WAR_STAGE

PKGS="composer \
dashboard \
docs \
geoserver \
geowebcache \
gs-appschema \
gs-arcsde \
gs-cloudwatch \
gs-cluster \
gs-csw \
gs-db2 \
gs-gdal \
gs-geogig \
gs-geomesa-accumulo \
gs-geopkg \
gs-grib \
gs-gsr \
gs-inspire \
gs-jdbcconfig \
gs-jdbcstore \
gs-jp2k \
gs-mongodb \
gs-netcdf \
gs-netcdf-out \
gs-oracle \
gs-printng \
gs-script \
gs-sqlserver \
gs-vectortiles \
wpsbuilder \
quickview"

# Grab products
for PACKAGE in $PKGS; do
  PKG_FILE_EL6=`ls /var/www/repo/suite/stable/el/6/${BRANDING}-${PACKAGE}-${VERSION}* | sort -rV | head -1`
  PKG_FILE_EL7=`ls /var/www/repo/suite/stable/el/7/${BRANDING}-${PACKAGE}-${VERSION}* | sort -rV | head -1`
  PKG_FILE_TRUSTY=`ls /var/www/repo/suite/stable/ubuntu/14/${BRANDING}-${PACKAGE}_${VERSION}* | sort -rV | head -1`
  cp -p $PKG_FILE_EL6 $EL6_STAGE
  cp -p $PKG_FILE_EL7 $EL7_STAGE
  cp -p $PKG_FILE_TRUSTY $TRUSTY_STAGE
done

# Grab tomcat
TOMCATS="tomcat8 tomcat8-manager"
for PACKAGE in $TOMCATS; do
  PKG_FILE_EL6=`ls /var/www/repo/suite/stable/el/6/${BRANDING}-${PACKAGE}-${TOMCAT_VERSION}* | sort -rV | head -1`
  PKG_FILE_EL7=`ls /var/www/repo/suite/stable/el/7/${BRANDING}-${PACKAGE}-${TOMCAT_VERSION}* | sort -rV | head -1`
  PKG_FILE_TRUSTY=`ls /var/www/repo/suite/stable/ubuntu/14/${BRANDING}-${PACKAGE}_${TOMCAT_VERSION}* | sort -rV | head -1`
  cp -p $PKG_FILE_EL6 $EL6_STAGE
  cp -p $PKG_FILE_EL7 $EL7_STAGE
  cp -p $PKG_FILE_TRUSTY $TRUSTY_STAGE
done

# Grab dependencies
for i in `find /var/www/repo/suite/stable/el/6/ -name *.rpm | grep -v ${BRANDING}`; do
  cp -p $i $EL6_STAGE
done
for i in `find /var/www/repo/suite/stable/el/7/ -name *.rpm | grep -v ${BRANDING}`; do
  cp -p $i $EL7_STAGE
done
for i in `find /var/www/repo/suite/stable/ubuntu/14/ -name *.deb | grep -v ${BRANDING}`; do
  cp -p $i $TRUSTY_STAGE
done

# Grab group descriptors
cp -p /var/www/repo/suite/stable/el/6/*.xml $EL6_STAGE
cp -p /var/www/repo/suite/stable/el/7/*.xml $EL7_STAGE

# Grab WARs
cp -p /var/www/repo/suite/stable/war/* $WAR_STAGE
