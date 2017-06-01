.. _dataadmin.pgGettingStarted.raster2pgsql:



Loading raster data into PostGIS from the Command Line
======================================================

PostGIS provides a ``raster2pgsql`` tool for converting raster data sources into database tables. This section describes how to use this tool to load a single or multiple raster files.

.. note:: This section uses the command line utility ``raster2pgsql`` and optionally the graphical utility :command:`pgAdmin`. ``raster2pgsql`` is included with the Boundless Suite PostGIS package. ``pgAdmin`` is provided as part of :desktop:`Boundless Desktop <what_is_bd.html>`.

How It Works
------------

``raster2pgsql`` converts a raster file into a series of SQL commands that can be loaded into a database–it does **not** perform the actual loading. The output of this command may be captured into a SQL file, or piped to the ``psql`` command, which will execute the commands against a target database.

.. note:: Since ``raster2pgsql`` is compiled as part of PostGIS, the tool will support the same raster types as those compiled in the :term:`GDAL` dependency library. 

Preparation
-----------

#. Select the raster file(s) you wish to load.

#. Identify the SRID ("projection") of your data. If available, this information is accessed via the layer metadata in GeoServer.

#. Either identify the target database where you would like to load the data, or  :ref:`create a new database <dataadmin.pgGettingStarted.createdb>`. 

Loading data
------------

#. Open a terminal or command line window.

   .. note:: If the path to the ``raster2pgsql`` and ``psql`` commands haven't been included in your PATH system variable, you may wish to add them now. Please consult your operating system help for information on how to change the PATH variable.

#. Confirm PostGIS is responding to requests. The quickest way to test this is to run a ``psql`` query.

   .. code-block:: console

      psql -c "SELECT PostGIS_Version()"

   .. code-block:: console

                  postgis_version
      ---------------------------------------
       2.3 USE_GEOS=1 USE_PROJ=1 USE_STATS=1

   .. note:: These examples use the default port (5432), but substitute your own PostGIS port if different with the ``-p`` option.


#. To see a list of the supported raster formats, use ``raster2pgsql`` with the -G option.

   .. code-block:: console
   
      raster2pgsql -G

   .. code-block:: console   

     Available GDAL raster formats:
       Virtual Raster
       GeoTIFF
       National Imagery Transmission Format
       Raster Product Format TOC format
       ECRG TOC format
       Erdas Imagine Images (.img)
       CEOS SAR Image
       CEOS Image
       JAXA PALSAR Product Reader (Level 1.1/1.5)
       Ground-based SAR Applications Testbed File Format (.gff)
       ELAS
       Arc/Info Binary Grid
       Arc/Info ASCII Grid
       GRASS ASCII Grid
       SDTS Raster
       DTED Elevation Raster
       Portable Network Graphics
       JPEG JFIF
       .............

#. To convert and load a raster file into the target database in one step, run the ``raster2pgsql`` command and pipe the output into the ``psql`` command. The recommended syntax is:

   .. code-block:: console
   
      raster2pgsql -I -C -s <SRID> <PATH/TO/RASTER FILE> <SCHEMA>.<DBTABLE> | psql -d <DATABASE> 

   The command parameters are:

   * ``<SRID>``—Spatial reference identifier
   * ``<PATH/TO/RASTER FILE>``—Full path to the raster file (such as :file:`C:\\MyData\\land\\landuse.tif`)
   * ``<SCHEMA>``—Target schema where the new raster table will be created
   * ``<DBTABLE>``—New database table to be created (usually the same name as the source raster file)
   * ``<DATABASE>``—Target database where the table will be created
 
   The following example uses ``raster2pgsql`` to create an input file and upload it into 100x100 tiles. The ``-I`` option will create a spatial GiST index on the raster column after the table is created. This is strongly recommended for improved performance. The ``-C`` option will apply the raster constraints (SRID, pixel size and so on) to ensure the new raster table is correctly registered in the ``raster_columns`` view.  

   .. code-block:: console

      raster2pgsql -s 4326 -I -C -M *.tif -F -t 100x100 public.demelevation | psql -d gisdb 


   .. note:: If you omit the name of the schema and use *demelevation* instead of *public.demelevation*, the raster table will be created in the default schema of the database or user.


   .. note:: For more information about raster2pgsql command options, please refer to the `Loading and Creating Rasters <http://postgis.refractions.net/documentation/manual-2.0/using_raster.xml.html#RT_Raster_Loader>`_ section of the PostGIS Documentation.
 

   To capture the SQL commands, pipe the output to a file:

   .. code-block:: console

      raster2pgsql -s 4326 -I -C -M *.tif -F -t 100x100 public.demelevation > elev.sql
   
      psql -U postgres -d gisdb -f elev.sql


Batch Loading
-------------

Although it is feasible to run the ``raster2pgsql`` command as many times as required, it may be more efficient to create a batch file to load a number of raster files.


Windows Command (Batch)
~~~~~~~~~~~~~~~~~~~~~~~

.. note:: 
    
   This script assumes all the files have the same projection.

Create a batch file, for example :file:`loadfiles.cmd`, in the same directory as the raster files to be loaded. Add the following commands and provide the missing parameters:

.. code-block:: console

   for %%f in (*.tif) do raster2pgsql -I -s <SRID> %%f %%~nf > %%~nf.sql
   for %%f in (*.sql) do psql -d <DATABASE> -f %%f

Run this batch file to load all the selected raster files into the database.

.. note:: If you are running the Boundless Suite virtual machine on Windows, connect to the virtual machine and follow the Bash instructions.

Bash
~~~~

.. note:: 

   This script also assumes all the files have the same projection.

Create a shell script file, for example :file:`loadfiles.sh`, in the same directory as the raster files to be loaded. Add the following commands and provide the missing parameters:

.. code-block:: console

   #!/bin/bash

   for f in *.tif
   do
       raster2pgsql -I -s <SRID> $f `basename $f .tif` > `basename $f .tif`.sql
   done

   for f in *.sql
   do
       psql -d <DATABASE> -f $f
   done


Creating Raster Tables in the Database
--------------------------------------

You can also add rasters and raster tables directly to the database. A typical workflow is as follows:

#. Create a table with a raster column.

   .. code-block:: sql

      CREATE TABLE myRaster(rid serial primary key, rast raster);


#. Populate the table with some raster data by either creating empty rasters or creating rasters from other geometries. 

   
   * To create an empty raster, use :command:`ST_MakeEmptyRaster()`.

     .. code-block:: sql
 
        INSERT INTO myRasterTable(rid,rast)
        VALUES(3, ST_MakeEmptyRaster( 100, 100, 0.0005, 0.0005, 1, 1, 0, 0, 4326) );
  
   * To use an existing raster as a template for a new raster, execute the following:

     .. code-block:: sql

        INSERT INTO myRasterTable(rid,rast)
        SELECT 4, ST_MakeEmptyRaster(rast)
          FROM myRasterTable WHERE rid = 3;

     Confirm the successful insertion of the two rasters and display the raster metadata with :command:`ST_MetaData()`:

     .. code-block:: sql
      
        SELECT rid, (md).*
          FROM (SELECT rid, ST_MetaData(rast) As md 
	              FROM myRasterTable
	              WHERE rid IN(3,4)) As foo;

     .. code-block:: console

        rid|upperleftx|upperlefty|width|height|scalex|scaley|skewx|skewy|srid|numbands
        ---+----------+-----------+----+-------+-----+------+-----+-----+----+----------
        3  | 0.0005   | 0.0005   | 100 | 100  | 1    | 1    | 0   | 0   |4326| 0
        4  | 0.0005   | 0.0005   | 100 | 100  | 1    | 1    | 0   | 0   |4326| 0


   * To create a raster from an existing geometry, use :command:`ST_AsRaster()`.

     .. code-block:: sql
   
        CREATE TABLE myNewRaster AS
          SELECT 1 AS rid, ST_AsRaster((
               SELECT
                  ST_Collect(geom)
               FROM myGeomTable
               ), 1000.0, 1000.0 )
          AS rast;

   
   * To create a new raster table based on an existing raster table but with a different projection, use :command:`ST_Transform()`. If no projection algorithm is specified, *NearestNeighbor* is used by default. The following example will use the Bilinear algorithm.

     .. note::

       Algorithm options are: NearestNeighbor, Bilinear, Cubic, CubicSpline, and Lanczos.
    
     .. code-block:: sql


        SELECT ST_Width(myNewRaster) As w_before, ST_Width(wgs_84) As w_after,
          ST_Height(myNewRaster) As h_before, ST_Height(wgs_84) As h_after
             FROM 
	           ( SELECT rast As myNewRaster, ST_Transform(rast,4326) As wgs_84,
                 ST_Transform(rast,4326, 'Bilinear') AS wgs_84_bilin
	               FROM aerials.o_2_boston 
			         WHERE ST_Intersects(rast,
				        ST_Transform(ST_MakeEnvelope(-71.128, 42.2392,-71.1277, 
                                             42.2397, 4326),26986) )
		           LIMIT 1) As foo;


     .. code-block:: console

        w_before | w_after | h_before | h_after
        ------ --+-------- +----------+---------
        200      |  228    | 200      | 170


#. To optimize query performance for the raster table, create a spatial index on the raster column.

   .. code-block:: sql

     CREATE INDEX myRasterTable_rast_st_convexhull_idx ON myRasterTable USING gist(ST_ConvexHull(rast));


   .. note:: Pre-2.0 versions of PostGIS raster were based on the envelope rather than the convex hull. To ensure spatial indexes work correctly in PostGIS 2.0, drop any existing envelope indexes and replace them with convex hull based indexes.

Enabling GDAL inside PostGIS
----------------------------

By default, PostGIS is not setup to use the GDAL libraries. To enable it;

   RedHat:
  
        #. Edit the :file:`/var/lib/pgsql/.bash_profile` file

        #. Add the following lines;
	
            .. code-block:: bash
  
                POSTGIS_GDAL_ENABLED_DRIVERS=ENABLE_ALL
                export POSTGIS_GDAL_ENABLED_DRIVERS

        #. Restart postgresql

           .. code-block:: bash

                service postgresql-9.6 restart



   Ubuntu: 

        #. Edit the :file:`/etc/postgresql/9.6/main/environment` file

        #. Add the following lines;

            .. code-block:: bash

                POSTGIS_GDAL_ENABLED_DRIVERS=ENABLE_ALL
                export POSTGIS_GDAL_ENABLED_DRIVERS

        #. Restart postgresql

           .. code-block:: bash

                service postgresql restart


To verify that this is working, execute "SELECT st_GDALDrivers();".  This should give you a long list of supported GDAL format drivers.

