%define __spec_install_pre /bin/true

Name: boundless-server-gs-netcdf
Version: REPLACE_VERSION
Release: REPLACE_RELEASE
Summary: Boundless Server NetCDF Plugin - In
Group: Applications/Engineering
License: GPLv2
URL: http://geoserver.org
BuildRoot: %{_WORKSPACE}/boundless-server-gs-netcdf/BUILDROOT
Requires(post): bash
Requires(preun): bash
Requires:  unzip, boundless-server-geoserver >= CURRENT_VER, boundless-server-geoserver < NEXT_VER
Obsoletes: suite-gs-netcdf
Conflicts: suite-gs-netcdf
AutoReqProv: no

%define _rpmdir archive/el/6/
%define _rpmfilename %%{NAME}-%%{VERSION}-%%{RELEASE}.%%{ARCH}.rpm
%define _unpackaged_files_terminate_build 0
# Don't waste time re-packing jars (http://makewhatis.com/2011/12/remove-unwanted-commpression-in-during-rpmbuild-for-jar-files)
%define __os_install_post %{nil}


%description
NetCDF plugin for Boundless Server.

%prep

%install
mkdir -p %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib
cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/netcdf/jdom2-*.jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib
cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/netcdf/opendap-*.jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib
cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/netcdf/cdm-*.jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib
cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/netcdf/gs-netcdf-*.jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib
cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/netcdf/gt-coverage-api-*.jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib
cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/netcdf/gt-netcdf-*.jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib
cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/netcdf/httpservices-*.jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib
cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/netcdf/jcip-annotations-*.jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib
cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/netcdf/netcdf4-*.jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib
cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/netcdf/udunits-*.jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib

cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/netcdf-out/jna-*.jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib

%pre

%post
if ! grep -q '/usr/lib/x86_64-linux-gnu' /etc/tomcat8/java-libs ; then
  echo "/usr/lib/x86_64-linux-gnu" >> /etc/tomcat8/java-libs
fi

%preun

%postun
if [ "$1" = "0" ] || [ "$1" = "remove" ]; then
  sed -i '\|/usr/lib/x86_64-linux-gnu|d' /etc/tomcat8/java-libs
fi

%files
%defattr(-,root,root,-)
/opt/boundless/server/geoserver/WEB-INF/lib/*
