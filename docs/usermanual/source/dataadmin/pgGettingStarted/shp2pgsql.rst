.. _dataadmin.pgGettingStarted.shp2pgsql:


Loading data into PostGIS from the Command Line
===============================================

PostGIS includes the ``shp2pgsql`` tool for converting a single or multiple shapefiles into database tables.

.. note::
   This section uses the command line utility ``shp2pgsql`` and optionally the graphical utility ``pgAdmin``. These tools may not be automatically present, depending on the type of installation of OpenGeo Suite. Please see the :ref:`intro.installation` section for information on how to install these tools for your platform.


How It Works
------------

``shp2pgsql`` converts a shapefile into a series of SQL commands that can be loaded into a database–it does **not** perform the actual loading. The output of this command may be captured in a SQL file, or piped directly to the ``psql`` command, which will execute the commands against a target database.

Preparation
-----------

#. Select the shapefile you wish to load—you will need all the files: ``.shp``, ``.shx``, and ``.dbf`` and so on.

#. Identify the SRID ("projection") of your data. If available, this information is easily accessed via the layer metadata in GeoServer. If the projection is unknown, use a service like `prj2epsg.org <http://prj2epsg.org>`_ to upload and convert the shapefile's ``.prj`` file to a SRID code.

#. Either identify the target database where you would like to load the data, or :ref:`create a new database <dataadmin.pgGettingStarted.createdb>`. 

Loading data
------------

#. Open a terminal or command line window.

   .. note::

     If the path to the ``shp2pgsql`` and ``psql`` commands haven't been included in your PATH system variable, you may wish to add them now. Please consult your operating system help for information on how to change the PATH variable.

#. Confirm PostGIS is responding to requests by executing the following ``psql`` query:

   .. code-block:: console

      psql -c "SELECT PostGIS_Version()"

   .. code-block:: console

                  postgis_version
      ---------------------------------------
       2.0 USE_GEOS=1 USE_PROJ=1 USE_STATS=1

   .. note::

     These examples use the default of 5432, but substitute your own PostGIS port if different with the ``-p`` option.

#. Run the ``shp2pgsql`` command and pipe the output into the ``psql`` command to load the shapefile into the database in one step. The recommended syntax is:

   .. code-block:: console

      shp2pgsql -I -s <SRID> <PATH/TO/SHAPEFILE> <SCHEMA>.<DBTABLE> | psql -d <DATABASE>

   The command parameters are:

   * ``<SRID>``—Spatial reference identifier
   * ``<PATH/TO/SHAPEFILE>``—Full path to the shapefile (such as :file:`C:\\MyData\\roads\\roads.shp`)
   * ``<SCHEMA>``—Target schema where the new table will be created
   * ``<DBTABLE>``—New database table to be created (usually the same name as the source shapefile)
   * ``<DATABASE>``—Target database where the table will be created


   .. code-block:: console

      shp2pgsql -I -s 4269 C:\MyData\roads\roads.shp roads | psql -d MyDatabase

   The ``-I`` option will create a spatial index after the table is created. This is strongly recommended for improved performance. For more information about shp2pgsql command options, please refer to the `Using the Loader <http://postgis.refractions.net/documentation/manual-2.0/using_postgis_dbmanagement.html#id2853463>`_ section of the PostGIS Documentation.


#. If you want to capture the SQL commands, pipe the output to a file:

   .. code-block:: console

      shp2pgsql -I -s <SRID> <PATH/TO/SHAPEFILE> <DBTABLE> > SHAPEFILE.sql

   The file can be loaded into the database later by executing the following:

   .. code-block:: console

      psql -d <DATABASE> -f SHAPEFILE.sql

The shapefile has now been imported as a table in your PostGIS database. You can verify this by either using pgAdmin to view the list of tables, or by executing the following query at the command line:

.. code-block:: console

   psql -U <USERNAME> -d <DATABASE> -c "\d"

.. note::

  The specific command parameters will depend on your local configuration.

.. code-block:: console

      Schema |         Name         |   Type   |  Owner
     --------+----------------------+----------+----------
      public | bc_2m_border         | table    | postgres
      public | bc_2m_border_gid_seq | sequence | postgres
      public | geometry_columns     | view     | postgres
      public | spatial_ref_sys      | table    | postgres


Batch loading
-------------

Although it is feasible to run the ``shp2pgsql`` command as many times as required, it may be more efficient to create a batch file to load a number of shapefiles.


Windows Command (Batch)
~~~~~~~~~~~~~~~~~~~~~~~

.. note:: This script assumes all the files have the same projection.

Create a batch file, for example :file:`loadfiles.cmd`, in the same directory as the shapefiles to be loaded. Add the following commands and provide the missing parameters:

.. code-block:: console

   for %%f in (*.shp) do shp2pgsql -I -s <SRID> %%f %%~nf > %%~nf.sql
   for %%f in (*.sql) do psql -d <DATABASE> -f %%f

Run this batch file to load all the selected shapefiles into the database.

Bash
~~~~

.. note:: This script also assumes all the files have the same projection.

Create a shell script file, for example :file:`loadfiles.sh`, in the same directory as the shapefiles to be loaded. Add the following commands and provide the missing parameters:

.. code-block:: console

   #!/bin/bash

   for f in *.shp
   do
       shp2pgsql -I -s <SRID> $f `basename $f .shp` > `basename $f .shp`.sql
   done

   for f in *.sql
   do
       psql -d <DATABASE> -f $f
   done



