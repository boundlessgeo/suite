.. _cartography.mbstyle.tutorial:

MBStyle tutorial
================

This tutorial provides a set of steps that users can follow to style layers using the new MBStyle styling language. It was adapted from the :ref:`YSLD tutorial <cartography.ysld.tutorial>`.

For this tutorial, you will need to download the following files from the `Natural Earth dataset <http://www.naturalearthdata.com/>`_:

.. include:: ../../ysld/tutorial/files/data.txt

These four files should be imported into GeoServer as new layers. This tutorial will assume that the layers were renamed to be ``countries``, ``roads``, ``places``, and ``DEM``, respectively.

The following pages will demonstrate how to style each of these layers to compose a map. The tutorial is divided into five steps. The first four steps will style each of the layers individually, and then the final step will be to compose the finished map.

MBStyle Expressions
^^^^^^^^^^^^^^^^^^^

In the Mapbox Style Specification, the value for any layout property, paint property, or filter may be specified as an expression. Expressions define how one or more feature property value and/or the current zoom level are combined using logical, mathematical, string, or color operations to produce the appropriate style property value or filter decision. Examples are provided at the end of this tutorial, refer to the `Mapbox Style Specification <https://www.mapbox.com/mapbox-gl-js/style-spec>`_

.. note:: Not all expressions are supported in Boundless Server, refer to :ref:`Unsupported <cartography.mbstyle.tutorial.expressions>` in the expressions section at the end of the tutorial.


.. toctree::
   :maxdepth: 1

   line
   polygon
   point
   raster
   map
   expressions
