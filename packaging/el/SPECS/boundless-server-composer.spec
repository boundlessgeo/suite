%define __spec_install_pre /bin/true

Name: boundless-server-composer
Version: REPLACE_VERSION
Release: REPLACE_RELEASE
Summary: Tool for creating, styling, and publishing maps.
Group: Applications/Engineering
License: Boundless Spatial Inc.
URL: http://boundlessgeo.com/2014/12/composer/
BuildRoot: %{_WORKSPACE}/boundless-server-composer/BUILDROOT
Requires(post): bash
Requires(preun): bash
Requires:  unzip, boundless-server-geoserver >= CURRENT_VER, boundless-server-geoserver < NEXT_VER
Obsoletes: suite-composer
Conflicts: suite-composer
AutoReqProv: no

%define _rpmdir archive/el/6/
%define _rpmfilename %%{NAME}-%%{VERSION}-%%{RELEASE}.%%{ARCH}.rpm
%define _unpackaged_files_terminate_build 0
# Don't waste time re-packing jars (http://makewhatis.com/2011/12/remove-unwanted-commpression-in-during-rpmbuild-for-jar-files)
%define __os_install_post %{nil}


%description
Boundless Server Composer, an enterprise tool for creating, styling, and publishing maps.
Composer makes authoring and publishing maps to GeoServer vastly easier than ever before
with a simpler styling syntax, real-time feedback, and convenience features such as
code-completion and sample code.

%prep

%install
mkdir -p %{buildroot}/opt/boundless/server
unzip %{_WORKSPACE}/SRC/BoundlessServer-war/composer.war -d %{buildroot}/opt/boundless/server/composer

mkdir -p %{buildroot}/etc/tomcat8/Catalina/localhost/
cp %{_WORKSPACE}/suite/packaging/tomcat-context/composer.xml %{buildroot}/etc/tomcat8/Catalina/localhost/
cp %{_WORKSPACE}/suite/packaging/tomcat-context/composer.xml %{buildroot}/etc/tomcat8/Catalina/localhost/composer.xml.new

mkdir -p %{buildroot}/usr/share/doc/
mv %{buildroot}/opt/boundless/server/composer/doc %{buildroot}/usr/share/doc/boundless-server-composer

%pre
if [ -f /etc/tomcat8/Catalina/localhost/composer.xml ]; then
  cp -pf /etc/tomcat8/Catalina/localhost/composer.xml /etc/tomcat8/Catalina/localhost/composer.xml.orig
fi

%post
chown -R root:root /opt/boundless/


%preun

%postun
if [ "$1" = "0" ] || [ "$1" = "remove" ]; then
  if [ -d /opt/boundless/server/composer ]; then
    for dir in `find /opt/boundless/server/composer -type d -exec bash -c '[ "x\`find "{}" -maxdepth 1 -type f\`" = x ] && echo "{}"' \; | sort -r`; do
      rm -rf $dir
    done
  fi
  if [ -f /etc/tomcat8/Catalina/localhost/composer.xml ]; then
    rm -f /etc/tomcat8/Catalina/localhost/composer.xml
  fi
    rm -f /var/lib/dpkg/info/boundless-server-composer.* 2>&1 > /dev/null
fi

%files
%defattr(-,root,root,-)
%config(noreplace) /etc/tomcat8/Catalina/localhost/composer.xml
%docdir /usr/share/doc/boundless-server-composer
/opt/boundless/server/composer
/etc/tomcat8/Catalina/localhost/composer.xml.new
