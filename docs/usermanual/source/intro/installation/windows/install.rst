.. _intro.installation.windows.install:

Installing
==========

.. note::

   If updating from a previous **major** version see the :ref:`Upgrade <intro.installation.windows.update>` section. If updating from a previous **minor** version, please continue below.

Prerequisites
-------------

OpenGeo Suite has the following system requirements:

* **Operating System**: Windows Vista, 7 or 8, or Windows Server 2003 or higher
* **Memory**: 1GB minimum (2GB recommended)
* **Disk space**: 600MB minimum (plus extra space for data)
* **Browser**: Any modern web browser is supported
* **Permissions**: Administrative rights
* **Software**: .NET Framework 4 (`Download <http://www.microsoft.com/en-us/download/details.aspx?id=17851>`_)

Installation
------------

.. warning:: OpenGeo Suite for Windows requires `.NET Framework 4 <http://www.microsoft.com/en-us/download/details.aspx?id=17851>`_. Installation will fail if not present.

#. Double-click the :file:`OpenGeoSuite.exe` file.

#. At the **Welcome** screen, click :guilabel:`Next`.

   .. only:: basic

       .. figure:: img/welcome-basic.png

          Welcome screen

   .. only:: enterprise
   
       .. figure:: img/welcome-ee.png

          Welcome screen

#. Read the **License Agreement** then click :guilabel:`I Agree`.

   .. figure:: img/license.png

      License Agreement

#. Select the **Destination folder** where you would like to install OpenGeo Suite, and click :guilabel:`Next`.

   .. figure:: img/directory.png

      Destination folder for the installation

#. Select the name and location of the **Start Menu folder** to be created, and click :guilabel:`Next`.

   .. figure:: img/startmenu.png

      Start Menu folder to be created

#. Select the components you wish to install, and click :guilabel:`Next`.

   .. figure:: img/components.png

      Component selection

   See :ref:`intro.installation.windows.install.components` for more details.

#. Click :guilabel:`Install` to perform the intro.installation.

   .. figure:: img/ready.png

      Ready to install

#. Please wait while the installation proceeds.

   .. figure:: img/install.png

      Installation

#. After installation, click :guilabel:`Finish`.

   .. only:: basic
   
      .. figure:: img/finish-basic.png

         OpenGeo Suite successfully installed

   .. only:: enterprise

      .. figure:: img/finish-ee.png

         OpenGeo Suite successfully installed

After installation
------------------

Installation is now complete. After installation, please see the section on :ref:`intro.installation.windows.misc`.

.. _intro.installation.windows.install.components:

Components
----------

The following is a list of components available in the **Components** page of the installer.

.. tabularcolumns:: |p{4cm}|p{11cm}|
.. list-table::
   :widths: 20 80
   :stub-columns: 1
   :class: table-leftwise

   * - PostGIS
     - The PostgreSQL/PostGIS spatial database.
   * - GeoServer
     - Server implementing OGC compliant map and feature services.
   * - GeoWebCache
     - Tile caching server.
   * - GeoExplorer
     - Map viewing and editing application.

GeoServer Extensions
^^^^^^^^^^^^^^^^^^^^

.. only:: basic

	.. list-table::
	   :widths: 20 80
	   :stub-columns: 1
	   :class: table-leftwise
	   
	   * - WPS
	     - Web Processing Service (WPS) support.
	   * - GeoPackage
	     - GeoPackage data source support.
	   * - CSW
	     - Catalogue Service for Web (CSW) support.
		 
.. only:: enterprise

	.. list-table::
	   :widths: 20 80
	   :stub-columns: 1
	   :class: table-leftwise
	   
	   * - WPS
	     - Web Processing Service (WPS) support.
	   * - GeoPackage
	     - GeoPackage data source support.
	   * - CSW
	     - Catalogue Service for Web (CSW) support.
	   * - Mapmeter
	     - Mapmeter monitoring service.
	   * - CSS Styling
	     - CSS map styling support.
	   * - MongoDB
	     - MongoDB database support.
	   * - Clustering
	     - Clustering plug-ins.
	   * - GDAL Image Formats
	     - Additional raster formats support as part of GDAL integration.
	   * - Oracle
	     - Oracle database support.
	   * - ArcSDE
	     - ArcSDE database support.
	   * - DB2
	     - DB2 database support.
	   * - SQL Server
	     - SQL Server database support.
		 
Client Tools
^^^^^^^^^^^^

.. list-table::
   :widths: 20 80
   :stub-columns: 1
   :class: table-leftwise

   * - PostGIS
     - PostGIS command line data loading utilities.
   * - pgAdmin
     - Graphical PostGIS/PostgreSQL database manager.
   * - GDAL/OGR
     - Spatial data manipulation utilities.

Dev Tools
^^^^^^^^^

.. list-table::
   :widths: 20 80
   :stub-columns: 1
   :class: table-leftwise

   * - Boundless SDK
     - Toolkit for building web map applications.
   * - GeoScript
     - Scripting extension for GeoServer.

Uninstallation
--------------

To uninstall OpenGeo Suite run the uninstaller from the start menu. See
the :ref:`intro.installation.windows.uninstall` section for more details.


