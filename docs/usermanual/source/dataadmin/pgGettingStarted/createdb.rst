.. _dataadmin.pgGettingStarted.createdb:


Creating a spatial database
===========================

This section describes the process of creating a new spatially enabled PostGIS database.

.. note:: This section uses the command line utility ``createdb`` and optionally the graphical utility ``pgAdmin``. These client tools are provided as Boundless Desktop.

#. Expand the :guilabel:`Databases` item in the :guilabel:`Object browser` to reveal the available databases. 

#. Right-click :guilabel:`Databases` and select :guilabel:`New Database`.

   .. figure:: img/createdb_newdb.png

      Creating a new database in pgAdmin

#. Complete the :guilabel:`New database` form with the following information:

   * **Name**—<user-defined database name>
   * **Owner**—postgres 
      
   .. figure:: img/createdb_newdbsettings.png

      New database settings

#. Click :guilabel:`OK`.

#. Either click :guilabel:`Execute arbitrary SQL queries` on the pgAdmin toolbar or click :menuselection:`Tools --> Query tool` to open the :guilabel:`Query` dialog box.

#. Enter the following query into the :guilabel:`SQL editor` input box and click the :guilabel:`Execute query` button, or press **F5**, to run the query. 

   .. code-block:: sql

      CREATE EXTENSION postgis;

   .. figure:: img/createdb_postgisext.png

      Creating a new PostGIS database.

#. Verify the database was created correctly by running the management function ``postgis_full_version()`` in the :guilabel:`SQL editor`. It should return version and build configuration information. 

   .. code-block:: sql

      SELECT postgis_full_version();

   .. figure:: img/createdb_postgisversion.png

      Verifying a new PostGIS database

   If the command runs successfully the PostGIS database is setup correctly and ready to use. 

#. Double-click the new database item in the :guilabel:`Object browser` to display the contents. Inside the :guilabel:`public` schema, you will see one PostGIS-specific metadata table, :guilabel:`spatial_ref_sys` (for further information, see the section on :ref:`dataadmin.pgBasics.metatables`).

   .. figure:: img/postgis_metatables.png
   
      Spatial metadata tables

   .. warning:: If you don't see this table, your database was not created correctly.

   .. todo:: what should they do in this case? ref to troubleshooting


Creating a spatial database from the command line
-------------------------------------------------

.. todo:: Say more about groups and roles.

You can also create a PostGIS database from the command line with the ``createdb`` and ``psql`` commands. 

.. code-block::  console

  createdb -U postgres <DATABASENAME>
  psql -U postgres -d <DATABASENAME> -c 'CREATE EXTENSION postgis'

