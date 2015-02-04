.. _sysadmin.startup:

How to add startup parameters for GeoServer
===========================================

GeoServer allows global configuration settings to be provided as Java system properties for use during the startup process. Java system properties can be supplied on the command line using ``-D`` (and are of the form ``-Dproperty=value`` or ``-D property=value``).

This section shows how to set the Java system properties used during startup.

Jetty
-----

OpenGeo Suite for Windows and OS X both use the Jetty application server. Startup flags are all contained in a file called :file:`start.ini`.

On Windows, this file is contained in :file:`jetty\\start.ini` inside the root of the installation directory. For example, :file:`C:\\Program Files\\Boundless\\OpenGeo\\jetty\\start.ini`.

To access the :file:`start.ini` file on OS X, click :guilabel:`Open Webapps` from the GeoServer menu. The file is one level up in the directory tree.

.. figure:: img/startini.png

   A sample start.ini file

This file contains a mix of JVM parameters (such as memory settings) and system properties. There is a section titled :guilabel:`other geoserver options` where startup options can go, but the specific order is not important. Each option must be on its own line.

For example, to revert to the legacy handling of CRS values in GeoJSON WFS output:

#. Open :file:`start.ini` in a text editor. (You will need to open it with administrator privileges.)

#. Add the following line::

    -DGEOSERVER_GEOJSON_LEGACY_CRS=true

#. Save and close the file.

#. Restart GeoServer.

Tomcat
------

When using OpenGeo Suite with Tomcat, we recommend you add the startup options to the :file:`setenv.sh` (Linux) or :file:`setenv.bat` (Windows) script file. This file is typically found in the :file:`bin` directory of the Tomcat installation, for example :file:`/usr/share/tomcat7/bin`.

.. note:: If this file doesn't exist, you can create it in the same directory as the other Tomcat startup scripts such as :file:`catalina.sh` (Linux) or :file:`catalina.bat` (Windows).

Inside this file, the startup options will be added to the ``JAVA_OPTS`` environment variable so they will be picked up during the startup process. 

For example, to revert to the legacy handling of CRS values in GeoJSON WFS output:

#. Open :file:`setenv.sh` (Linux) or :file:`setenv.bat` (Windows) in a text editor. (You will need to open it with administrator privileges.)

#. Add the following line:

   * Linux::

       export JAVA_OPTS="$JAVA_OPTS -DGEOSERVER_GEOJSON_LEGACY_CRS=true"

   * Windows::

       set JAVA_OPTS=%JAVA_OPTS% -DGEOSERVER_GEOJSON_LEGACY_CRS=true

#. Save and close the file.

#. Restart GeoServer.
