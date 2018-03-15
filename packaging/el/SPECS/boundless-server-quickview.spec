%define __spec_install_pre /bin/true

Name: boundless-server-quickview
Version: REPLACE_VERSION
Release: REPLACE_RELEASE
Summary: Boundless WebSDK demo application
Group: Applications/Engineering
License: LGPL
URL: http://boundlessgeo.com/
BuildRoot: %{_WORKSPACE}/boundless-server-quickview/BUILDROOT
Requires(post): bash
Requires(preun): bash
Requires:  unzip, boundless-server-geoserver >= CURRENT_VER, boundless-server-geoserver < NEXT_VER
Obsoletes: suite-quickview
Conflicts: suite-quickview
AutoReqProv: no

%define _rpmdir archive/el/6/
%define _rpmfilename %%{NAME}-%%{VERSION}-%%{RELEASE}.%%{ARCH}.rpm
%define _unpackaged_files_terminate_build 0
# Don't waste time re-packing jars (http://makewhatis.com/2011/12/remove-unwanted-commpression-in-during-rpmbuild-for-jar-files)
%define __os_install_post %{nil}

%description
Boundless Server WebSDK demo application

%prep

%install
source ~/.bashrc
mkdir -p %{buildroot}/etc/tomcat8/Catalina/localhost/
cp %{_WORKSPACE}/suite/packaging/tomcat-context/quickview.xml %{buildroot}/etc/tomcat8/Catalina/localhost/
cp %{buildroot}/etc/tomcat8/Catalina/localhost/quickview.xml %{buildroot}/etc/tomcat8/Catalina/localhost/quickview.xml.new

mkdir -p %{buildroot}/usr/share/doc/boundless-server-quickview
cp %{_WORKSPACE}/suite/packaging/licenses/EULA %{buildroot}/usr/share/doc/boundless-server-quickview
wget http://www.apache.org/licenses/LICENSE-2.0.txt -O %{buildroot}/usr/share/doc/boundless-server-quickview/LICENSE.txt

mkdir -p %{_WORKSPACE}/suite/quickview/sdk-apps/archive/tmp/doc
cd %{_WORKSPACE}/suite/quickview/sdk-apps/quickview

npm cache clean
npm i
npm run package <<< "%{_WORKSPACE}/archive/war/quickview.war"

mkdir -p %{buildroot}/opt/boundless/server
unzip %{_WORKSPACE}/archive/war/quickview.war -d %{buildroot}/opt/boundless/server/quickview

%pre
if [ -f /etc/tomcat8/Catalina/localhost/quickview.xml ]; then
  cp -pf /etc/tomcat8/Catalina/localhost/quickview.xml /etc/tomcat8/Catalina/localhost/quickview.xml.orig
fi

%post
chown -R root:root /opt/boundless/

%preun

%postun
if [ "$1" = "0" ] || [ "$1" = "remove" ]; then
  if [ -f /etc/tomcat8/Catalina/localhost/quickview.xml ]; then
    rm -f /etc/tomcat8/Catalina/localhost/quickview.xml
  fi
  if [ -d /opt/boundless/server/quickview ]; then
    for dir in `find /opt/boundless/server/quickview -type d -exec bash -c '[ "x\`find "{}" -maxdepth 1 -type f\`" = x ] && echo "{}"' \; | sort -r`; do
      rm -rf $dir
    done
  fi
  rm -f /var/lib/dpkg/info/boundless-server-quickview.* 2>&1 > /dev/null
fi

%files
%defattr(-,root,root,-)
%config(noreplace) /etc/tomcat8/Catalina/localhost/quickview.xml
%docdir /usr/share/doc/boundless-server-quickview
/opt/boundless/server/quickview
/etc/tomcat8/Catalina/localhost/quickview.xml.new
