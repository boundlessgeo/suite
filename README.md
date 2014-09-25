OpenGeo Suite README
====================

These instructions describe how to build platform independent components of OpenGeo Suite.

## Prerequisites

The following base software packages are required.

* [Java Development Kit (JDK)](http://www.oracle.com/technetwork/java/javasebusiness/downloads/java-archive-downloads-javase6-419409.html) - 1.6+
* [Apache Ant](http://ant.apache.org/bindownload.cgi) - 1.8+
* [Apache Ivy](http://ant.apache.org/ivy/download.cgi) - 2.3+
* [Git](http://git-scm.com/) - 1.7.10+*

Some modules require additional packages:

* [Apache Maven](http://maven.apache.org/download.html) - 3.0+
* [JSTools](https://github.com/whitmo/jstools) - Latest
* [Sphinx](http://sphinx.pocoo.org/) - 1.0+ (the full build requires LaTeX support)
* [NodeJS](http://nodejs.org/) - Latest version

Ensure that all the above are installed so that the associated executables are on the 
`PATH` of the user building the suite. 

## Quickstart

1. Clone the repository:

        % git clone git://github.com/opengeo/suite.git suite
        % cd suite

1. Initialize submodule dependencies:

        % git submodule update --init --recursive

1. Do a full build:

        % ant

1. Or build the module of your choice:

        % cd docs
        % ant 

## Build System Overview

The suite repository is made up a number of modules (ie projects). During development 
typically modules are built individually as opposed to all at once. The primary build 
tool for suite is Ant. For some modules the ant script delegates to the modules native build tool such as Maven or Sphinx. 

All top level modules have a `build.xml` that defines the following targets:

1. `build` - Builds the project, the result of this is something deployable in the development environment. This target is the default.
1. `clean` - Cleans the project deleting all build artifacts. 
1. `assemble` - Assembles the project into a zip archive suitable for deployment in production. This is the artifact consumed by installer builders. 
1. `publish` - Publishes the zip archive to a final location.
1. `all` - Runs all the above targets.

Building for development purposes typically looks like:

    ant clean build

Building for deployment purposes typically looks like:

    ant clean build assemble

Or to build everything:

    ant all

The [build](build) directory contains common build files used by modules.

 * [common.xml](build/common.xml) - Common ant targets used by module 
 build files. Every module build file imports this file as the first step.
 * [build.properties](build/build.properties) - Default build properties that can
 be overridden on a global or per module basis.

### Build Properties

Many aspects of the suite build such as file locations, executable names, etc... are 
parameterized into build properties. The default [build.properties](build/build.properties)
contains a list of default values. Often these default properties must be overridden to 
cater to the environment (eg. Windows vs Unix) or to cater to specifics of a particular module. 

There are two ways to override build properties: 

1. The first is to specify them directly to the ant build command with the Java system property (-D) syntax. For example:

          % ant -Dsuite.build_cat=release build

1. Creating a file named `local.properties` either at the global level or at the module level. The global `local.properties` is located in the [build](build) directory next to 
`build.properties`. Module specific `local.properties` files are located next to the module `build.xml` file. Naturally the module specific local properties file overrides properties from its global counterpart. 

Using any combination of the above method it should never be necessary to modify the `build.properties` file directly. 

## Modules

The suite repository is composed of the following modules:

* [apps](apps/README.md)
* [dashboard](dashboard/README.md)
* [docs](docs/README.md)
* [geoexplorer](geoexplorer/README.md)
* [geoserver](geoserver/README.md)
* [geowebcache](geowebcache/README.md)
* [jetty](jetty/README.md)
* [recipes](recipes/README.md)
* [webapp-sdk](sdk/README.md)

Consult the module README files for module specific information. 
