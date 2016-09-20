.. _dataadmin.importer.guiexample:

Importing data through Layer Importer user interface
====================================================

.. _dataadmin.importer.guiexample.shp:

Importing a single shapefile
----------------------------

The following example will import a zipped shapefile :file:`roads.zip` in the ``opengeo`` workspace. This file will need to be either on the machine that is running GeoServer or accessible to that machine in some way, as importing a shapefile from a remote client is not currently supported.

#. Open the Layer Importer. You will need to log in with administrator credentials.

#. In the box marked :guilabel:`Choose a data source to import from` select :guilabel:`Spatial Files`.

   .. figure:: img/sources_choosesourcefiles.png

      Spatial Files data source

#. In the box marked :guilabel:`Configure the data source`, click :guilabel:`Browse...` to open the file chooser.

   .. figure:: img/sources_spatialfiles.png

      Click Browse to select a file

#. Navigate through the directory hierarchy to the file and click to select it. Don't click :guilabel:`OK` unless you want to import :ref:`all spatial files in the directory <dataadmin.importer.guiexample.shpdir>`.

   .. figure:: img/guiexample_shpchooser.png

      Selecting a zipped shapefile

#. In the box marked :guilabel:`Workspace`, select :guilabel:`opengeo`.

   .. figure:: img/guiexample_workspace.png

      Selecting the opengeo workspace

#. Click :guilabel:`Next` to continue.

#. The file will be analyzed by the Layer Importer. On the next page, the layer will be displayed. Select the layer for import, then click :guilabel:`Import` to complete to the process. 

   .. figure:: img/guiexample_shpready.png

      Shapefile ready for import

#. The layer will be loaded into GeoServer. After completion, a select box will appear next to the layer, containing links to the (OpenLayers) Layer Preview or Google Earth. Click any of these to view the newly-loaded layer.

   .. figure:: img/guiexample_previewlinks.png

      Layer previewing options

.. note:: The Layer Importer doesn't require shapefiles to be archived. As shown in the :ref:`next example <dataadmin.importer.guiexample.shpdir>`, pointing the Layer Importer to a directory that contains a single shapefile will be imported in exactly the same way, so long as the directory contains all of the required component files (``.shp``, ``.shx``, ``.dbf``, etc.).

.. _dataadmin.importer.guiexample.shpdir:

Importing multiple shapefiles
-----------------------------

The following example will load a directory of shapefiles in the ``opengeo`` workspace. This directory will need to be either on the machine that is running GeoServer or accessible to that machine in some way, as importing shapefiles from a remote client is not currently supported.

#. Open the Layer Importer. You will need to log in with administrator credentials.

#. In the box marked :guilabel:`Choose a data source to import from` select :guilabel:`Spatial Files`.

   .. figure:: img/sources_choosesourcefiles.png

      Spatial Files data source

#. In the box marked :guilabel:`Configure the data source`, click :guilabel:`Browse...` to open the file chooser.

   .. figure:: img/sources_spatialfiles.png

      Click Browse to select a file

#. Navigate through the directory hierarchy to the directory that contains the shapefiles. Click to open that directory, so that the contents are showing, then click :guilabel:`OK`.

   .. figure:: img/sources_filechooser.png

      Selecting a directory of shapefiles

#. In the box marked :guilabel:`Workspace`, select :guilabel:`opengeo`.

   .. figure:: img/guiexample_workspace.png

      Selecting the opengeo workspace

#. Click :guilabel:`Next` to continue.

#. The contents of the directory will be analyzed by the Layer Importer. On the next page, all layers found will be displayed.  Select the layers for import, then click :guilabel:`Import` to complete to the process. 

   .. figure:: img/layerlist_select.png

      List of shapefiles ready for import

#. The layers will all be loaded into GeoServer. After completion, a select box will appear next to each layer, containing links to the (OpenLayers) Layer Preview and Google Earth. Click on any of these to view the newly-loaded layers.

   .. figure:: img/guiexample_previewlinks.png

      Layer previewing options

.. _dataadmin.importer.guiexample.geotiff:

Importing a GeoTIFF file
------------------------

The following example will import a zipped GeoTIFF file ``landuse.zip`` and create a new data store in the ``opengeo`` workspace. 

The following example will load a directory of shapefiles in the ``opengeo`` workspace. This directory will need to be either on the machine that is running GeoServer or accessible to that machine in some way, as importing shapefiles from a remote client is not currently supported.

#. Open the Layer Importer. You will need to log in with administrator credentials.

#. In the box marked :guilabel:`Choose a data source to import from` select :guilabel:`Spatial Files`.

   .. figure:: img/sources_choosesourcefiles.png

      Spatial Files data source

#. In the box marked :guilabel:`Configure the data source`, click :guilabel:`Browse...` to open the file chooser.

   .. figure:: img/sources_spatialfiles.png

      Click Browse to select a file

#. Navigate through the directory hierarchy to the file and click to select it. Don't click :guilabel:`OK` unless you want to import :ref:`all spatial files in the directory <dataadmin.importer.guiexample.shpdir>`.

   .. figure:: img/guiexample_geotiffchooser.png

      Selecting a zipped GeoTIFF

#. In the box marked :guilabel:`Workspace`, select :guilabel:`opengeo`.

   .. figure:: img/guiexample_workspace.png

      Selecting the opengeo workspace

#. In the box marked :guilabel:`Store`, select :guilabel:`Create new`.

   .. figure:: img/guiexample_newstore.png

      Selecting a new store to be created

#. Click :guilabel:`Next` to continue.

#. The file will be analyzed by the Layer Importer. On the next page, the layer will be displayed. Select the layer for import, then click :guilabel:`Import` to complete to the process. 

   .. figure:: img/guiexample_geotiffready.png

      GeoTIFF ready for import

#. The layer will be loaded into GeoServer. After completion, a select box will appear next to the layer, containing links to the (OpenLayers) Layer Preview and Google Earth. Click on any of these to view the newly-loaded layer.

   .. figure:: img/guiexample_previewlinks.png

      Layer previewing options

.. note:: The Layer Importer doesn't require GeoTIFFs to be archived. As shown in the :ref:`previous example <dataadmin.importer.guiexample.shpdir>`, pointing the Layer Importer to a directory that contains a single GeoTIFF will be imported in exactly the same way.

.. _dataadmin.importer.guiexample.postgis:

Importing PostGIS tables
------------------------

The following example will import PostGIS tables from a database called ``municipal`` into GeoServer in the ``opengeo`` workspace. Each table will be loaded as a layer.

#. Open the Layer Importer. You will need to log in with administrator credentials.

#. In the box marked :guilabel:`Choose a data source to import from` select :guilabel:`PostGIS`.

  .. figure:: img/sources_choosesourcepostgis.png

     PostGIS data source

#. Fill in the connection parameters. On a default Linux installation, for example, the form fields would be:

   .. list-table::
      :header-rows: 1

      * - Field
        - Value
      * - :guilabel:`Connection type`
        - :guilabel:`Default`
      * - :guilabel:`Host`
        - :guilabel:`localhost`
      * - :guilabel:`Port`
        - :guilabel:`5432`
      * - :guilabel:`Database`
        - :guilabel:`municipal`
      * - :guilabel:`Schema`
        - :guilabel:`public`
      * - :guilabel:`Username`
        - :guilabel:`postgres`
      * - :guilabel:`Password`
        - :guilabel:`postgres`

   .. figure:: img/guiexample_postgisconnection.png

      PostGIS connection parameters

#. In the box marked :guilabel:`Workspace`, select :guilabel:`opengeo`.

   .. figure:: img/guiexample_workspace.png

      Selecting the opengeo workspace

#. Click :guilabel:`Next` to continue.

#. The database will be analyzed by the Layer Importer. On the next page, every table containing spatial information that GeoServer can parse will be displayed and selected for import. Click :guilabel:`Import` to complete to the process.

#. Every table will be loaded as layers in GeoServer. After completion, a select box will appear next to each layer, containing links to the (OpenLayers) Layer Preview and Google Earth. Click on any of these to view the newly-loaded layer.

   .. figure:: img/guiexample_previewlinks.png

      Layer previewing options

