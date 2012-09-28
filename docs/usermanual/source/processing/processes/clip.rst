.. _processing.processes.clip:

Clip
====

.. todo:: Graphic needed.

Description
-----------

The ``gs:Clip`` process will clip a feature collection by a given geometry, typically a polygon or multipolygon. Attributes names and values are not affected by this process.

In the output geometry, all features that partially intersect with the clipping geometry will return with their geometries cropped, while all features that do not intersect with the clipping geometry at all will be eliminated entirely.

Inputs and outputs
------------------

This process accepts both :ref:`processing.processes.formats.fcin` and :ref:`processing.processes.formats.geomin` and returns :ref:`processing.processes.formats.fcout`.

Inputs
^^^^^^

.. list-table::
   :header-rows: 1

   * - Name
     - Description
     - Type
     - Required
   * - ``features``
     - Input feature collection
     - SimpleFeatureCollection
     - Yes
   * - ``clip``
     - Geometry to use for clipping (in same CRS as input features)  
     - Geometry
     - Yes

Outputs
^^^^^^^

.. list-table::
   :header-rows: 1

   * - Name
     - Description
     - Type
   * - ``result``
     - Clipped feature collection
     - SimpleFeatureCollection

Notes on usage
--------------

* The clipping geometry will be in the same units as the feature collection.
* The clipping geometry can be a point or line, but this is uncommon.


