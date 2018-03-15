%define __spec_install_pre /bin/true

Name: boundless-server-gs-gdal
Version: REPLACE_VERSION
Release: REPLACE_RELEASE
Summary: Boundless Server GDAL Plugin
Group: Applications/Engineering
License: GPLv2
URL: http://geoserver.org
BuildRoot: %{_WORKSPACE}/boundless-server-gs-gdal/BUILDROOT
Requires(post): bash
Requires(preun): bash
Requires:  unzip, boundless-server-geoserver >= CURRENT_VER, boundless-server-geoserver < NEXT_VER
Requires:  gdal >= 1.11.5, gdal < 2.0.0, gdal-devel >= 1.11.5, gdal-devel < 2.0.0
Requires:  gdal-java >= 1.11.5, gdal-java < 2.0.0, gdal-python >= 1.11.5, gdal-python < 2.0.0
Requires:  proj-devel >= 4.8.0, proj-devel < 4.9
Obsoletes: suite-gs-gdal
Conflicts: suite-gs-gdal
AutoReqProv: no

%define _rpmdir archive/el/6/
%define _rpmfilename %%{NAME}-%%{VERSION}-%%{RELEASE}.%%{ARCH}.rpm
%define _unpackaged_files_terminate_build 0
# Don't waste time re-packing jars (http://makewhatis.com/2011/12/remove-unwanted-commpression-in-during-rpmbuild-for-jar-files)
%define __os_install_post %{nil}


%description
GDAL plugin for Boundless Server.

%prep

%install
mkdir -p %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib
cp -p %{_WORKSPACE}/SRC/BoundlessServer-ext/gdal/*.jar %{buildroot}/opt/boundless/server/geoserver/WEB-INF/lib

%pre

%post
if [ -f /usr/share/java/gdal.jar ]; then
  cp -f /usr/share/java/gdal.jar /opt/boundless/server/geoserver/WEB-INF/lib/gdal.jar
  chown root:root /opt/boundless/server/geoserver/WEB-INF/lib/gdal.jar
fi
if [ -f /etc/os-release ]; then
  if ! grep -q '/usr/lib/jni' /etc/tomcat8/java-libs ; then
    echo "/usr/lib/jni" >> /etc/tomcat8/java-libs
  fi
fi

%preun

%postun
if [ "$1" = "0" ] || [ "$1" = "remove" ]; then
  rm -f /opt/boundless/server/geoserver/WEB-INF/lib/gdal.jar
  if [ -f /etc/os-release ]; then
    if [ `gawk -F= '/^NAME/{print $2}' /etc/os-release | sed 's/"//g'` = "Ubuntu" ]; then
      sed -i '\|/usr/lib/jni|d' /etc/tomcat8/java-libs
    fi
  fi
fi

%files
%defattr(-,root,root,-)
/opt/boundless/server/geoserver/WEB-INF/lib/*
