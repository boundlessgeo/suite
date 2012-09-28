.. _processing.processes.unionfc:

UnionFeatureCollection
======================

.. todo:: Graphic needed.

Description
-----------

The ``gs:UnionFeatureCollection`` process works like a merge. It takes as input two feature collections and outputs a single feature collection. This is useful for combining similar sets of features, such as layers that cover different geographic area, but otherwise contain the same type of information.

The attributes list in the output will be a union of the input attributes. If one of the input features doesn't have a particular attribute present in the other input, that value will be left blank.

Inputs and outputs
------------------

This process accepts :ref:`processing.processes.formats.fcin` and returns :ref:`processing.processes.formats.fcout`.

While this process takes only two inputs, it is possible to chain this process together with itself in order to combine more than two feature collections.

Inputs
^^^^^^

.. list-table::
   :header-rows: 1

   * - Name
     - Description
     - Type
     - Required
   * - first feature collection
     - First feature collection 
     - SimpleFeatureCollection
     - Yes
   * - second feature collection
     - Second feature collection
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
     - Output feature collection
     - SimpleFeatureCollection

Notes on usage
--------------

* Both input feature collections must have the same default geometry.
* Make sure to match the CRS of each input geometry.
* Identical features in both input collections will both be preserved as individual features, not combined.

.. todo:: What happens with mixed CRSs?


