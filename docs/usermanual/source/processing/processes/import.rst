.. _processing.processes.import:

Import
======

.. todo:: Graphic needed.

Description
-----------

The ``gs:Import`` process takes a feature collection and adds it to the GeoServer catalog as a layer. It acts as a simple data loader; the contents of the feature collection are unchanged.

A few catalog parameters are added in addition to the feature collection. The desired workspace name, store name, :term:`CRS`, and CRS handling policy can all be input, but if omitted the server defaults will be used. The name of the layer can be specified, but if omitted it will be set to the name contained in the feature collection. The name of an existing style can be specified, but if omitted a default style will be chosen based on the geometry in the feature collection.

Inputs and outputs
------------------

This process accepts :ref:`processing.processes.formats.fcin` and returns a string containing the fully qualified layer name (with workspace prefix) only.

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
   * - ``workspace``
     - Target workspace (default is the system default)
     - String
     - No
   * - ``store``
     - Target store (default is the workspace default)
     - String
     - No
   * - ``name``
     - Name of the new featuretype (default is the name of the features in the collection)
     - String
     - No
   * - ``srs``
     - Target coordinate reference system (default is based on source when possible
     - CoordinateReferenceSystem
     - No
   * - ``srsHandling``
     - Desired SRS handling (default is FORCE_DECLARED, others are REPROJECT_TO_DECLARED or NONE)
     - ProjectionPolicy
     - No
   * - ``styleName``
     - Name of the style to be associated with the layer (default is a standard geometry-specific style)
     - String
     - No

Outputs
^^^^^^^

.. list-table::
   :header-rows: 1

   * - Name
     - Description
     - Type
   * - ``layerName``
     - Name of the new featuretype, with workspace
     - String