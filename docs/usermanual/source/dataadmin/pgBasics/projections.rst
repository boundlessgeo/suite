.. _dataadmin.pgBasics.projection:


Projections
===========

Every map projection involves the distortion of areas, distances, directions and so on, to some extent. Some projections preserve area, so all objects have a relative size to each other, other projections preserve angles (conformal) like the Mercator projection. Some projections try to find a good intermediate balance with minimal distortion on several parameters. 

Common to all projections is the transformation of the (spherical) world onto a flat Cartesian coordinate system. Choosing the right projection for your data largely depends on how you will use the data.

Occasionally a single projection may not meet all your requirements and you need to transform and reproject between spatial reference systems. PostGIS includes built-in support for changing the projection of data, using the :command:`ST_Transform(geometry, srid)` function. For managing the spatial reference identifiers on geometries, PostGIS provides the :command:`ST_SRID(geometry)` and :command:`ST_SetSRID(geometry, srid)` functions.

To confirm the SRID (spatial reference identifier) of a geometry table, use the ``ST_SRID`` function.

.. code-block:: sql

   SELECT ST_SRID(the_geom) FROM myTable LIMIT 1;
  
::

  26918
  
There are two definitions of "26918" (or indeed of any valid SRID value) maintained in the PostGIS ``spatial_ref_sys`` table. The "well-known text" (``WKT``) definition is maintained in the ``srtext`` column, and the "proj.4" format in the ``proj4text`` column.

.. code-block:: sql

   SELECT * FROM spatial_ref_sys WHERE srid = 26918;

::
   
   srid  | auth_name | auth_srid | srtext                         | proj4text           
  --------+-----------+-----------+--------------------------------+--------------------
   26928 | EPSG      | 26918     | PROJCS["NAD83 / UTM zone 18N"] | +proj=utm +zone=18  

  
Both the ``srtext`` and the ``proj4text`` columns are important. The ``srtext`` column is used by external programs such as `GeoServer <../../../geoserver>`_, `uDig <http://udig.refractions.net>`_,  and `FME <http://www.safe.com/>`_, and the ``proj4text`` column is used internally by PostGIS.

Comparing data
--------------

The combination of a coordinate and a spatial reference define a location on the earth's surface. Without a spatial reference, a coordinate has no context. A "Cartesian" coordinate plane is defined as a "flat" coordinate system placed on the surface of Earth. Because PostGIS functions work on such a plane, comparison operations require that both geometries have the same spatial reference. Comparing geometries with differing SRIDs will return an error:

.. code-block:: sql

  SELECT ST_Equals(
           ST_GeomFromText('POINT(0 0)', 4326),
           ST_GeomFromText('POINT(0 0)', 26918)
           );

::

  ERROR:  Operation on two geometries with different SRIDs
  CONTEXT:  SQL function "st_equals" statement 1
  


Transforming data
-----------------

To transform data from one SRID to another, you must first verify that your geometry has a valid SRID. To confirm this, query the ``geometry_columns`` view.

.. code-block:: sql

  SELECT f_table_name AS name, srid 
  FROM geometry_columns where f_table_name = 'myGeomTable';
  
::

          name         | srid  
  ---------------------+-------
   myGeomTable         | 26918


To identify which spatial reference system SRID 26918 represents, query the ``spatial_ref_sys`` table as follows:

.. code-block:: sql

  SELECT srtext FROM spatial_ref_sys WHERE srid = 26918;
  
::

  PROJCS["NAD83 / UTM zone 18N",
    GEOGCS["NAD83",
      DATUM["North_American_Datum_1983",
        SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],
        TOWGS84[0,0,0,0,0,0,0],
        AUTHORITY["EPSG","6269"]],
      PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],
      UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],
      AUTHORITY["EPSG","4269"]],
    UNIT["metre",1,AUTHORITY["EPSG","9001"]],
    PROJECTION["Transverse_Mercator"],
    PARAMETER["latitude_of_origin",0],
    PARAMETER["central_meridian",-75],
    PARAMETER["scale_factor",0.9996],
    PARAMETER["false_easting",500000],
    PARAMETER["false_northing",0],
    AUTHORITY["EPSG","26918"],
    AXIS["Easting",EAST],
    AXIS["Northing",NORTH]]


The SRID 26918 corresponds to the spatial reference UTM (Universal Transverse Mercator) for zone 18. 

To reproject the table ``myGeomTable`` into geographic coordinates, the most commonly used SRID is 4326—longitude/latitude on the WGS84 spheroid. 


.. code-block:: sql

  SELECT srtext FROM spatial_ref_sys WHERE srid = 4326;
  
::

  GEOGCS["WGS 84",
    DATUM["WGS_1984",
      SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],
      AUTHORITY["EPSG","6326"]],
    PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],
    UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],
    AUTHORITY["EPSG","4326"]]


.. note:: For further information on the 4326 spatial reference, see `spatialreference.org <http://spatialreference.org/ref/epsg/4326/>`_.


To convert the UTM coordinates of a particular feature in a geometry table to geographic coordinates, use :command:`ST_Transform()`. For example:


.. code-block:: sql

  SELECT ST_AsText(ST_Transform(the_geom,4326)) 
  FROM nyc_subway_stations 
  WHERE name = 'Broad St';
  
::

  POINT(-74.0106714688735 40.7071048155841)

.. warning:: The ``ST_Transform`` function may be used to transform data but be careful using it for on-the-fly conversion, as spatial indexes are built using the SRID of the stored geometries. If a comparison is done in a different SRID, spatial indexes are often not used. **The recommended best practice is to choose one SRID for all the tables in your database.** Only use the transformation function when you are reading or writing data to external applications.

  
Updating the SRID
-----------------

Occasionally when loading data into PostGIS, the data is loaded correctly but the SRID hasn't been registered. This can be confirmed by querying the ``geometry_columns`` view as follows:

.. code-block:: sql

  SELECT f_table_name AS name, srid 
  FROM geometry_columns;
  
::

          name         | srid  
  ---------------------+-------
   nyc_census_blocks   | 26918
   nyc_neighborhoods   | 26918
   nyc_streets         | 26918
   nyc_subway_stations | 26918
   myGeomTable         |     0

If you load data or create a new geometry without specifying an SRID, the SRID value will be 0. To manually register the correct SRID for a geometry table, execute the following:

.. code-block:: sql

  ALTER TABLE myGeomTable
    ALTER COLUMN geom
    SET DATA TYPE geometry(Geometry,26910)
    USING ST_SetSRID(geom, 26910);
  
This will update the SRID registration for the table's geometry column and set the SRID number of the geometries on the table, but not transform the data. 
