.. _dataadmin.pgBasics.3d_types:


Working with 3-D Geometries
===========================


3-D Geometries
--------------

PostGIS supports additional dimensions on all geometry types in the form of a "Z" dimension for height information and an "M" dimension for additional information such as time, road-miles, or upstream-distance information, for each coordinate.

For 3-D and 4-D geometries, the extra dimensions are added as extra coordinates for each vertex in the geometry and the geometry type is enhanced to indicate how to interpret the extra dimensions. Adding the extra dimensions results in three extra possible geometry types for each geometry primitive:

* Point (a 2-D type)-Also includes PointZ, PointM and PointZM types
* Linestring (a 2-D type)—Also includes LinestringZ, LinestringM and LinestringZM types
* Polygon (a 2-D type)—Also includes PolygonZ, PolygonM and PolygonZM types
 
For well-known text (:term:`WKT`) representation, the format for higher dimension geometries is provided by the ISO SQL/MM specification. The extra dimension information is simply added to the text string after the type name, and the extra coordinates added after the X/Y information. For example:

* POINT ZM (1 2 3 4)
* LINESTRING M (1 1 0, 1 2 0, 1 3 1, 2 2 0)
* POLYGON Z ((0 0 0, 0 1 0, 1 1 0, 1 0 0, 0 0 0))
 
The :command:`ST_AsText()` function will return the above representations for 3-D and 4-D geometries.

For well-known binary (:term:`WKB`) representation, the format for higher dimension geometries is given by the ISO SQL/MM specification. The BNF form of the format is available from http://svn.osgeo.org/postgis/trunk/doc/bnf-wkb.txt.

In addition to higher-dimension forms of the standard types, PostGIS includes 3-D types:

* TIN—Models triangular meshes stored as rows in your database 
* POLYHEDRALSURFACE—Models volumetric objects in your database
 
As both these types are for modelling 3-D objects, it makes sense to use the Z variants. An example of a POLYHEDRALSURFACE Z would be the 1 unit cube:

.. code-block:: console

  POLYHEDRALSURFACE Z (
    ((0 0 0, 0 1 0, 1 1 0, 1 0 0, 0 0 0)),
    ((0 0 0, 0 1 0, 0 1 1, 0 0 1, 0 0 0)),
    ((0 0 0, 1 0 0, 1 0 1, 0 0 1, 0 0 0)),
    ((1 1 1, 1 0 1, 0 0 1, 0 1 1, 1 1 1)),
    ((1 1 1, 1 0 1, 1 0 0, 1 1 0, 1 1 1)),
    ((1 1 1, 1 1 0, 0 1 0, 0 1 1, 1 1 1))
  )
  
  
3-D Functions
--------------

There are a number of functions for calculating relationships between 3-D objects:

* :command:`ST_3DClosestPoint`—Returns the 3-dimensional point on g1 that is closest to g2. This is the first point of the 3D shortest line.
* :command:`ST_3DDistance`—For geometry type Returns the 3-dimensional Cartesian minimum distance (based on spatial ref) between two geometries in projected units
* :command:`ST_3DDWithin`—For 3d (z) geometry type Returns true if two geometries 3d distance is within number of units
* :command:`ST_3DDFullyWithin`—Returns true if all of the 3D geometries are within the specified distance of one another
* :command:`ST_3DIntersects`—Returns TRUE if the Geometries "spatially intersect" in 3d - only for points and linestrings
* :command:`ST_3DLongestLine`—Returns the 3-dimensional longest line between two geometries
* :command:`ST_3DMaxDistance`—Returns the 3-dimensional Cartesian maximum distance (based on spatial ref) between two geometries in projected units (geometry type)
* :command:`ST_3DShortestLine`—Returns the 3-dimensional shortest line between two geometries

For example, use the :command:`ST_3DDistance` function to calculate the distance between the unit cube and a point:

.. code-block:: sql

  -- This is really the distance between the top corner
  -- and the point.
  SELECT ST_3DDistance(
    'POLYHEDRALSURFACE Z (
      ((0 0 0, 0 1 0, 1 1 0, 1 0 0, 0 0 0)),
      ((0 0 0, 0 1 0, 0 1 1, 0 0 1, 0 0 0)),
      ((0 0 0, 1 0 0, 1 0 1, 0 0 1, 0 0 0)),
      ((1 1 1, 1 0 1, 0 0 1, 0 1 1, 1 1 1)),
      ((1 1 1, 1 0 1, 1 0 0, 1 1 0, 1 1 1)),
      ((1 1 1, 1 1 0, 0 1 0, 0 1 1, 1 1 1))
    )'::geometry,
    'POINT Z (2 2 2)'::geometry
  );

A shorter form of the same query would be:

.. code-block:: sql

  SELECT ST_3DDistance(
    'POINT Z (1 1 1)'::geometry,
    'POINT Z (2 2 2)'::geometry
  );
  

Both queries return 1.73205080756888 == sqrt(3).
    

N-D indexes
-----------

Once your data is stored in higher dimensions it may make sense to index it. However, you should think carefully about the distribution of your data in all dimensions before applying a multi-dimensional index. 

Indexes are only useful when they allow the database to significantly reduce the number of returned rows as a result of a WHERE condition. For a higher dimension index to be useful, the data must cover a wide range of that dimension, relative to the type of queries you are constructing. For example:

A set of DEM points would probably be a *poor* candidate for a 3-D index, since the queries would usually extracting a 2-D box of points, and rarely attempting to select a Z-slice of points.

A set of GPS traces in X/Y/T space might be a *good* candidate for a 3-D index, if the GPS tracks overlapped each other frequently in all dimensions (for example, driving the same route over and over at different times). This would result in a large variability in all dimensions of the data set.

You can create a multi-dimensional index on data of any dimensionality (even mixed dimensionality). For example, to create a multi-dimensional index on the ``nyc_streets`` table, use:

.. code-block:: sql

  CREATE INDEX nyc_streets_gix_nd ON nyc_streets USING GIST (the_geom gist_geometry_ops_nd);
  
The ``gist_geometry_ops_nd`` parameter advises PostGIS to use the N-D index instead of the 2-D index.

Once you have built the index, you can use it in queries with the ``&&&`` index operator. ``&&&`` adopts the same semantics as ``&&``, (bounding boxes interact), but applies those semantics using all the dimensions of the input geometries. Geometries with mis-matching dimensionality do not interact.

.. code-block:: sql

  -- Returns true (both 3-D on the zero plane)
  SELECT 'POINT Z (1 1 0)'::geometry &&& 'POLYGON ((0 0 0, 0 2 0, 2 2 0, 2 0 0, 0 0 0))'::geometry;
  
  -- Returns false (one 2-D one 3-D)
  SELECT 'POINT Z (1 1 1)'::geometry &&& 'POLYGON ((0 0, 0 2, 2 2, 2 0, 0 0))'::geometry;
  
  -- Returns true (the volume around the linestring interacts with the point)
  SELECT 'LINESTRING Z(0 0 0, 1 1 1)'::geometry &&& 'POINT(0 1 1)'::geometry;

To search the ``nyc_streets`` table using the N-D index, replace the  ``&&`` 2-D index operator with the ``&&&`` operator.

.. code-block:: sql

  -- N-D index operator
  SELECT gid, name 
  FROM nyc_streets 
  WHERE the_geom &&& ST_SetSRID('LINESTRING(586785 4492901,587561 4493037)',26918);

  -- 2-D index operator
  SELECT gid, name 
  FROM nyc_streets 
  WHERE the_geom && ST_SetSRID('LINESTRING(586785 4492901,587561 4493037)',26918);

The results should be the same. 


.. note:: Using a N-D index has a slightly higher performance cost compared to using a 2-D index, so only use N-D indexes when you are certain that N-D queries will improve the result of your queries.







