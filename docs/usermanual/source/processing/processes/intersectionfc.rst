.. _processing.processes.intersectionfc:

IntersectionFeatureCollection
=============================

.. todo:: Graphic needed.

.. todo:: Wasn't able to get this to work (MP)

Description
-----------

The ``gs:IntersectionFeatureCollection`` process allows two feature collections to be intersected via spatial intersection and by attribute combination.

The geometries in the feature collections can be intersected (``intersectionMode``) by a straight spatial intersection (``INTERSECTION``) or the output can use the original geometries from one or the other inputs (``FIRST`` or ``SECOND``) without any spatial processing.

The attributes of the output feature collection are determined by a list of attributes from both of the input geometries. Each one is specified individually as a list. If these parameters are left blank, all attributes will be used.

In addition, two more pieces of information can be included in the output. The first is the areas of each feature collection (``areasEnabled``), included as attributes ``areaA`` and ``areaB``. The second is the percentage of intersection (``percentagesEnabled``), also included as attributes ``percentageA`` and ``percentageB``.

.. todo:: What's a good use case for this?

The names of the output attributes will be altered. The new attribute names will have the originating feature collection, an underscore, and then be followed with the name of the original attribute. The maximum length of attribute name is ten characters, so if the input feature collection was ``usa:states``, the ``STATE_NAME`` attribute would be ``states_STA`` in the output feature collection.

.. todo:: This 10 character limit is lame. What if the layer name is greater than 10 characters? Would all attributes be the same?

.. todo:: What about different CRSs?

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
   * - first feature collection
     - First feature collection 
     - SimpleFeatureCollection
     - Yes
   * - second feature collection
     - Second feature collection
     - SimpleFeatureCollection
     - Yes
   * - first attributes to retain
     - First feature collection attribute to include
     - String
     - No
   * - second feature collection attribute to include
     - Second feature collection attribute to include
     - String
     - No
   * - ``intersectionMode``
     - Specifies geometry computed for intersecting features. INTERSECTION (default) computes the spatial intersection of the inputs. FIRST copies geometry A. SECOND copies geometry B.
     - IntersectionMode
     - No
   * - ``percentagesEnabled``
     - Indicates whether to output feature area percentages (attributes percentageA and percentageB)
     - Boolean
     - No
   * - ``areasEnabled``
     - Indicates whether to output feature areas (attributes areaA and areaB)
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
     - Output feature collection
     - SimpleFeatureCollection

Notes on usage
--------------

* The first input feature collection must not consist of point geometries.


