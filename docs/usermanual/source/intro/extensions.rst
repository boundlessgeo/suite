.. _intro.extensions:

Boundless Suite extensions
==========================

Boundless Suite comes with a number of optional extensions or "add-ons". These add functionality to Boundless Suite, but may not be needed by most users. We recommend that you choose only the extensions that you need.

These optional components can be installed in different ways depending on your operating system. Please see the appropriate :ref:`installation <install>` section.

.. _intro.extensions.appschema:

App Schema
----------

The Application Schema (or App Schema) extension allows the ability to apply a mapping from a simple data store such as a shapefile or database table to one or more complex feature types, conforming to a GML application schema.

Once this extension is added, GeoServer can be configured with mapping files defining how content is to be processed as expected by a given application schema.

For more information, please see the `GeoServer Application Schema documentation <../geoserver/data/app-schema/>`_.


.. _intro.extensions.arcsde:

ArcSDE
------

The ArcSDE extension adds the ability for GeoServer to publish data from ArcSDE sources. Once this extension is added, GeoServer will show ArcSDE as one of its available data sources when adding a new vector or raster store.

Please visit the `ArcSDE 8.1 Service Pack 1 Readme <http://downloads2.esri.com/support/downloads/ao_/SP1_downloads/ArcSDE_sp1_readme.html>`_ for more information.


.. _intro.extensions.cloudwatch:

CloudWatch
----------

The CloudWatch extension adds the ability for GeoServer to share performance information with the `Amazon CloudWatch <http://aws.amazon.com/cloudwatch/>`_ monitoring service.

For more information, please see the :ref:`sysadmin.cloudwatch` section.


.. _intro.extensions.clustering:

Clustering
----------

The Clustering extension for GeoServer adds the ability to automatically set up multiple instances of GeoServer that can pool resources.

For more information about clustering, please see the :ref:`sysadmin.clustering` section.


.. _intro.extensions.csw:

CSW
---

The CSW extension adds the ability for GeoServer to publish information conforming to the Catalog Service for the Web (CSW) protocol.

For more information about CSW in GeoServer, please see the :geoserver:`GeoServer CSW documentation <services/csw/>`.

.. warning:: The installation instructions in the :geoserver:`GeoServer documentation <services/csw/installing.html>` do not apply to users of Boundless Suite. Users of Boundless Suite can install the extension in the standard way as indicated above.


.. _intro.extensions.db2:

DB2
---

The DB2 extension adds the ability for GeoServer to publish data from DB2 databases. Once this extension is added, GeoServer will show DB2 as one of its available data sources when adding a new vector store.


.. _intro.extensions.gdal:

GDAL Image Formats
------------------

The GDAL Image Formats extension adds the ability for GeoServer to publish data from extra raster data sources, through the use of `GDAL <http://www.gdal.org/>`_. These formats include, but are not limited to DTED, EHdr, AIG, and ENVIHdr.

The instructions for enabling these formats may require a few additional steps from the standard extension installation instructions as indicated above. Please see the section on :ref:`installing GDAL image formats <dataadmin.gdal>` for more information.


.. _intro.extensions.geopackage:

GeoPackage
----------

The GeoPackage extension adds the ability for GeoServer to publish data from `GeoPackage <http://www.geopackage.org/>`_ sources (a data format based on `SQLite <http://www.sqlite.org/>`_). Once this extension is added, GeoServer will show GeoPackage as one of its available data sources when adding a new store.


.. _intro.extensions.grib:

GRIB
----

The GRIB extension adds support for GeoServer to publish data in `GRIB <https://en.wikipedia.org/wiki/GRIB>`_ format. GRIB is a data format commonly used in meteorology to store weather data, both historical and predicted. This version includes support for reading data in GRIB 1 and GRIB 2 formats.


.. _intro.extensions.inspire:

INSPIRE
-------

The INSPIRE extension provides additional metadata information for WMS and WFS services as required by the European Commission's `INSPIRE directive <http://inspire.ec.europa.eu>`__.

For information on configuring WMS and WFS services, please see the `GeoServer INSPIRE documentation <../geoserver/extensions/inspire/>`_.


.. _intro.extensions.jdbcconfig:

JDBCConfig
----------

The JDBCConfig module enhances the scalability performance of the GeoServer catalog, by externalizing the storage of the catalog configuration objects (such as workspaces, stores, layers) to a database, rather than using XML files in the GeoServer data directory.


.. _intro.extensions.jdbcstore:

JDBCStore
---------

The JDBCStore extension allows efficient sharing of configuration data in a clustered deployment of GeoServer. It allows externalizing the storage of all configuration to a database, rather than using the default file-based data directory.


.. _intro.extensions.jp2k:

JPEG 2000
---------

The JPEG 2000 extension adds the ability for GeoServer to publish data from `JPEG 2000 <https://jpeg.org/jpeg2000/index.html>`_ sources. This image format utilizes wavelet compression for more efficient storage. Once this extension is added, GeoServer will show JPEG 2000 ("JP2K") as one of its available data sources when adding a new store.

.. _intro.extensions.mbtiles:

MBTiles
-------

The MBTiles extension add the ability for GeoServer to publish data saved in `MBTiles <https://www.mapbox.com/help/an-open-platform/#mbtiles>`_ format, which is an efficient format for storing millions of tiles in a single SQLite database.

.. _intro.extensions.mongodb:

MongoDB
-------

The MongoDB extension adds the ability for GeoServer to publish data from `MongoDB <http://www.mongodb.org/>`_ sources. Once this extension is added, GeoServer will show MongoDB as one of its available data sources when adding a new store.

For more information on using MongoDB, see the section on :ref:`dataadmin.mongodb`.

.. note:: This extension will only work when connecting to MongoDB databases at version 2.4 and above.


.. _intro.extensions.netcdf:

NetCDF
------

`Network Common Data Form (NetCDF) <http://www.unidata.ucar.edu/software/netcdf/>`_ is a format used to store array-oriented scientific data, such as meteorologic data. This version includes support for reading data in GRIB 1, GRIB 2, NetCDF 3 and 4 with CF (Climate and Forecast) formats.


.. _intro.extensions.oracle:

Oracle
------

The :ref:`Oracle extension <dataadmin.oracle>` adds the ability for GeoServer to publish data from Oracle Spatial databases. Once this extension is added, GeoServer will show Oracle as one of its available data sources when adding a new vector store.


.. _intro.extensions.script:

Scripting
---------

The scripting extension provides a number of extension points called “hooks” throughout GeoServer. Each hook provides a way to plug in functionality via a script.

For more information on scripting, please see the :ref:`processing.scripting` section, and the `GeoServer scripting documentation <../geoserver/community/scripting/>`_.


.. _intro.extensions.sqlserver:

SQL Server
----------

The SQL Server extension adds the ability for GeoServer to publish data from MS SQL Server databases (2008 and above only). Once this extension is added, GeoServer will show SQLServer as one of its available data sources when adding a new vector stores.


.. _intro.extensions.vectortiles:

Vector Tiles
------------

The Vector Tiles extension adds a number of output formats to GeoServer that deliver geographic data to a browser or other client application in tiles which using a vector representation of the features in the tile. Vector tiles improve the performance of maps fast while offering full client-side design flexibility. 

For more information on Vector Tiles, please see the :ref:`dataadmin.vectortiles` section.


.. _intro.extensions.wps:

WPS
---

The WPS extension adds the ability for GeoServer to support and publish the Web Processing Service (WPS). WPS is a protocol for hosting and executing geospatial processes, bringing geospatial analysis to the client/server model.

For more information on WPS in Boundless Suite, please see the :ref:`processing` section.
