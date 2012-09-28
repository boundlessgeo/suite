.. _processing.processes.transform:

Transform
=========

.. todo:: Graphic needed.

Description
-----------

The ``gs:Transform`` process is used to transform a feature collection using a series of expressions. It can be thought of as a direct equivalent of the ``SELECT ... FROM`` clause in SQL. It lets you define a new feature collection with attributes computed from the original ones (which in effect allows renaming and removal). The new attributes are computed via ECQL expressions, which can process geometry as well as scalar data.

.. todo:: Definitely going to need some examples here.

The transform string is a collection of expressions of the form ``attribute=expression``.

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
   * - ``transform``
     - The transform specification, as a list of specifiers of the form name=expression, delimited by newlines or semicolons.
     - String
     - Yes

Outputs
^^^^^^^

.. list-table::
   :header-rows: 1

   * - Name
     - Description
     - Type
   * - ``result``
     - Transformed feature collection
     - SimpleFeatureCollection