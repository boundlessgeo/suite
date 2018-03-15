%define __spec_install_pre /bin/true

Name: boundless-server-dashboard
Version: REPLACE_VERSION
Release: REPLACE_RELEASE
Summary: Dashboard for Boundless Server.
Group: Applications/Engineering
License: GPLv2
BuildRoot: %{_WORKSPACE}/boundless-server-dashboard/BUILDROOT
Requires(post): bash
Requires(preun): bash
Requires:  unzip, boundless-server-tomcat8 >= 8.0.42, boundless-server-tomcat8 < 8.1
Conflicts: opengeo-dashboard, suite-dashboard
Obsoletes: suite-dashboard
AutoReqProv: no

%define _rpmdir archive/el/6/
%define _rpmfilename %%{NAME}-%%{VERSION}-%%{RELEASE}.%%{ARCH}.rpm
%define _unpackaged_files_terminate_build 0
# Don't waste time re-packing jars (http://makewhatis.com/2011/12/remove-unwanted-commpression-in-during-rpmbuild-for-jar-files)
%define __os_install_post %{nil}


%description
The dashboard is the starting point for getting started with Boundless Server.

%prep

%install
mkdir -p %{buildroot}/opt/boundless/server
unzip %{_WORKSPACE}/SRC/BoundlessServer-war/dashboard.war -d %{buildroot}/opt/boundless/server/dashboard

mkdir -p %{buildroot}/etc/tomcat8/Catalina/localhost/
cp %{_WORKSPACE}/suite/packaging/tomcat-context/dashboard.xml %{buildroot}/etc/tomcat8/Catalina/localhost/
cp %{_WORKSPACE}/suite/packaging/tomcat-context/dashboard.xml %{buildroot}/etc/tomcat8/Catalina/localhost/dashboard.xml.new

mkdir -p %{buildroot}/usr/share/doc/
mv %{buildroot}/opt/boundless/server/dashboard/doc %{buildroot}/usr/share/doc/boundless-server-dashboard

%pre
if [ -f /etc/tomcat8/Catalina/localhost/dashboard.xml ]; then
  cp -pf /etc/tomcat8/Catalina/localhost/dashboard.xml /etc/tomcat8/Catalina/localhost/dashboard.xml.orig
fi

%post
chown -R root:root /opt/boundless/

%preun

%postun
if [ "$1" = "0" ] || [ "$1" = "remove" ]; then
  if [ -d /opt/boundless/server/dashboard ]; then
    for dir in `find /opt/boundless/server/dashboard -type d -exec bash -c '[ "x\`find "{}" -maxdepth 1 -type f\`" = x ] && echo "{}"' \; | sort -r`; do
      rm -rf $dir
    done
  fi
  if [ -f /etc/tomcat8/Catalina/localhost/dashboard.xml ]; then
    rm -f /etc/tomcat8/Catalina/localhost/dashboard.xml
  fi
  rm -f /var/lib/dpkg/info/boundless-server-dashboard.* 2>&1 > /dev/null
fi

%files
%defattr(-,root,root,-)
%config(noreplace) /etc/tomcat8/Catalina/localhost/dashboard.xml
%docdir /usr/share/doc/boundless-server-dashboard
/opt/boundless/server/dashboard
/etc/tomcat8/Catalina/localhost/dashboard.xml.new
