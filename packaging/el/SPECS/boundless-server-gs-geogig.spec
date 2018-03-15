%define __spec_install_pre /bin/true

Name: boundless-server-gs-geogig
Version: REPLACE_VERSION
Release: REPLACE_RELEASE
Summary: Boundless Server GeoGig Plugin
Group: Applications/Engineering
License: GPLv2
URL: http://geoserver.org
BuildRoot: %{_WORKSPACE}/boundless-server-gs-geogig/BUILDROOT
Requires(post): bash
Requires(preun): bash
Requires:  unzip, boundless-server-geoserver >= CURRENT_VER, boundless-server-geoserver < NEXT_VER
Obsoletes: suite-gs-geogig
Conflicts: suite-gs-geogig
AutoReqProv: no

%define _rpmdir archive/el/6/
%define _rpmfilename %%{NAME}-%%{VERSION}-%%{RELEASE}.%%{ARCH}.rpm
%define _unpackaged_files_terminate_build 0
# Don't waste time re-packing jars (http://makewhatis.com/2011/12/remove-unwanted-commpression-in-during-rpmbuild-for-jar-files)
%define __os_install_post %{nil}


%description
GeoPackage plugin for Boundless Server.

%prep

%install
mkdir -p %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib

jars="geogig-api-*.jar
geogig-cli-*.jar
geogig-core-*.jar
geogig-datastore-*.jar
geogig-geotools-*.jar
geogig-postgres-*.jar
geogig-remoting-*.jar
geogig-rocksdb-*.jar
geogig-web-api-*.jar
gs-geogig-*.jar
guice-4.0-no_aop.jar
guice-multibindings-4.0.jar
HikariCP-2.4.2.jar
jansi-1.11.jar
javax.inject-1.jar
javax.json-1.0.4.jar
logback-classic-1.1.2.jar
logback-core-1.1.2.jar
lz4-1.3.0.jar
org.eclipse.jdt.annotation-*.jar
rocksdbjni-*.jar"

for jar in $jars; do
  cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/geogig/$jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib
done

%pre

%post

%preun

%postun

%files
%defattr(-,root,root,-)
/opt/boundless/server/geoserver/WEB-INF/lib/*
