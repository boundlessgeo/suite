.. _webmaps.composer.tutorial:

Composer tutorial
=================

This tutorial will show the basic uses of Suite Composer. In this tutorial you will:

* :ref:`Create a new project workspace <webmaps.composer.tutorial.workspace>`
* :ref:`Add data and publish layers <webmaps.composer.tutorial.layers>`
* :ref:`Add layers to a map <webmaps.composer.tutorial.map>`

The final step, styling the map, is covered in the separate :ref:`cartography.ysld`.

Data used
---------

While any data can be substituted when following along with this tutorial, the following data will specifically be shown, all from the `Natural Earth dataset <http://www.naturalearthdata.com/>`_:

.. include:: /cartography/ysld/tutorial/files/data.txt

.. _webmaps.composer.tutorial.workspace:

Creating a new project workspace
--------------------------------

The first step in making a map with Composer is to create a project workspace. The project workspace will contain all of the data, layers, and the map, separating them from the rest of the resources in Composer.

#. First, log in to Composer with your administrator credentials.

   .. note:: The default GeoServer administrator credentials are ``admin`` / ``geoserver``.

   .. figure:: img/composerblank.png

      Fresh installation

#. Click the :guilabel:`New` link and select :guilabel:`New Project Workspace`.

   .. figure:: img/npwlink.png

      Link to create a new project workspace

#. Enter the details of the project workspace:

   * **Project Name**: :kbd:`tutorial`
   * **Default?**: ``<checked>``

   When finished, click :guilabel:`Create`.

   .. figure:: img/npwpage.png

      Details for the new project workspace

#. You will see a dialog saying :guilabel:`Workspace tutorial created` and then you will be taken to the Maps tab of the project workspace.

   .. figure:: img/projectworkspace.png

      Project workspace created

.. _webmaps.composer.tutorial.layers:

Adding data and publishing layers
---------------------------------

With the project workspace created, we're now ready to load data.

#. Click the :guilabel:`Add Data` link at the top right of the page.

   .. figure:: img/adddatalink.png

      Add Data link

#. A dialog will appear for importing data to GeoServer. Either click :guilabel:`Browse` and select each of the files or drag the files onto this window.

   .. figure:: img/importfile.png

      Adding a shapefile archive to be uploaded

#. Click :guilabel:`Upload` to upload the files to GeoServer.

   .. figure:: img/uploadedfile.png

      Shapefile uploaded

#. After the upload is complete click :guilabel:`Next: Load` to review file contents. Select all of the resources and click :guilabel:`Import Selected Layers`.

   .. figure:: img/availablelayers.png
      
      Available Layers

#. Imported layers can be added to an existing map or used to create a new map. Click :guilabel:`Close`.
   
   .. figure:: img/layerimported.png
      
      Layer Imported

#. When finished with uploads, click :guilabel:`Close` to close out of the import wizard. You will see the two data sources listed on the :guilabel:`Data` tab: A directory of shapefiles containing the three shapefile resources, and a raster data source containing the DEM resource. Note specifically that for each data store, the resource is marked as :guilabel:`Published`.

   .. figure:: img/datatab.png

      Data stores after upload

#. Click the :guilabel:`Layers` tab to see the published resources.

   .. figure:: img/layerstab.png

      Published layers

#. Find the :guilabel:`ne_10m_roads` layer and click the :guilabel:`Settings` button. This will bring up the layer settings.

#. Change the layer settings to the following:

   * **Name**: :kbd:`roads` 
   * **Title**: :kbd:`Roads`

   .. todo:: ADD FIGURE

#. When finished, click :guilabel:`Update Layer Settings`.

   .. figure:: img/updatelayer.png

      Layer settings updated

#. Click :guilabel:`Close`.

#. Repeat the process of changing layer settings for the other three layers. Use the following information:

   * :guilabel:`ne_10m_admin_0_countries`

     * **Name**: :kbd:`countries` 
     * **Title**: :kbd:`Countries`

   * :guilabel:`ne_10m_populated_places`

     * **Name**: :kbd:`places` 
     * **Title**: :kbd:`Populated places`

   * :guilabel:`dem_large`

     * **Name**: :kbd:`dem` 
     * **Title**: :kbd:`DEM`

   .. figure:: img/updatednames.png

      All names changed

#. View each of the layers by clicking the :guilabel:`Style` button for each layer.

   .. figure:: img/layerstyles.png
      
      Layer Style

.. _webmaps.composer.tutorial.map:

Adding layers to a map
----------------------

Now that our layers are loaded into Composer, we will now compile them into a single map.

#. Return to the :guilabel:`tutorial` project workspace.

#. Click :guilabel:`New Map`.

#. Fill out the form with the following settings:

   * :guilabel:`Map Name`: :kbd:`tutmap`
   * :guilabel:`Title`: :kbd:`Tutorial Map`
   * :guilabel:`Projection`: :kbd:`Lat/Lan (WGS)`
   * :guilabel:`Description`: :kbd:`Composer / YSLD tutorial map`

   .. figure:: img/createmap.png

      Map settings

#. Click :guilabel:`Add Layers`.

#. Select the four layers by checking the box next to each one, and then click :guilabel:`Create Map with Selected`.

   .. figure:: img/layerselect.png

      Selecting layers to add to a map

#. The map will be created. Click the icon for the map to bring up the Style Editor.

   .. todo:: ADD FIGURE

#. In the layer list in the middle of the screen, drag the layers so that they are listed in the following order:

   * :guilabel:`places`
   * :guilabel:`roads`
   * :guilabel:`countries`
   * :guilabel:`dem`

   .. todo:: ADD FIGURE?

With the map created, the next step is to improve the styling. Please continue on at the :ref:`cartography.ysld.tutorial` to see how these layers can be styled.
