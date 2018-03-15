/*
Boundless Server build pipeline.
POC- Nick Stires

Build requirements:
* nvm
* npm
** 2.15.9 (default)
** 6.0.0 (available)
* openjdk
** 1.8.0_101
* ant
** 1.8.3
* mvn
** 3.3.9
* rpmbuild
* docker

Source repos:
* https://github.com/boundlessgeo/suite
** (with submodules)

Artifacts out:
WORKSPACE/archive/
*/

pipeline {

  agent {
    label 'jenkins-slave-01.boundlessgeo.com'
  }

  stages {
  	stage('Init') {
      steps {
        // Set variables for build types (master/stable)
        // Variables below called through legacy maven/ant build definitions
        setEnvs()

        // Clean workspace
        makeDir("$ARTIFACT_DIR")
        makeDir("$WORKSPACE/SRC")
        makeDir("$WORKSPACE/archive/el/6/")
        makeDir("$WORKSPACE/archive/el/7/")
        makeDir("$WORKSPACE/archive/ubuntu/14/")
        makeDir("$WORKSPACE/archive/ubuntu/16/")
        makeDir("$WORKSPACE/archive/war/")
        makeDir("$WORKSPACE/archive/zip/")

        gitCheckoutRecursive()

        // Store short SHA of repo into variable
        // Used for artifact capture
        captureHead()

        antBuild('suite/build/versions.xml','set-versions')
      }
    }

    stage('Build-IndApps') {
      parallel {
        stage('Build-Composer') {
          steps {
            antBuild('suite/composer/build.xml','clean build assemble publish')
            archiveBuildZip('composer')
          }
        }
        stage('Build-Dashboard') {
          steps {
            sleep(time: 1, unit:'MINUTES')
            antBuild('suite/dashboard/build.xml','clean build assemble publish')
            archiveBuildZip('dashboard')
          }
        }
        stage('Build-WPSBuilder') {
          steps {
            sleep(time: 2, unit:'MINUTES')
            antBuild('suite/wpsbuilder/build.xml','clean build assemble publish')
            archiveBuildZip('wpsbuilder')
          }
        }
        stage('Build-GeoTools') {
          steps {
            sleep(time: 3, unit:'MINUTES')
            antBuild('suite/geoserver/geotools/build.xml','clean build assemble publish')
          }
        }
      }
    }

    stage('Build-Quickview') {
      steps {
        script {
          packageRPMs("quickview")
          sh "suite/packaging/el/rpm-resign.exp archive/el/6/*.rpm || true"
        }
        archiveArtifacts artifacts: "archive/el/6/${BRANDING}-quickview-*.rpm", fingerprint: true
      }
    }

    stage('Build-GeoWebCache') {
      steps {
        antBuild('suite/geoserver/geowebcache/build.xml','clean build assemble publish')
      }
    }

    stage('Build-GeoServer') {
      steps {
        antBuild('suite/geoserver/geoserver/build.xml','clean build assemble publish')
        script {
          geoServerExtensions = ['app-schema', 'arcsde', 'csw', 'db2', 'gdal', 'grib', 'inspire', 'jp2k', 'netcdf', 'netcdf-out', 'oracle', 'sqlserver', 'vectortiles']
          for (int i = 0; i < geoServerExtensions.size(); i++) {
            archiveBuildZip("${geoServerExtensions[i]}")
          }
        }
      }
    }

    stage('Build-ExtBundle') {
      parallel {
        stage('Build-DataDir') {
          steps {
            sleep(time: 6, unit:'MINUTES')
            antBuild('suite/geoserver/data_dir/build.xml','clean build assemble publish')
            archiveBuildZip('data-dir')
          }
        }
        stage('Build-Docs') {
          steps {
            sleep(time: 1, unit:'MINUTES')
            antBuild('suite/docs/build.xml','clean build assemble publish')
            archiveBuildZip('docs-war')
          }
        }
        stage('Build-GeoMesa') {
          steps {
            sleep(time: 2, unit:'MINUTES')
            antBuild('suite/geoserver/externals/geomesa/build.xml','clean build assemble publish')
            archiveBuildZip('geomesa-accumulo-distributed-runtime')
          }
        }
        stage('Build-GeoScript') {
          steps {
            sleep(time: 3, unit:'MINUTES')
            antBuild('suite/geoserver/externals/geoscript/build.xml','clean build assemble publish')
            archiveBuildZip('geoscript-py')
          }
        }
        stage('Build-Marlin') {
          steps {
            sleep(time: 4, unit:'MINUTES')
            antBuild('suite/geoserver/externals/marlin/build.xml','clean build assemble publish')
            archiveBuildZip('marlin')
          }
        }
        stage('Build-GSR') {
          steps {
            sleep(time: 5, unit:'MINUTES')
            antBuild('suite/geoserver/externals/gsr/build.xml','clean build assemble publish')
            archiveBuildZip('gsr')
          }
        }
        stage('Build-GeoGig') {
          steps {
            script {
              sh """
                cd ${WORKSPACE}/suite/geoserver/geoserver/geoserver
                mvn -f src/community/geogig/pom.xml clean install -Dcucumber.options="--monochrome --plugin json:target/cucumber.json" -Dtest.maxHeapSize=1G
                mvn clean install -DskipTests -f src/community/pom.xml -P communityRelease assembly:attached
              """
              geoGigZip = sh (script: "find ${WORKSPACE}/suite/geoserver/geoserver/geoserver/src/community/target/release/ \
              -name *geogig-plugin.zip", returnStdout:true).trim()
              sh "cp -p $geoGigZip $WORKSPACE/archive/zip/${BRANDING}-geoserver-geogig-${SERVER_HEAD}.zip"
              archiveArtifacts artifacts: "archive/zip/${BRANDING}-geoserver-geogig-${SERVER_HEAD}.zip", fingerprint: true
            }
          }
        }
      }
    }

    stage('Build-Community') {
      steps {
        antBuild('suite/geoserver/geoserver-community/build.xml','clean build assemble publish')
        script {
          geoServerExtensions = ['geopkg', 'hz-cluster', 'jdbcconfig', 'jdbcstore', 'python']
          for (int i = 0; i < geoServerExtensions.size(); i++) {
            archiveBuildZip("${geoServerExtensions[i]}")
          }
        }
      }
    }

    stage('Build-GSExts') {
      steps {
        antBuild('suite/geoserver/externals/geoserver-exts/build.xml','clean build assemble publish')
        archiveBuildZip('cloudwatch')
        archiveBuildZip('mongodb')
        archiveBuildZip('printng')
      }
    }

    stage('Build-WebApp') {
      steps {
        antBuild('suite/geoserver/webapp/build.xml','clean build assemble publish')
        archiveBuildZip('geoserver')
      }
    }

    stage('Build-GWCWar') {
      steps {
        antBuild('suite/geowebcache/build.xml','clean build assemble publish')
        archiveBuildZip('geowebcache')
      }
    }

    stage('Archive-WARs') {
      steps {
        packageWars()
        archiveArtifacts artifacts: "archive/war/BoundlessServer-${SERVER_HEAD}-*.zip", fingerprint: true
      }
    }

    stage('Build-RPMs') {
      steps {
        explodeSources()
        // Build RPMs then cleanup
        script {
          serverRPMs = ['composer', 'dashboard', 'docs', 'geoserver', 'geowebcache', 'gs-appschema', 'gs-arcsde', 'gs-cloudwatch', 'gs-cluster', 'gs-csw', 'gs-db2', 'gs-gdal', 'gs-geomesa-accumulo', 'gs-geogig', 'gs-geopkg', 'gs-grib', 'gs-gsr', 'gs-inspire', 'gs-jdbcconfig', 'gs-jdbcstore', 'gs-jp2k', 'gs-mongodb', 'gs-netcdf', 'gs-netcdf-out', 'gs-oracle', 'gs-printng', 'gs-script', 'gs-sqlserver', 'gs-vectortiles', 'wpsbuilder']
          for (int i = 0; i < serverRPMs.size(); i++) {
            packageRPMs("${serverRPMs[i]}")
          }
          sh "rm -rf ${WORKSPACE}/${BRANDING}-*"
        }
        script {
          // Sign RPMs
          sh "suite/packaging/el/rpm-resign.exp archive/el/6/*.rpm || true"
        }
        archiveArtifacts artifacts: "archive/el/6/*.rpm", fingerprint: true
      }
    }

    stage('Build-Debs') {
      steps {
        // Replace versions in dependencies
        script {
          sh """
            sed -i "s:CURRENT_VER:${VER}:g" ${WORKSPACE}/suite/packaging/ubuntu/14/depends.esv
            sed -i "s:CURRENT_VER:${VER}:g" ${WORKSPACE}/suite/packaging/ubuntu/16/depends.esv
            sed -i "s:NEXT_VER:${NEXT_VER}:g" ${WORKSPACE}/suite/packaging/ubuntu/14/depends.esv
            sed -i "s:NEXT_VER:${NEXT_VER}:g" ${WORKSPACE}/suite/packaging/ubuntu/16/depends.esv
          """
        }
        // Issue with building Debs on EL6. Much of task to take place tentatively on priv-repo server, which runs Ubuntu 14
        // Perform workspace cleanup then send conversion scripts, sources, and supporting files
        script {
          sh """
            ssh root@priv-repo.boundlessgeo.com '
              rm -rf /tmp/convert-${BUILD_TYPE}
              mkdir -p /tmp/convert-${BUILD_TYPE}/rpms-in
              '
            scp ${WORKSPACE}/archive/el/6/*.rpm root@priv-repo.boundlessgeo.com:/tmp/convert-${BUILD_TYPE}/rpms-in/
          """
        }
        // Build Ubuntu 14 Debs
        script {
          serverUbuntu14Debs = ['composer', 'dashboard', 'docs', 'geoserver', 'geowebcache', 'gs-appschema', 'gs-arcsde', 'gs-cloudwatch', 'gs-cluster', 'gs-csw', 'gs-db2', 'gs-gdal', 'gs-geomesa-accumulo', 'gs-geogig', 'gs-geopkg', 'gs-grib', 'gs-gsr', 'gs-inspire', 'gs-jdbcconfig', 'gs-jdbcstore', 'gs-jp2k', 'gs-mongodb', 'gs-netcdf', 'gs-netcdf-out', 'gs-oracle', 'gs-printng', 'gs-script', 'gs-sqlserver', 'gs-vectortiles', 'wpsbuilder', 'quickview']
          for (int i = 0; i < serverUbuntu14Debs.size(); i++) {
            debConvert("${serverUbuntu14Debs[i]}",'14')
          }
        }

        // Build Ubuntu 16 Debs
        debConvert("gs-gdal",'16')

        // Pull built debs
        script {
          sh """
            scp root@priv-repo.boundlessgeo.com:/tmp/convert-${BUILD_TYPE}/debs-out/ubuntu/14/* archive/ubuntu/14/
            scp root@priv-repo.boundlessgeo.com:/tmp/convert-${BUILD_TYPE}/debs-out/ubuntu/16/* archive/ubuntu/16/
          """
        }
        // Reuse Ubuntu 14 Debs as able
        script {
          clonedDebs = ['composer', 'dashboard', 'docs', 'geoserver', 'geowebcache', 'gs-appschema', 'gs-arcsde', 'gs-cloudwatch', 'gs-cluster', 'gs-csw', 'gs-db2', 'gs-geomesa-accumulo', 'gs-geogig', 'gs-geopkg', 'gs-grib', 'gs-gsr', 'gs-inspire', 'gs-jdbcconfig', 'gs-jdbcstore', 'gs-jp2k', 'gs-mongodb', 'gs-netcdf', 'gs-netcdf-out', 'gs-oracle', 'gs-printng', 'gs-script', 'gs-sqlserver', 'gs-vectortiles', 'wpsbuilder', 'quickview']
          for (int i = 0; i < clonedDebs.size(); i++) {
            sh "cp -p ${WORKSPACE}/archive/ubuntu/14/${BRANDING}-${clonedDebs[i]}_${PACKAGE_VERSION}-*.deb ${WORKSPACE}/archive/ubuntu/16/"
          }
        }
        archiveArtifacts artifacts: "archive/ubuntu/14/*.deb", fingerprint: true
        archiveArtifacts artifacts: "archive/ubuntu/16/*.deb", fingerprint: true
      }
    }

    stage('Update-Repo') {
      steps {
        // Remove old wars
        script {
          sh "ssh root@priv-repo.boundlessgeo.com rm -rf /var/www/repo/suite/${BUILD_TYPE}/war/*"
        }
        // Send artifacts
        // Note- no EL7 unique RPMs, reusing EL6
        script {
          sh """
            scp archive/war/BoundlessServer-${SERVER_HEAD}-*.zip root@priv-repo.boundlessgeo.com:/var/www/repo/suite/${BUILD_TYPE}/war/
            scp archive/el/6/*.rpm root@priv-repo.boundlessgeo.com:/var/www/repo/suite/${BUILD_TYPE}/el/6/
            scp archive/el/6/*.rpm root@priv-repo.boundlessgeo.com:/var/www/repo/suite/${BUILD_TYPE}/el/7/
            scp archive/ubuntu/14/*.deb root@priv-repo.boundlessgeo.com:/var/www/repo/suite/${BUILD_TYPE}/ubuntu/14/
            scp archive/ubuntu/16/*.deb root@priv-repo.boundlessgeo.com:/var/www/repo/suite/${BUILD_TYPE}/ubuntu/16/
          """
        }
        // Resign 3rd party RPMs
        script {
          sh """
            ssh root@priv-repo.boundlessgeo.com '
              /root/rpm-resign.exp /var/www/repo/suite/${BUILD_TYPE}/el/6/[!boundless-server-]*.rpm
              /root/rpm-resign.exp /var/www/repo/suite/${BUILD_TYPE}/el/6/boundless-server-tomcat*.rpm
              /root/rpm-resign.exp /var/www/repo/suite/${BUILD_TYPE}/el/7/[!boundless-server-]*.rpm
              /root/rpm-resign.exp /var/www/repo/suite/${BUILD_TYPE}/el/7/boundless-server-tomcat*.rpm
            '
          """
        }
        // Update repo metadata
        script {
          sh """
            ssh root@priv-repo.boundlessgeo.com '
              cd /var/www/repo/suite/${BUILD_TYPE}/el/6/
              createrepo -g server-groups.xml .
              cd /var/www/repo/suite/${BUILD_TYPE}/el/7/
              createrepo -g server-groups.xml .
              cd /var/www/repo/suite/${BUILD_TYPE}/ubuntu/14
              dpkg-scanpackages . /dev/null | gzip -9c > Packages.gz
              cd /var/www/repo/suite/${BUILD_TYPE}/ubuntu/16
              dpkg-scanpackages . /dev/null | gzip -9c > Packages.gz
            '
          """
        }
      }
    }

    stage('Build-Docker') {
      steps {
        script{
          sh """
            cd $WORKSPACE/suite/packaging/docker
            echo "Building version: ${DOCKER_VER}"
            sed -i "s/REPLACE_VERSION/${BUILD_TYPE}/g" Dockerfile
            docker build -t quay.io/boundlessgeo/server:$DOCKER_VER .
            docker push quay.io/boundlessgeo/server:$DOCKER_VER
          """
        }
      }
    }

    stage('Update-Demo') {
      steps {
        script {
          if ( BUILD_TYPE.equals('master') ) {
              sh """
                ssh root@demo-master.boundlessgeo.com '
                  yum clean all
                  rm -rf /var/cache/yum
                  yum update -y boundless-server-*
                  service tomcat8 restart
                '
              """
          } else {
            echo "Demo update for release is a manual task, skipping..."
          }
        }
      }
    }

    stage('Slack-Notif') {
      steps {
        script {
          if ( BUILD_TYPE.equals('master') ) {
            sh """
              cd suite/packaging/slack_notif
              cat nightly-message.txt | bash slacktee.sh -n -p
              exit 0
            """
          } else if ( BUILD_TYPE.equals('stable') ) {
            sh """
              cd suite/packaging/slack_notif
              cat release-message.txt | bash slacktee.sh -n -p
              exit 0
            """
          }
        }
      }
    }

  }
}


def makeDir(def dir) {
  dirCheck = sh (script: "test -d ${dir} && echo '1' || echo '0' ", returnStdout: true).trim()
  if (dirCheck=='1') {
    echo "Cleaning contents of following directory: $dir"
    sh "rm -rf $dir"
  }
  sh "mkdir -p $dir"
}

def gitCheckout(def repo, def branch) {
  sh """
    rm -rf $repo
    git clone "git@github.com:boundlessgeo/${repo}.git"
    cd $repo
    git checkout $branch
  """
}

def gitCheckoutRecursive() {
  sh """
    cd $WORKSPACE/suite
    git reset --hard HEAD
    git submodule foreach git reset --hard HEAD || true
    git submodule update --init --recursive
  """
}

def setEnvs() {
  env.BRANDING = 'boundless-server'
  env.ARCHIVE_BASENAME = 'BoundlessServer'
  env.LICENSE_DIR = "$WORKSPACE/suite/packaging/licenses"
  env.ARTIFACT_ROOT = "$WORKSPACE/archive/zip"
  env.WARS_DIR = "$WORKSPACE/archive/war"
  //env.WAR_ARCHIVE = "${ARCHIVE_BASENAME}-${SERVER_HEAD}-war"
  env.DATE_TIME_STAMP = sh (script: "date +%Y%m%d%H%M", returnStdout:true).trim()
  env.VER = sh (script: "cat $WORKSPACE/suite/packaging/version.txt", returnStdout:true).trim()
  env.ARTIFACT_DIR = "/var/www/server/core/${BUILD_TYPE}/HEAD"
  env.SUITE_BUILD_CAT = 'HEAD'
  env.SERVER_BUILD_CAT = 'HEAD'
  env.SUITE_VERSION = "$VER"
  env.SERVER_VERSION = "$VER"
  if ( BUILD_TYPE.equals('master') ) {
    env.SERVER_BRANCH = "master"
    env.MINOR_VERSION = "SNAPSHOT${DATE_TIME_STAMP}-${BUILD_NUMBER}"
    env.PACKAGE_VERSION = "$DATE_TIME_STAMP"
    env.NEXT_VER= sh ( script: "echo \$((PACKAGE_VERSION+1))", returnStdout:true).trim()
    env.DOCKER_VER = "nightly"
  } else if ( BUILD_TYPE.equals('stable') ) {
    env.SERVER_BRANCH = "$VER"
    env.MINOR_VERSION = "server-${VER}"
    env.PACKAGE_VERSION = "$VER"
    env.NEXT_VER = "${PACKAGE_VERSION}.1"
    env.DOCKER_VER = "$VER"
  }
  echo "DEBUG: PACKAGE_VERSION is ${PACKAGE_VERSION}"
  echo "DEBUG: NEXT_VER is ${NEXT_VER}"
  sh "env"
}

def setSpecVersions() {
  sh """
    sed -i "s/REPLACE_VERSION/${PACKAGE_VERSION}/" $WORKSPACE/suite/packaging/el/SPECS/*.spec
    sed -i "s/REPLACE_RELEASE/${BUILD_NUMBER}/" $WORKSPACE/suite/packaging/el/SPECS/*.spec
    sed -i "s/CURRENT_VER/${PACKAGE_VERSION}/g" $WORKSPACE/suite/packaging/el/SPECS/*.spec
  """
}

def captureHead() {
  env.SERVER_HEAD = sh (script: "cd $WORKSPACE/suite && git rev-parse --short HEAD", returnStdout:true).trim()
  env.WAR_ARCHIVE = "${ARCHIVE_BASENAME}-${SERVER_HEAD}-war"
  env.EXT_ARCHIVE = "${ARCHIVE_BASENAME}-${SERVER_HEAD}-ext"
}

def antBuild(def buildFile, def antTargets) {
  workingDir = sh (script: "echo ${buildFile} | rev | cut -d / -f2- | rev", returnStdout:true).trim()
  antBuildFile = sh (script: "echo ${buildFile} | rev | cut -d / -f 1 | rev", returnStdout:true).trim()
  echo "workingDir = ${workingDir}"
  echo "antBuildFile = ${antBuildFile}"
  sh """
    cd $WORKSPACE/${workingDir}
    ant -file ${antBuildFile} \
    -Dserver.minor_version=-$MINOR_VERSION \
    -Dsuite.build_cat=$SERVER_BUILD_CAT \
    -Dserver.build_cat=$SERVER_BUILD_CAT \
    -Dsuite.version=$SUITE_VERSION \
    -Dserver.version=$SERVER_VERSION \
    -Dserver.build_branch=$BUILD_TYPE \
    $antTargets
  """
}

def archiveBuildZip(def component) {
  archiveFileSource = sh (script: "find ${ARTIFACT_DIR} -name *-${component}-${SERVER_HEAD}.zip", returnStdout:true).trim()
  archiveFileName = sh (script: "echo $archiveFileSource | rev | cut -d / -f 1 | rev", returnStdout:true).trim()
  sh "cp -p ${archiveFileSource} $WORKSPACE/archive/zip/"
  archiveArtifacts artifacts: "archive/zip/${archiveFileName}", fingerprint: true
}

def explodeSources() {
  sh """
    unzip archive/war/BoundlessServer-${SERVER_HEAD}-ext.zip -d $WORKSPACE/SRC
    mv $WORKSPACE/SRC/BoundlessServer-${SERVER_HEAD}-ext $WORKSPACE/SRC/BoundlessServer-ext
    unzip archive/war/BoundlessServer-${SERVER_HEAD}-war.zip -d $WORKSPACE/SRC
    mv $WORKSPACE/SRC/BoundlessServer-${SERVER_HEAD}-war $WORKSPACE/SRC/BoundlessServer-war
  """
  sourceWar = ['boundless-server-docs.war', 'composer.war', 'dashboard.war', 'geoserver.war', 'geowebcache.war', 'wpsbuilder.war']
  for (int i = 0; i < sourceWar.size(); i++) {
    echo "DEBUG: Exploding ${sourceWar[i]}"
    sourceWarName = sh (script: "echo ${sourceWar[i]} | rev | cut -d / -f 1 | rev", returnStdout:true).trim()
    sh "unzip $WORKSPACE/SRC/BoundlessServer-war/${sourceWar[i]} -d $WORKSPACE/SRC/${sourceWarName}"
  }
}

def packageWars() {
  makeDir("$EXT_ARCHIVE")
  makeDir("$WAR_ARCHIVE")
  sh "ln -s $ARTIFACT_ROOT/${BRANDING}-geomesa-accumulo-distributed-runtime-${SERVER_HEAD}.zip $ARTIFACT_ROOT/${BRANDING}-geoserver-geomesa-accumulo-${SERVER_HEAD}.zip"

  zip = ['app-schema', 'arcsde', 'cloudwatch', 'csw', 'db2', 'gdal', 'geogig', 'geomesa-accumulo', 'geopkg', 'geoscript-py', 'grib', 'gsr', 'hz-cluster', 'inspire', 'jdbcconfig', 'jdbcstore', 'jp2k', 'marlin', 'mongodb', 'netcdf', 'netcdf-out', 'oracle', 'printng', 'python', 'sqlserver', 'vectortiles']
  for (int i = 0; i < zip.size(); i++) {
    echo "DEBUG: Processing ${zip[i]}"
    makeDir("${zip[i]}")
    sh """
      unzip -o $ARTIFACT_ROOT/${BRANDING}-geoserver-${zip[i]}-${SERVER_HEAD}.zip -d ${zip[i]}
    """
  }

  EE_EXTS = ['app-schema', 'arcsde', 'cloudwatch', 'csw', 'db2', 'gdal', 'geogig', 'geomesa-accumulo', 'geopkg', 'grib', 'gsr', 'hz-cluster', 'inspire', 'jdbcconfig', 'jdbcstore', 'jp2k', 'marlin', 'mongodb', 'netcdf', 'netcdf-out', 'oracle', 'printng', 'python', 'sqlserver', 'vectortiles']
  for (int i = 0; i < EE_EXTS.size(); i++) {
    sh """
      cd $EXT_ARCHIVE
      mv ../${EE_EXTS[i]}/ ${EE_EXTS[i]}
    """
  }

  sh """
    cd $EXT_ARCHIVE

    # renaming
    mv hz-cluster cluster

    # Rename app schema to make consistent with agreed upon naming conventions
    mv app-schema appschema

    mv python/ script/

    mkdir windows/
    cp "${WORKSPACE}/suite/packaging/windows/"* windows/

    cp $LICENSE_DIR/EULA ./
  """

  if ( BUILD_TYPE.equals('stable') ) {
    sh "mv $EXT_ARCHIVE ${ARCHIVE_BASENAME}-${PACKAGE_VERSION}-ext"
    env.EXT_ARCHIVE = "${ARCHIVE_BASENAME}-${PACKAGE_VERSION}-ext"
  }

  sh """
    zip -r ${EXT_ARCHIVE}.zip $EXT_ARCHIVE
    mv -f ${EXT_ARCHIVE}.zip $WARS_DIR/
  """

  WAR_ZIPS = ['dashboard', 'geoserver', 'composer', 'geowebcache', 'docs-war', 'wpsbuilder']
  for (int i = 0; i < WAR_ZIPS.size(); i++) {
    sh """
      unzip -jC $ARTIFACT_ROOT/${BRANDING}-${WAR_ZIPS[i]}-${SERVER_HEAD}.zip "*.war" -d ./$WAR_ARCHIVE
    """
  }

  sh "cp $WORKSPACE/archive/war/quickview.war $WORKSPACE/$WAR_ARCHIVE"

  makeDir("$WORKSPACE/repack")
  makeDir("$WORKSPACE/repack/doc")
  sh """
    cp $ARTIFACT_ROOT/boundless-server-data-dir-${SERVER_HEAD}.zip ./$WAR_ARCHIVE/boundless-server-data-dir.zip
    wget https://www.gnu.org/licenses/old-licenses/lgpl-2.1.txt -O $LICENSE_DIR/LGPLv2.1
    wget https://www.gnu.org/licenses/old-licenses/lgpl-2.0.txt -O $LICENSE_DIR/LGPLv2
    wget https://www.gnu.org/licenses/lgpl.txt -O $LICENSE_DIR/LGPLv3
    wget http://www.apache.org/licenses/LICENSE-2.0.txt -O $LICENSE_DIR/APACHEv2.0
  """

  war = ['composer', 'dashboard', 'geoserver', 'geowebcache', 'boundless-server-docs', 'wpsbuilder', 'quickview']
  for (int i = 0; i < war.size(); i++) {
    makeDir("$WORKSPACE/repack")
    makeDir("$WORKSPACE/repack/doc")
    env.THIS_WAR = "${war[i]}"
    sh """
      unzip $WAR_ARCHIVE/${THIS_WAR}.war -d $WORKSPACE/repack/
      rm -f $WAR_ARCHIVE/${THIS_WAR}.war
    """
    if ( THIS_WAR.equals('composer') ) {
      sh "cp -f $LICENSE_DIR/BSD $WORKSPACE/repack/doc/LICENSE.txt"
    } else if ( THIS_WAR.equals('dashboard') ) {
      sh "cp -f $LICENSE_DIR/BSD $WORKSPACE/repack/doc/LICENSE.txt"
    } else if ( THIS_WAR.equals('geoserver') ) {
      sh "cp -f $LICENSE_DIR/GPL $WORKSPACE/repack/doc/LICENSE.txt"
    } else if ( THIS_WAR.equals('geowebcache') ) {
      sh "cp -f $LICENSE_DIR/LGPLv3 $WORKSPACE/repack/doc/LICENSE.txt"
    } else if ( THIS_WAR.equals('boundless-server-docs') ) {
      echo "No additional license for docs needed."
    } else if ( THIS_WAR.equals('wpsbuilder') ) {
      sh "cp -f $LICENSE_DIR/APACHEv2.0 $WORKSPACE/repack/doc/LICENSE.txt"
    } else if ( THIS_WAR.equals('quickview') ) {
      sh "cp -f $LICENSE_DIR/APACHEv2.0 $WORKSPACE/repack/doc/LICENSE.txt"
    }
    sh """
      cp -f $LICENSE_DIR/EULA $WORKSPACE/repack/doc/
      cd $WORKSPACE/repack/
      jar -cvf $WORKSPACE/$WAR_ARCHIVE/${THIS_WAR}.war .
    """
  }

  if ( BUILD_TYPE.equals('stable') ) {
    sh "mv $WORKSPACE/$WAR_ARCHIVE $WORKSPACE/${ARCHIVE_BASENAME}-${PACKAGE_VERSION}-war"
    env.WAR_ARCHIVE = "${ARCHIVE_BASENAME}-${PACKAGE_VERSION}-war"
  }

  sh """
    zip -r ${WAR_ARCHIVE}.zip $WAR_ARCHIVE
    mv -f ${WAR_ARCHIVE}.zip $WARS_DIR/
    mv -f "$WAR_ARCHIVE/"*.war $WARS_DIR/
  """
}

def packageRPMs(def component) {
  // Create RPM build tree
  dir = ['BUILD', 'BUILDROOT', 'RPMS', 'SOURCE', 'SPECS', 'SRPMS', 'SRC']
  for (int i = 0; i < dir.size(); i++) {
    makeDir("$WORKSPACE/${BRANDING}-${component}/${dir[i]}")
  }

  // Add RPM Spec file, set versions
  sh """
    cp $WORKSPACE/suite/packaging/el/SPECS/${BRANDING}-${component}.spec $WORKSPACE/${BRANDING}-${component}/SPECS
    sed -i "s/REPLACE_VERSION/${PACKAGE_VERSION}/" $WORKSPACE/${BRANDING}-${component}/SPECS/${BRANDING}-${component}.spec
    sed -i "s/REPLACE_RELEASE/$BUILD_NUMBER/" $WORKSPACE/${BRANDING}-${component}/SPECS/${BRANDING}-${component}.spec
    sed -i "s/CURRENT_VER/${PACKAGE_VERSION}/g" $WORKSPACE/${BRANDING}-${component}/SPECS/${BRANDING}-${component}.spec
    sed -i "s/NEXT_VER/${NEXT_VER}/g" $WORKSPACE/${BRANDING}-${component}/SPECS/${BRANDING}-${component}.spec
  """

  // Build RPM
  sh """
    rpmbuild -vv -ba --define "_source_filedigest_algorithm 8" --define "_binary_filedigest_algorithm 8" --define "_topdir $WORKSPACE/${BRANDING}-${component}" --define "_WORKSPACE $WORKSPACE" $WORKSPACE/${BRANDING}-${component}/SPECS/${BRANDING}-${component}.spec
  """
}

def debConvert(def component, def ubuntuVer) {
  env.DEST_DIR = "/tmp/convert-${BUILD_TYPE}/debs-out/ubuntu/${ubuntuVer}"
  env.DEPS = sh (script: "grep ${component}= ${WORKSPACE}/suite/packaging/ubuntu/${ubuntuVer}/depends.esv | cut -d '=' -f2-", returnStdout:true).trim()
  env.CONFLICTS = sh (script: "grep ${component}= ${WORKSPACE}/suite/packaging/ubuntu/${ubuntuVer}/conflicts.esv | cut -d '=' -f2-", returnStdout:true).trim()
  env.REPLACES = sh (script: "grep ${component}= ${WORKSPACE}/suite/packaging/ubuntu/${ubuntuVer}/replaces.esv | cut -d '=' -f2-", returnStdout:true).trim()

  sh """
    ssh root@priv-repo.boundlessgeo.com '
      mkdir -p $DEST_DIR
      if [ -d /tmp/convert-${BUILD_TYPE}/${ubuntuVer}/$component ]; then
        rm -rf /tmp/convert-${BUILD_TYPE}/${ubuntuVer}/$component
      fi
      mkdir -p /tmp/convert-${BUILD_TYPE}/${ubuntuVer}/$component
      cd /tmp/convert-${BUILD_TYPE}/${ubuntuVer}/$component

      cp /tmp/convert-${BUILD_TYPE}/rpms-in/${BRANDING}-${component}-${PACKAGE_VERSION}-*.rpm /tmp/convert-${BUILD_TYPE}/${ubuntuVer}/$component
    '
  """

  sh """
    ssh root@priv-repo.boundlessgeo.com '
      cd /tmp/convert-${BUILD_TYPE}/${ubuntuVer}/$component
      alien -cdgk *.rpm
      rm -rf *.orig *.rpm
      cd ${BRANDING}-${component}-${PACKAGE_VERSION}
      sed -i "s/^Depends: /Depends: ${DEPS}, /" debian/control

      if [ -n "$REPLACES" ]; then
        sed -i "/^Depends/aReplaces: $REPLACES" debian/control
      fi

      if [ -n "$CONFLICTS" ]; then
        sed -i "/^Depends/aConflicts: $CONFLICTS" debian/control
      fi

      debian/rules binary

      mv /tmp/convert-${BUILD_TYPE}/${ubuntuVer}/${component}/*.deb $DEST_DIR
    '
  """
}
