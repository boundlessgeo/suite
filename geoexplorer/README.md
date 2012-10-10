# GeoExplorer

These instructions describe how to deploy GeoExplorer assuming you have a copy of the application source code from GitHub.

## Getting a copy of the application

To get a copy of the application source code, use subversion:

    you@prompt:~$ git clone git://github.com/opengeo/GeoExplorer.git


## Dependencies

The GeoExplorer repository contains what you need to run the application as a servlet with an integrated persistence layer.

To assemble the servlet or run in development mode, you need [Ant](http://ant.apache.org/).  In addition, to pull in external dependencies, you'll neeed [Git](http://git-scm.com/) installed.

Before running in development mode or preparing the application for deployment, you need to pull in external dependencies.  Do this by running `ant init` in the geoexplorer directory:

    you@prompt:~$ cd geoexplorer/
    you@prompt:~/geoexplorer$ ant init


## Running in development mode

The application can be run in development or distribution mode.  In development mode, individual scripts are available to a debugger.  In distribution mode, scripts are concatenated and minified.

To run the application in development mode, run `ant debug`:

    you@prompt:~$ cd geoexplorer
    you@prompt:~/geoexplorer$ ant debug

If the build succeeds, you'll be able to browse to the application at http://localhost:8080/.

By default, the application runs on port 9080.  To change this, you can set the `app.port` property as follows (setting the port to 8000):

    you@prompt:~/geoexplorer$ ant -Dapp.port=8000 debug

In addition, if you want to make a remote GeoServer available at the `/geoserver/` path, you can set the `app.proxy.geoserver` system property as follows:

    you@prompt:~/geoexplorer$ ant -Dapp.proxy.geoserver=http://example.com/geoserver/ debug


## Preparing the application for deployment

Running GeoExplorer as described above is not suitable for production because JavaScript files will be loaded dynamically.  Before moving your application to a production environment, run ant with the "dist" target.  The "dist" target will result in a directory that can be dropped in a servlet container.

    you@prompt:~$ cd geoexplorer
    you@prompt:~/geoexplorer$ ant dist

Move the build/geoexplorer directory to your production environment (e.g. a  servlet container).

GeoExplorer writes to a geoexplorer.db when saving maps.  The location of this file is determined by the `GEOEXPLORER_DATA` value at runtime.  This value can be set as a servlet initialization parameter or a Java system property.

The `GEOEXPLORER_DATA` value must be a path to a directory that is writable by  the process that runs the application.  The servlet initialization parameter is given precedence over a system property if both exist.

As an example, if you want the geoexplorer.db file to be written to your `/tmp` directory, modify GeoExplorer's `web.xml` file to include the following:

    <init-param>
        <param-name>GEOEXPLORER_DATA</param-name>
        <param-value>/tmp</param-value>
    </init-param>


## Deploying the Application to an OpenGeo Suite Instance

GeoExplorer uses [Cargo](http://cargo.codehaus.org/) to deploy apps to a remote
OpenGeo Suite instance's servlet container. The name of the app is set in root element of the `build.xml` file and defaults to `geoexplorer`:

    <project name="geoexplorer" default="dist" basedir=".">

A typical ant command to deploy your app to http://my.host.com:8080/geoeplorer/` would be

    ant deploy -Dcargo.host=my.host.com -Dcargo.password=abc123

To undeploy the app, use

    ant undeploy -Dcargo.host=my.shost.com -Dcargo.password=abc123

There are more Cargo options available to the `ant deploy` and `ant undeploy` commands, and all are appended by using `-D<option>=<value>`:

    * *cargo.host*: The OpenGeo Suite host to deploy to. Default is `localhost`.
    * *cargo.port*: The port the OpenGeo Suite's servlet container runs on. Default is `8080`.
    * *cargo.container*: The servlet container used by the OpenGeo Suite. Available values are `glassfish3x`, `jboss4x`, `jboss42x`, `jboss5x`, `jboss51x`, `jboss6x`, `jboss61x`, `jboss7x`, `jboss71x`, `jetty6x`, `jetty7x`, `jetty8x`. Default is `tomcat6x`.
    * *cargo.username*: The username for the container management servlet. Default is `manager`.
    * *cargo.password*: The password for the container management servlet. No default.
    * *cargo.context*: The name of the servlet context for the app (i.e. the url path for the app). Default is the project name specified in the `build.xml` file.

