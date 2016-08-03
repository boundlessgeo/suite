.. _sysadmin.windows:

Windows Suite Administration
============================


This document contains information about various tasks specific to Boundless Suite for Windows. 

.. |postgresql.conf| replace:: :file:`C:\\ProgramData\\Boundless\\OpenGeo\\pgsql\\9.3\\postgresql.conf`

.. todo:: Might want to make the PG version a global var.

Starting and stopping Boundless services
----------------------------------------

Boundless Suite is comprised of two services:

#. **Tomcat** - The Tomcat web server that contains all the Boundless web applications such as GeoServer, GeoWebCache, and GeoExplorer.
   
   The service can be started / stopped from the :command:`Tomcat Manger` application.

#. **Boundless PostgreSQL** - The `PostgreSQL <http://www.postgresql.org/>`_ database server with the PostGIS spatial extensions. 

   The services can be started and stopped directly from the Start Menu by navigating to :menuselection:`All Programs --> Boundless Suite` and using the :guilabel:`Start` and :guilabel:`Stop` short cuts. They must be run with Adminstrator rights.


Services can also be controlled from the Windows :guilabel:`Services` dialog available by navigating to :menuselection:`Administrative Tools --> Services` from the Windows :guilabel:`Control Panel`.

Service port configuration
--------------------------

The Tomcat and PostgreSQL services run on ports **8080** and **5432** respectively. These ports can often conflict with existing services on the system, in which case the ports must be changed. 

Changing the Tomcat port
^^^^^^^^^^^^^^^^^^^^^^^^^

TBD

Changing the PostgreSQL port
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

To change the PostgreSQL port:

#. Open the file :file:`C:\\Program Files\\Boundless\\OpenGeo\\pgsql\\postgresql.conf` in a text editor such as Notepad.

#. Search or the ``port`` property (around line 63), uncomment it and change its value from ``5432`` to a number that does not conflict with any existing services on the machine.

#. Restart OpenGeo PostgreSQL service.

.. _intro.installation.windows.postinstall.datadir:

GeoServer Data Directory
------------------------

The **GeoServer Data Directory** is the location on the file system where GeoServer stores all of its configuration, and (optionally) file-based data.

By default, this directory is located at :file:`C:\\ProgramData\\Boundless\\geoserver\\data`.

To point GeoServer to an alternate location:

#. Change the Tomcat Java Options to point at the new location

#. Restart the Tomcat service

PostgreSQL Configuration
------------------------

PostgreSQL configuration is controlled within the ``postgresql.conf`` file. This
file is located at:

|postgresql.conf|

.. note:: The :file:`ProgramData` directory is hidden, so it will not display in standard directory listings.
