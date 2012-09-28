.. _processing.processes.simplify:

Simplify
========

.. todo:: Graphic needed.

Description
-----------

The ``gs:Simplify`` process takes a feature collection and reduces the number of vertices in each feature, thus simplifying the geometries.

The method used to do the simplification is known as the `Douglas-Peucker algorithm <http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm>`_. It uses as input a ``distance`` value, which determines how the geometries are to be simplified. Higher values denote more intense simplification.

.. todo:: Will need a better definition of the distance, and verification that the above is correct.

A flag can be set (``preserveTopology``) on whether the simplification should preserve the topology of the features.

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
   * - ``distance``
     - Simplification distance tolerance
     - double
     - Yes
   * - ``preserveTopology``
     - If True, ensures that simplified features are topologically valid
     - Boolean
     - No

Outputs
^^^^^^^

.. list-table::
   :header-rows: 1

   * - Name
     - Description
     - Type
   * - ``result``
     - The simplified feature collection
     - SimpleFeatureCollection

Notes on usage
--------------

* The distance value will be in the same units as the feature collection.

