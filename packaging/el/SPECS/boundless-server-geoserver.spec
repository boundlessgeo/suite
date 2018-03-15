%define __spec_install_pre /bin/true

Name: boundless-server-geoserver
Version: REPLACE_VERSION
Release: REPLACE_RELEASE
Summary: High performance, standards-compliant map and geospatial data server.
Group: Applications/Engineering
License: GPLv2
URL: https://boundlessgeo.com/boundless-gis-platform/
BuildRoot: %{_WORKSPACE}/boundless-server-geoserver/BUILDROOT
Requires(post): bash
Requires(preun): bash
Requires:  unzip, boundless-server-tomcat8 >= 8.0.42, boundless-server-tomcat8 < 8.1, libjpeg-turbo-official = 1.4.2, dejavu-sans-mono-fonts
Conflicts: geoserver, suite-geoserver, suite-gs-mbtiles, suite-gs-wps
Obsoletes: suite-geoserver, suite-gs-mbtiles, suite-gs-wps
AutoReqProv: no

%define _rpmdir archive/el/6/
%define _rpmfilename %%{NAME}-%%{VERSION}-%%{RELEASE}.%%{ARCH}.rpm
%define _unpackaged_files_terminate_build 0
# Don't waste time re-packing jars (http://makewhatis.com/2011/12/remove-unwanted-commpression-in-during-rpmbuild-for-jar-files)
%define __os_install_post %{nil}


%description
GeoServer is an open source software server written in Java that allows users
to share and edit geospatial data. Designed for interoperability, it
publishes data from any major spatial data source using open standards such as
Web Features Server (WFS), Web Map Server (WMS), and Web Coverage Server
(WCS).  This version of GeoServer is enhanced and designed for use with the
Boundless Server.

%prep

%install
# Add Geoserver
mkdir -p %{buildroot}/opt/boundless/server/geoserver
unzip %{_WORKSPACE}/SRC/BoundlessServer-war/geoserver.war -d %{buildroot}/opt/boundless/server/geoserver

# Add Data Dir
mkdir -p %{buildroot}/var/opt/boundless/server/geoserver/data/
cp %{_WORKSPACE}/SRC/BoundlessServer-war/boundless-server-data-dir.zip %{buildroot}/var/opt/boundless/server/geoserver/data-dir.zip

# Add tomcat context description files
mkdir -p %{buildroot}/etc/tomcat8/Catalina/localhost/
cp %{_WORKSPACE}/suite/packaging/tomcat-context/geoserver.xml %{buildroot}/etc/tomcat8/Catalina/localhost/
cp %{_WORKSPACE}/suite/packaging/tomcat-context/geoserver.xml %{buildroot}/etc/tomcat8/Catalina/localhost/geoserver.xml.new

# Move docs
mkdir -p %{buildroot}/usr/share/doc/
mv %{buildroot}/opt/boundless/server/geoserver/doc %{buildroot}/usr/share/doc/boundless-server-geoserver

%pre
if [ -f /etc/tomcat8/Catalina/localhost/geoserver.xml ]; then
  cp -pf /etc/tomcat8/Catalina/localhost/geoserver.xml /etc/tomcat8/Catalina/localhost/geoserver.xml.orig
fi

%post
if [ ! -d /var/opt/boundless/server/geoserver/data/ ]; then
  mkdir -p /var/opt/boundless/server/geoserver/data/
  unzip -o /var/opt/boundless/server/geoserver/data-dir.zip -d /var/opt/boundless/server/geoserver/data/ 2>&1 > /dev/null
fi
if [ ! -d /var/opt/boundless/server/geoserver/tilecache/ ]; then
  mkdir -p /var/opt/boundless/server/geoserver/tilecache/
fi
if [ ! -f /etc/tomcat8/server-opts/geoserver ]; then
  echo "-Dorg.geotools.referencing.forceXY=true -XX:SoftRefLRUPolicyMSPerMB=36000 -Dorg.geotools.coverage.jaiext.enabled=true" > /etc/tomcat8/server-opts/geoserver
fi
if [ ! -L /var/log/boundless/server/geoserver/logs ]; then
  mkdir -p /var/log/boundless/server/geoserver/
  ln -s /var/opt/boundless/server/geoserver/data/logs /var/log/boundless/server/geoserver/
fi
chown -R root:root /opt/boundless/
chown -R tomcat8:tomcat8 /var/opt/boundless/
chown -R tomcat8:tomcat8 /var/log/boundless/

%preun

%postun
if [ "$1" = "0" ] || [ "$1" = "remove" ]; then
  if [ -d /opt/boundless/server/geoserver ]; then
    for dir in `find /opt/boundless/server/geoserver -type d -exec bash -c '[ "x\`find "{}" -maxdepth 1 -type f\`" = x ] && echo "{}"' \; | sort -r`; do
      rm -rf $dir
    done
  fi
  if [ -f /etc/tomcat8/Catalina/localhost/geoserver.xml ]; then
    rm -f /etc/tomcat8/Catalina/localhost/geoserver.xml
  fi
  rm -f /var/lib/dpkg/info/boundless-server-geoserver.* 2>&1 > /dev/null
fi

%files
%defattr(-,root,root,-)
%config(noreplace) /etc/tomcat8/Catalina/localhost/geoserver.xml
%docdir /usr/share/doc/boundless-server-geoserver
/opt/boundless/server/geoserver
/etc/tomcat8/Catalina/localhost/geoserver.xml.new
/var/opt/boundless/server/geoserver/data-dir.zip
