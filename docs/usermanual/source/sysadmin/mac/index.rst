.. _sysadmin.mac:

Mac Suite Administration
========================

This document contains information about various tasks specific to OpenGeo Suite for Mac OS X. 

Starting and stopping Boundless services
----------------------------------------

Service port configuration
--------------------------

The Tomcat and PostgreSQL services run on ports **8080** and **5432** respectively. These ports can often conflict with existing services on the system, in which case the ports must be changed.

Changing the Tomcat port
^^^^^^^^^^^^^^^^^^^^^^^^

Changing the PostgreSQL port
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

To change the PostgreSQL port:

#. Edit the following file::

     ~/Library/Application\ Support/PostGIS/var/postgresql.conf

#. Search or the ``port`` property (around line 63), uncomment it and change its value from 5432 to a number that does not conflict with any existing services on the machine.

GeoServer Data Directory
------------------------

The **GeoServer Data Directory** is the location on the file system where GeoServer stores all of its configuration, and (optionally) file-based data. By default, this directory is located at :file:`~/Library/Application Support/GeoServer`.

To point GeoServer to an alternate location:

#. TBD

#. Close and relaunch ``Tomcat.app``.

PostgreSQL Configuration
------------------------

PostgreSQL configuration is controlled within the ``postgresql.conf`` file. This file is located here::

  ~/Library/Application\ Support/PostGIS/var/postgresql.conf

