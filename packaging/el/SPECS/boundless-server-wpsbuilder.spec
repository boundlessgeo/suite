%define __spec_install_pre /bin/true

Name: boundless-server-wpsbuilder
Version: REPLACE_VERSION
Release: REPLACE_RELEASE
Summary: Web Processing Service Builder for GeoServer.
Group: Applications/Engineering
License: GPLv2
BuildRoot: %{_WORKSPACE}/boundless-server-wpsbuilder/BUILDROOT
Requires(post): bash
Requires(preun): bash
Requires:  unzip, boundless-server-geoserver >= CURRENT_VER, boundless-server-geoserver < NEXT_VER
Conflicts: opengeo-wpsbuilder, suite-wpsbuilder
Obsoletes: suite-wpsbuilder
AutoReqProv: no

%define _rpmdir archive/el/6/
%define _rpmfilename %%{NAME}-%%{VERSION}-%%{RELEASE}.%%{ARCH}.rpm
%define _unpackaged_files_terminate_build 0
# Don't waste time re-packing jars (http://makewhatis.com/2011/12/remove-unwanted-commpression-in-during-rpmbuild-for-jar-files)
%define __os_install_post %{nil}


%description
The GeoServer WPS builder adds processing capabilities to GeoServer.

%prep

%install
mkdir -p %{buildroot}/opt/boundless/server
unzip %{_WORKSPACE}/SRC/BoundlessServer-war/wpsbuilder.war -d %{buildroot}/opt/boundless/server/wpsbuilder/

mkdir -p %{buildroot}/etc/tomcat8/Catalina/localhost/
cp %{_WORKSPACE}/suite/packaging/tomcat-context/wpsbuilder.xml %{buildroot}/etc/tomcat8/Catalina/localhost/
cp %{_WORKSPACE}/suite/packaging/tomcat-context/wpsbuilder.xml %{buildroot}/etc/tomcat8/Catalina/localhost/wpsbuilder.xml.new

mkdir -p %{buildroot}/usr/share/doc/
mv %{buildroot}/opt/boundless/server/wpsbuilder/doc %{buildroot}/usr/share/doc/boundless-server-wpsbuilder

%pre
if [ -f /etc/tomcat8/Catalina/localhost/wpsbuilder.xml ]; then
  cp -pf /etc/tomcat8/Catalina/localhost/wpsbuilder.xml /etc/tomcat8/Catalina/localhost/wpsbuilder.xml.orig
fi

%post
chown -R root:root /opt/boundless/

%preun

%postun
if [ "$1" = "0" ] || [ "$1" = "remove" ]; then
  if [ -d /opt/boundless/server/wpsbuilder ]; then
    for dir in `find /opt/boundless/server/wpsbuilder -type d -exec bash -c '[ "x\`find "{}" -maxdepth 1 -type f\`" = x ] && echo "{}"' \; | sort -r`; do
      rm -rf $dir
    done
  fi
  if [ -f /etc/tomcat8/Catalina/localhost/wpsbuilder.xml ]; then
    rm -f /etc/tomcat8/Catalina/localhost/wpsbuilder.xml
  fi
  rm -f /var/lib/dpkg/info/boundless-server-wpsbuilder.* 2>&1 > /dev/null
fi

%files
%defattr(-,root,root,-)
%config(noreplace) /etc/tomcat8/Catalina/localhost/wpsbuilder.xml
%docdir /usr/share/doc/boundless-server-wpsbuilder
/opt/boundless/server/wpsbuilder
/etc/tomcat8/Catalina/localhost/wpsbuilder.xml.new
