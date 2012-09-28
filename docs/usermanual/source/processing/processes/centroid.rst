.. _processing.processes.centroid:

Centroid
========

.. todo:: Graphic needed.

Description
-----------

The ``gs:Centroid`` process takes a feature collection and returns a point feature collection. For lines, points are generated at the line midpoint, and for polygons, points are generated at the polygon centroid. Attributes names and values are not affected by this process.

Inputs and outputs
------------------

This process accepts :ref:`processing.processes.formats.fcin` and returns :ref:`processing.processes.formats.fcout`.

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

Outputs
^^^^^^^

.. list-table::
   :header-rows: 1

   * - Name
     - Description
     - Type
   * - ``result``
     - Centroids of input features
     - SimpleFeatureCollection

Notes on usage
--------------

* If a feature collection consisting of point geometries are supplied, the output will be identical to the input.
