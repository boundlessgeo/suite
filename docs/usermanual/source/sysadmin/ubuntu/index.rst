.. _sysadmin.ubuntu:

Ubuntu Suite Administration
============================

This document contains information about various tasks specific to Boundless Suite for Ubuntu Linux. For more details, please see the :ref:`sysadmin` section.

.. note:: This section is also applicable to those running a Boundless Suite in a Virtual Machine.

Starting and stopping Boundless Suite services
----------------------------------------------

Boundless Suite is comprised of two main services:

#. The `Tomcat <http://tomcat.apache.org/>`_ web server that contains all the web applications such as GeoServer, GeoWebCache, and GeoExplorer. 

#. The `PostgreSQL <http://www.postgresql.org/>`_ database server with the PostGIS spatial extensions.

.. note:: The Tomcat service used by Boundless Suite is pulled in from standard repository sources, and is not specific to Boundless Suite.

Controlling the Tomcat service
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

To start/stop/restart the Tomcat service:

  .. code-block:: bash
 
     sudo service tomcat8 start|stop|restart

Other options in addition to the above are ``try-restart``, ``force-restart``, and ``status``.

Controlling the PostgreSQL service
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

To start/stop/restart the PostgreSQL service:

  .. code-block:: bash
 
     sudo service postgresql start|stop|restart

Other options in addition to the above are ``reload``, ``force-reload``, and ``status``.

  .. note:: If you have multiple versions of PostgresSQL installed you can specify which version to control with a third argument. For example:

     .. code-block:: bash

         sudo service postgresql start 9.3 

Service port configuration
--------------------------

The Tomcat and PostgreSQL services run on ports **8080** and **5432** respectively. These ports can often conflict with existing services on the system, in which case the ports must be changed. 

Changing the Tomcat port
^^^^^^^^^^^^^^^^^^^^^^^^

To change the Tomcat port:

#. Edit the file :file:`/etc/tomcat8/server.xml`. 

#. Search for ``8080`` (around line 71) and change the ``port`` attribute to the desired value.

#. Restart Tomcat.

Changing the PostgreSQL port
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

To change the PostgreSQL port:

#. Edit the file :file:`/etc/postgresql/9.3/main/postgresql.conf`.

#. Search or the ``port`` property (around line 63) and change it to the desired value.

#. Restart PostgreSQL.

Working with Tomcat
-------------------

Changing the Tomcat Java
^^^^^^^^^^^^^^^^^^^^^^^^

If you wish to use the Oracle Java 8 JRE (rather than the OpenJDK 8 installed by default):

#. Download and install Oracle Java 8 JRE.

#. Open :file:`/etc/default/tomcat8` and update the ``JAVA_HOME`` environment variable.

   .. note:: Make sure the line is uncommented (does not start with ``#``).

#. Save and close the file.

#. Restart Tomcat.

Adding other system parameters
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can add other system or application-specific parameters that will be picked up upon restart.

#. The :file:`/etc/sysconfig/tomcat8` is responsible for the tomcat service.

   * To provide an environmental variable open :file:`/etc/sysconfig/tomcat8` in a text editor, add the desired parameters to the bottom of the file.
     
     Environmental variables defined at the end of :file:`/etc/tomcat8/tomcat8`::
        
      GDAL_DATA=/usr/share/gdal
      GEOSERVER_DATA_DIR=/opt/boundless/suite/geoserver-data/
      GEOWEBCACHE_CACHE_DIR=/opt/boundless/suite/geowebcache-data/
   
   * System properties are read in from the files in :file:`/etc/tomcat8/suite-opts/` (to make these settings easier to manage).
     
     Example :file:`/etc/tomcat8/suite-opts/memory`::
         
         -Xmx2G

#. Restart Tomcat.

.. _intro.installation.ubuntu.postinstall.geoserver:

Working with GeoServer
----------------------

GeoServer Data Directory
^^^^^^^^^^^^^^^^^^^^^^^^

The **GeoServer Data Directory** is the location on the file system where GeoServer stores all of its configuration, and (optionally) file-based data. By default, this directory is located at: :file:`/var/lib/opengeo/geoserver`. 

To point GeoServer to an alternate location:

#. Edit the file :file:`/etc/tomcat8/Catalina/localhost/geoserver.xml`.

   Define ``GEOSERVER_DATA_DIR`` with an appropriate value accordingly.
   
   .. code-block:: xml
      
       <context-param>
          <param-name>GEOSERVER_DATA_DIR</param-name>
           <param-value>/var/opt/boundless/geoserver/data/</param-value>
       </context-param> 

#. Restart Tomcat.

Enabling spatial reference systems with Imperial units
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

A fix is available for spatial reference systems measured in Imperial units (feet). This setting is recommended for all users, and strongly recommended for those working with **US State Plane** projections measured in feet.

To enable this fix:

#. Add the following parameter to :file:`/etc/tomcat8/suite-opts/scale`
   
   .. code-block:: bash
      
      -Dorg.geotoools.render.lite.scale.unitCompensation=true

#. Restart Tomcat.

Update GeoJSON output
^^^^^^^^^^^^^^^^^^^^^
 
GeoServer GeoJSON output is now provided in x/y/z order as required by the specification. In addition, the ``crs``  output has changed to support full URN representation of spatial reference systems:
   
   .. code-block:: json

      "crs": {
         "type": "name",
         "properties": {
            "name": "urn:ogc:def:crs:EPSG::4326"
         }
      }

.. note::

   Previously, the output was:

      .. code-block:: json
   
         "crs": {
            "type": "EPSG",
            "properties": {
               "code": "4326"
            }
         }
   
To restore the previous ``crs`` representation for compatibility reasons (especially when working with OpenLayers 3):

#. Add a context parameter to :file:`/etc/tomcat8/Catalina/localhost/geoserver.xml`:

   .. code-block:: xml
      
       <context-param>
           <param-name>GEOSERVER_GEOJSON_LEGACY_CRS</param-name>
           <param-value>true</param-value>
       </context-param>

#. Restart Tomcat.

.. _intro.installation.ubuntu.postinstall.pgconfig:

PostgreSQL configuration
------------------------

PostgreSQL configuration is controlled within the ``postgresql.conf`` file. This file is located at :file:`/etc/postgresql/9.3/main/postgresql.conf`. 

You will want to ensure that you can connect to the database. Please see the section on :ref:`dataadmin.pgGettingStarted.firstconnect` to set this up.
