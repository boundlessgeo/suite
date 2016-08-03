.. _sysadmin.redhat:

RedHat Suite Administration
===========================


This document contains information about various tasks specific to Boundless Suite for Ubuntu Linux. For more details, please see the :ref:`sysadmin` section.

Starting and stopping Boundless Suite services
----------------------------------------------

Boundless Suite is comprised of two main services:

#. The `Tomcat <http://tomcat.apache.org/>`_ web server that contains all the Boundless web applications such as GeoServer, GeoWebCache, and GeoExplorer. 

#. The `PostgreSQL <http://www.postgresql.org/>`_ database server with the PostGIS spatial extensions.

.. note:: The Tomcat service used by Boundless Suite is pulled in from standard repository sources, and is not specific to Boundless Suite.

Controlling the Tomcat service
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

To start/stop/restart the Tomcat service:

  .. code-block:: bash
 
     service tomcat start|stop|restart

.. note:: Depending on the distribution and version the service name may be one of "tomcat", "tomcat5", or "tomcat6". Use the :command:`service` command to determine which one is installed:

  .. code-block:: bash

     service --status-all | grep tomcat

Controlling the PostgreSQL service
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Before PostgreSQL service can be started it must first be initialized:

  .. code-block:: bash

     service postgresql-9.3 initdb

To start/stop/restart the PostgreSQL service:

  .. code-block:: bash
 
     service postgresql-9.3 start|stop|restart

Service port configuration
--------------------------

The Tomcat and PostgreSQL services run on ports **8080** and **5432** respectively. These ports can often conflict with existing services on the systemk, in which case the ports must be changed. 

Changing the Tomcat port
^^^^^^^^^^^^^^^^^^^^^^^^

To change the Tomcat port:

#. Edit the file :file:`/etc/tomcat/server.xml`. 

   .. note:: Depending on the distribution and version replace "tomcat" with "tomcat5" or "tomact6" accordingly. Use the :command:`service` command to determine which one is installed:

      .. code-block:: bash

         service --status-all | grep tomcat

#. Search for "8080" (around line 75) and change the ``port`` attribute to the desired value.

#. Restart tomcat. 

   .. code-block:: bash

        service tomcat restart

Changing the PostgreSQL port
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

To change the PostgreSQL port:

#. Edit the file :file:`/var/lib/pgsql/9.3/data/postgresql.conf`.

#. Search or the ``port`` property (around line 63), uncomment and change it to the desired value.

#. Restart PostgreSQL.

   .. code-block:: bash

       service postgresql-9.3 restart

Working with Tomcat
-------------------

Changing the Tomcat Java
^^^^^^^^^^^^^^^^^^^^^^^^

If you wish to use the Oracle Java 7 JRE (rather than the OpenJDK 7 installed by default):

#. Download and install Oracle Java 7 JRE.

#. Open :file:`/etc/sysconfig/tomcat` and update the ``JAVA_HOME`` environment variable.

   .. note:: Make sure the line is uncommented (does not start with ``#``).

#. Save and close the file.

#. Restart Tomcat.

Using Boundless Suite with custom Tomcat
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Boundless Suite packages can be used to manage the contents :file:`/usr/share/boundless` components while making use of your own Tomcat application server.

#. Install Boundless Suite.

#. Stop your Tomcat service.

#. Navigate to :file:`/etc/tomcat/Catalina/localhost/`.

#. Create the :file:`geoserver.xml` with the following content:
   
   .. code-block:: xml
   
      <Context displayName="geoserver"
               docBase="/usr/share/boundless/geoserver"
               path="/geoserver"/>

#. Create the :file:`geowebcache.xml` with the following content:
   
   .. code-block:: xml
   
      <Context displayName="geowebcache"
               docBase="/usr/share/boundless/geowebcache"
               path="/geowebcache"/>

#. Create the :file:`dashboard.xml` with the following content:
   
   .. code-block:: xml
   
      <Context displayName="dashboard"
               docBase="/usr/share/boundless/dashboard"
               path="/dashboard"/>

#. Create the :file:`geoexplorer.xml` with the following content:
   
   .. code-block:: xml
   
      <Context displayName="geoexplorer"
               docBase="/usr/share/boundless/geoexplorer"
               path="/geoexplorer"/>

#. Create the :file:`docs.xml` with the following content:
   
   .. code-block:: xml
   
      <Context displayName="docs"
               docBase="/usr/share/boundless/docs"
               path="/docs"/>

#. Restart Tomcat.

Adding other system parameters
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can add other system or application-specific parameters that will be picked up upon restart.

#. Open :file:`/etc/sysconfig/tomcat` in a text editor.

#. Add the desired parameters to the bottom of the file.

#. Save and close the file.

#. Restart Tomcat.

.. _intro.installation.redhat.postinstall.geoserver:

Working with GeoServer
----------------------

GeoServer Data Directory
^^^^^^^^^^^^^^^^^^^^^^^^

The **GeoServer Data Directory** is the location on the file system where GeoServer stores all of its configuration, and (optionally) file-based data. By default, this directory is located at: :file:`/var/lib/boundless/geoserver`. 

To point GeoServer to an alternate location:

#. Edit the file :file:`geoserver/WEB-INF/web.xml`.

#. Search for ``GEOSERVER_DATA_DIR`` section, uncomment, and change its value accordingly.
   
   .. code-block:: xml
      
       <context-param>
          <param-name>GEOSERVER_DATA_DIR</param-name>
           <param-value>/path/to/new/data_dir</param-value>
       </context-param> 

#. Restart Tomcat.

Enabling spatial reference systems with Imperial units
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

A fix is available for spatial reference systems measured in Imperial units (feet). This setting is recommended for all users, and strongly recommended for those working with **US State Plane** projections measured in feet.

To enable this fix:

#. Add the following parameter to :file:`/etc/sysconfig/tomcat`:
   
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

#. Add the following context parameter to  :file:`geoserver/WEB-INF/web.xml`:

   .. code-block:: xml
      
       <context-param>
           <param-name>GEOSERVER_GEOJSON_LEGACY_CRS</param-name>
           <param-value>true</param-value>
       </context-param>

#. Restart Tomcat.

.. _intro.installation.redhat.postinstall.pgconfig:

PostgreSQL configuration
------------------------

PostgreSQL configuration is controlled within the ``postgresql.conf`` file. This file is located at :file:`/etc/postgresql/9.3/main/postgresql.conf`. 

You will want to ensure that you can connect to the database. Please see the section on :ref:`dataadmin.pgGettingStarted.firstconnect` to set this up.
