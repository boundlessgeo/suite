.. _intro.installation.redhat.packages:

Red Hat Linux packages
======================

OpenGeo Suite for Red Hat Linux is broken up into a number of discrete packages. This section describes all of the available packages.

The packages use the standard `RPM format <http://www.rpm.org/>`_ used in Red Hat-based systems. All packages can be installed with the following command::

  sudo yum install <package>

where ``<package>`` is any one of the package names listed below.

Top level packages
------------------

The following packages are considered "meta" packages that only depend on other upstream packages, and contain no libraries or binaries themselves.

.. tabularcolumns:: |p{4cm}|p{4cm}|p{7cm}|
.. list-table::
   :header-rows: 1
   :widths: 20 40 40
   :class: table-leftwise

   * - Package
     - Description
     - Dependencies
   * - ``opengeo``
     - Top level package, installs everything
     - ``opengeo-server`` ``opengeo-client``
   * - ``opengeo-server``
     - All server packages
     - ``postgis21-postgresql93`` ``geoserver`` ``geowebcache`` ``geoexplorer`` ``opengeo-dashboard`` ``opengeo-docs`` ``opengeo-tomcat``
   * - ``opengeo-client``
     - All client packages
     - ``postgis21`` ``pgadmin3`` ``pdal``
   * - ``opengeo-webapp-sdk``
     - Boundless SDK
     -

Server packages
---------------

The following packages contain the server components of OpenGeo Suite.

.. tabularcolumns:: |p{5cm}|p{4cm}|p{6cm}|
.. list-table::
   :header-rows: 1
   :widths: 20 40 40
   :class: table-leftwise

   * - Package
     - Description
     - Dependencies
   * - ``postgis21-postgresql93``
     - PostGIS 2.1 extensions for PostgreSQL 9.3
     - ``postgis21`` ``postgresql93-server``
   * - ``pointcloud-postgresql93``
     - Point cloud extensions for PostgreSQL 9.3
     - ``postgresql93-server`` ``ght``
   * - ``geoserver``
     - GeoServer geospatial data server
     -
   * - ``opengeo-jai``
     - Java Advanced Imaging, enhanced image rendering abilities
     -
   * - ``geowebcache``
     - GeoWebCache tile caching server
     -
   * - ``geoexplorer``
     - GeoExplorer map composing application
     -
   * - ``opengeo-dashboard``
     - OpenGeo Suite Dashboard
     -
   * - ``opengeo-docs``
     - OpenGeo Suite documentation
     -
   * - ``opengeo-tomcat``
     - OpenGeo Suite webapps for Tomcat
     - ``tomcat`` (Fedora) | ``tomcat6`` (CentOS/RHEL 6) | ``tomcat5`` (CentOS/RHEL 5)

Client/library packages
-----------------------

The following packages contain the client components of OpenGeo Suite.

.. tabularcolumns:: |p{3cm}|p{5cm}|p{7cm}|
.. list-table::
   :header-rows: 1
   :widths: 20 40 40
   :class: table-leftwise

   * - Package
     - Description
     - Dependencies
   * - ``postgis21``
     - PostGIS 2.1 userland binaries and libraries
     - ``postgresql93-libs`` ``geos`` ``proj`` ``gdal``
   * - ``pgadmin3``
     - pgAdmin database manager for PostgreSQL
     - ``wxGTK``
   * - ``ght``
     - GeoHash Tree library for point cloud data
     -
   * - ``pdal``
     - Point Cloud format library
     - ``libgeotiff`` ``laszip`` ``gdal`` ``geos`` ``postgresql93-libs``
   * - ``gdal``
     - GDAL/OGR format library
     - ``proj`` ``geos`` ``postgresql93-libs``
   * - ``libgeos``
     - GEOS geometry engine
     -
   * - ``laszip``
     - LiDAR compression utility
     -
   * - ``libgeotiff``
     - GeoTIFF library
     -
   * - ``proj``
     - Cartographic projection library
     -


GeoServer extensions
--------------------

The following packages add additional functionality to GeoServer. After installing any of these packages, you will need to restart Tomcat:

.. code-block:: console

   sudo service tomcat6 restart

For more information, please see the section on :ref:`GeoServer extensions <intro.extensions>`.

.. tabularcolumns:: |p{5cm}|p{7cm}|p{3cm}|
.. list-table::
   :header-rows: 1
   :widths: 20 40 40
   :class: table-leftwise

   * - Package
     - Description
     - Dependencies
   * - ``geoserver-mapmeter``
     - Mapmeter extension for GeoServer
     - ``geoserver``
   * - ``geoserver-cluster``
     - Clustering extension for GeoServer
     - ``geoserver``
   * - ``geoserver-jdbcconfig``
     - Database catalog and configuration extension for GeoServer
     - ``geoserver``
   * - ``geoserver-css``
     - CSS styling extension for GeoServer
     - ``geoserver``
   * - ``geoserver-csw``
     - Catalogue Service for Web (CSW) extension for GeoServer
     - ``geoserver``
   * - ``geoserver-wps``
     - Web Processing Service (WPS) extension for GeoServer
     - ``geoserver``
   * - ``geoserver-script``
     - Scripting extension for GeoServer
     - ``geoserver``
   * - ``geoserver-mongodb``
     - MongoDB extension for GeoServer
     - ``geoserver``
   * - ``geoserver-geopackage``
     - GeoPackage extension for GeoServer
     - ``geoserver``
