%define __spec_install_pre /bin/true

Name: boundless-server-docs
Version: REPLACE_VERSION
Release: REPLACE_RELEASE
Summary: Tool for creating, styling, and publishing maps.
Group: Applications/Engineering
License: Boundless Spatial Inc.
URL: https://boundlessgeo.com/boundless-gis-platform/
BuildRoot: %{_WORKSPACE}/boundless-server-docs/BUILDROOT
Requires(post): bash
Requires(preun): bash
Requires:  unzip, boundless-server-tomcat8 >= 8.0.42, boundless-server-tomcat8 < 8.1
Conflicts: opengeo-docs, suite-docs
Obsoletes: suite-docs
AutoReqProv: no

%define _rpmdir archive/el/6/
%define _rpmfilename %%{NAME}-%%{VERSION}-%%{RELEASE}.%%{ARCH}.rpm
%define _unpackaged_files_terminate_build 0
# Don't waste time re-packing jars (http://makewhatis.com/2011/12/remove-unwanted-commpression-in-during-rpmbuild-for-jar-files)
%define __os_install_post %{nil}


%description
Boundless Server documentation.

%prep

%install
mkdir -p %{buildroot}/opt/boundless/server/docs/
unzip %{_WORKSPACE}/SRC/BoundlessServer-war/boundless-server-docs.war -d %{buildroot}/opt/boundless/server/docs/

mkdir -p %{buildroot}/etc/tomcat8/Catalina/localhost/
cp %{_WORKSPACE}/suite/packaging/tomcat-context/boundless-server-docs.xml %{buildroot}/etc/tomcat8/Catalina/localhost/
cp %{_WORKSPACE}/suite/packaging/tomcat-context/boundless-server-docs.xml %{buildroot}/etc/tomcat8/Catalina/localhost/boundless-server-docs.xml.new

mkdir -p %{buildroot}/usr/share/doc/
mv %{buildroot}/opt/boundless/server/docs/doc %{buildroot}/usr/share/doc/boundless-server-docs

%pre
if [ -f /etc/tomcat8/Catalina/localhost/boundless-server-docs.xml ]; then
  cp -pf /etc/tomcat8/Catalina/localhost/boundless-server-docs.xml /etc/tomcat8/Catalina/localhost/boundless-server-docs.xml.orig
fi

%post
chown -R root:root /opt/boundless/

%preun

%postun
if [ "$1" = "0" ] || [ "$1" = "remove" ]; then
  if [ -d /opt/boundless/server/docs ]; then
    for dir in `find /opt/boundless/server/docs -type d -exec bash -c '[ "x\`find "{}" -maxdepth 1 -type f\`" = x ] && echo "{}"' \; | sort -r`; do
      rm -rf $dir
    done
  fi
  if [ -f /etc/tomcat8/Catalina/localhost/boundless-server-docs.xml ]; then
    rm -f /etc/tomcat8/Catalina/localhost/boundless-server-docs.xml
  fi
  rm -f /var/lib/dpkg/info/boundless-server-docs.* 2>&1 > /dev/null
fi

%files
%defattr(-,root,root,-)
%config(noreplace) /etc/tomcat8/Catalina/localhost/boundless-server-docs.xml
%docdir /usr/share/doc/boundless-server-docs
/opt/boundless/server/docs
/etc/tomcat8/Catalina/localhost/boundless-server-docs.xml.new
