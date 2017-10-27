.. _cartography.mbstyle.tutorial.polygon:

Styling a polygon layer
=======================

The countries layer is a polygon layer, and therefore we use a `fill layer <https://www.mapbox.com/mapbox-gl-js/style-spec/#layers-fill>`_ to display it.

Creating a new style
--------------------

#. Navigate to the GeoServer Styles list. Click the ``Add a new style`` option.

   Name this new style ``mbpolygon`` and set the format to ``MBStyle``.

   Under the ``Generate a default style`` option, select ``Polygon`` and click the ``Generate`` link to create a default polygon style.

   Click the ``Apply`` button, then navigate to the ``Layer Preview`` tab and select the ``countries`` layer to preview the style.

   .. figure:: ../../ysld/tutorial/img/poly_default.png

      Default polygon style

   .. note:: Your default color may vary.

#. The style will look something like this:

   .. code-block:: json

      {
          "version": 8,
          "layers": [
              {
                  "type": "fill",
                  "paint": {
                      "fill-color": "#FFFF00",
                      "fill-outline-color":"#000000"
                  }
              }
          ],
      }

Name and id
-----------

The style can be given a ``name`` parameter, and layers within the style can be given an ``id`` parameter. ``name`` is the name of the style, and may be displayed. ``id`` is a machine reference to the layer, and should be unique. Also add a ``source-layer`` parameter, which provides a reference to the layer this style should be applied to.

.. note:: When viewing the style in the Layer Preview tab, ensure the ``Preview as style group`` option is checked, to ensure that ``source-layer`` is used to determine the layer(s) to render the style on.

#. Modify the name and id elements in the default style:

   .. code-block:: yaml
      :emphasize-lines: 3, 6-7

      {
          "version": 8,
          "name": "countries",
          "layers": [
              {
                  "id": "countries",
                  "source-layer": "countries",
                  "type": "fill",
                  "paint": {
                      "fill-color": "#FFFF00",
                      "fill-outline-color":"#000000"
                  }
              }
          ],
      }

Setting basic styling
---------------------

Fill layers provide options for styling the fill (inside) of features. While they do provide a fill-outline parameter for setting an outline color, more advanced outline styling requires a line layer.

#. Fill styling is defined primarily by ``fill-color`` and ``fill-opacity``. Change the style to use a 50% transparent brown fill:

   .. code-block:: json
      :emphasize-lines: 6-7

      {
          "type": "fill",
          "id": "countries",
          "source-layer": "countries",
          "paint": {
              "fill-color": "#EFEFC3",
              "fill-opacity": 0.5
          }
      }

#. Advanced stroke styling can be added by using a seperate line layer. Line styling is defined primarily by ``line-width``, ``line-color``, and ``line-opacity``. Change the style to use a 0.5 pixel gray stroke:

   .. note:: With no opacity set, the default will be 100% opaque.

   .. code-block:: json

      {
          "type": "line",
          "id": "countries-line",
          "source-layer": "countries",
          "paint": {
              "line-color": "#777777",
              "line-width": 0.5
          }
      }


#. Additional styling options are available for both stroke and fill, and can be found in the `fill layer <https://www.mapbox.com/mapbox-gl-js/style-spec/#layers-fill>`_ and `line layer <https://www.mapbox.com/mapbox-gl-js/style-spec/#layers-line>`_ sections of the MapBox specification respectively. Use ``line-dasharray`` to change the line style to a dashed line of 4 pixels with 4 pixel gaps.

   .. code-block:: json
      :emphasize-lines: 8

      {
          "type": "line",
          "id": "countries-line",
          "source-layer": "countries",
          "paint": {
              "line-color": "#777777",
              "line-width": 0.5,
              "line-dasharray": [4, 4]
          }
      }

#. The complete style after these changes will be:

   .. code-block:: json

      {
          "version": 8,
          "name": "countries",
          "layers": [
              {
                  "type": "fill",
                  "id": "countries-fill",
                  "source-layer": "countries",
                  "paint": {
                      "fill-color": "#EFEFC3",
                      "fill-opacity": 0.5
                  }
              },
              {
                  "type": "line",
                  "id": "countries-line",
                  "source-layer": "countries",
                  "paint": {
                      "line-color": "#777777",
                      "line-width": 0.5,
                      "line-dasharray": [4, 4]
                  }
              }
          ]
      }

#. And the layer now will look like this:

   .. figure:: ../../ysld/tutorial/img/poly_basic.png

      Basic styled polygons

Adding labels
-------------

Labels can be applied to any layer using a `symbol layer <https://www.mapbox.com/mapbox-gl-js/style-spec/#layers-symbol>`_. Typically you will want to use some data attribute as the label text, usually a name.

#. Add a symbol layer with a basic label using the ``text-field`` parameter and the ``name`` attribute:

   .. code-block:: yaml
      :emphasize-lines: 24-31

      {
          "version": 8,
          "name": "countries",
          "layers": [
              {
                  "type": "fill",
                  "id": "countries-fill",
                  "source-layer": "countries",
                  "paint": {
                      "fill-color": "#EFEFC3",
                      "fill-opacity": 0.5
                  }
              },
              {
                  "type": "line",
                  "id": "countries-line",
                  "source-layer": "countries",
                  "paint": {
                      "line-color": "#777777",
                      "line-width": 0.5,
                      "line-dasharray": [4, 4]
                  }
              },
              {
                  "type": "symbol",
                  "id": "countries-symbol",
                  "source-layer": "countries",
                  "layout": {
                      "text-field": "{name}"
                  }
              }
          ]
      }

#. After this change, the map will look like this:

   .. figure:: ../../ysld/tutorial/img/poly_label_basic.png

      Basic labels

Styling labels
--------------

The default labeling parameters are not ideal, but a number of styling options are available.

#. Add the following attributes to the symbol layer layout object:

   .. list-table::
      :class: non-responsive
      :widths: 40 60
      :header-rows: 1

      * - Parameter
        - Description
      * - ``"text-transform": "uppercase"``
        - Change the label text to uppercase
      * - ``"text-size": 14``
        - Change the font size to 14
      * - ``"text-font": ["Padauk"]``
        - Change the font to Padauk
      * - ``"text-max-width": 100``
        - Wrap any labels wider than 100 pixels

.. TODO: Add explaination of glyphs for defining font sources (once this is actually implemented)

.. TODO: Add support for bold (presumably its own font)

#. Add the following attributes to the symbol layer paint object:

   .. list-table::
      :class: non-responsive
      :widths: 40 60
      :header-rows: 1

      * - Parameter
        - Description
      * - ``"text-color": '#333333'``
        - Change the font color to dark gray

#. With the label styling, the style now looks like this:

   .. code-block:: json
      :emphasize-lines: 30-37

      {
          "version": 8,
          "name": "countries",
          "layers": [
              {
                  "type": "fill",
                  "id": "countries-fill",
                  "source-layer": "countries",
                  "paint": {
                      "fill-color": "#EFEFC3",
                      "fill-opacity": 0.5
                  }
              },
              {
                  "type": "line",
                  "id": "countries-line",
                  "source-layer": "countries",
                  "paint": {
                      "line-color": "#777777",
                      "line-width": 0.5,
                      "line-dasharray": [4, 4]
                  }
              },
              {
                  "type": "symbol",
                  "id": "countries-symbol",
                  "source-layer": "countries",
                  "layout": {
                      "text-field": "{name}",
                      "text-transform": "uppercase",
                      "text-size": 14,
                      "text-font": ["Padauk"],
                      "text-max-width": 100
                  },
                  "paint": {
                      "text-color": "#333333"
                  }
              }
          ]
      }

  And the labels now appear much clearer:

     .. figure:: ../../ysld/tutorial/img/poly_label_styled.png

        Styled labels

Adding filters
--------------

Suppose we wish to display different colors for each country. The countries layer contains an attribute called ``mapcolor7``, which assigns each country a number from 1 to 7, such that no adjacent countries have the same number. We can use this attribute to control what color a country is using `filters <https://www.mapbox.com/mapbox-gl-js/style-spec/#types-filter>`_. Filters apply a condition to a layer, so that the layer is only drawn if the filter evaluates to true.

#. Replace the rule containing the polygon symbolizer with seven rules, corresponding to the seven possibilities of values for ``mapcolor7``. For each value, set the ``fill-color`` to the following:

   .. list-table::
      :class: non-responsive
      :widths: 40 60
      :header-rows: 1

      * - Filter
        - Parameter
      * - ``mapcolor7 = 1``
        - ``"fill-color": "#FFC3C3"``
      * - ``mapcolor7 = 2``
        - ``"fill-color": "#FFE3C3"``
      * - ``mapcolor7 = 3``
        - ``"fill-color": "#FFFFC3"``
      * - ``mapcolor7 = 4``
        - ``"fill-color": "#C3FFE3"``
      * - ``mapcolor7 = 5``
        - ``"fill-color": "#C3FFFF"``
      * - ``mapcolor7 = 6``
        - ``"fill-color": "#C3C3FF"``
      * - ``mapcolor7 = 7``
        - ``"fill-color": "#FFC3FF"``

#. After adding the filters, the style will look like:

   .. code-block:: json
      :emphasize-lines: 5-74

      {
          "version": 8,
          "name": "countries",
          "layers": [
              {
                  "type": "fill",
                  "filter": ["==", "mapcolor7", 1],
                  "id": "countries-fill-1",
                  "source-layer": "countries",
                  "paint": {
                      "fill-color": "#FFC3C3",
                      "fill-opacity": 0.5
                  }
              },
              {
                  "type": "fill",
                  "filter": ["==", "mapcolor7", 2],
                  "id": "countries-fill-2",
                  "source-layer": "countries",
                  "paint": {
                      "fill-color": "#FFE3C3",
                      "fill-opacity": 0.5
                  }
              },
              {
                  "type": "fill",
                  "filter": ["==", "mapcolor7", 3],
                  "id": "countries-fill-3",
                  "source-layer": "countries",
                  "paint": {
                      "fill-color": "#FFFFC3",
                      "fill-opacity": 0.5
                  }
              },
              {
                  "type": "fill",
                  "filter": ["==", "mapcolor7", 4],
                  "id": "countries-fill-4",
                  "source-layer": "countries",
                  "paint": {
                      "fill-color": "#C3FFE3",
                      "fill-opacity": 0.5
                  }
              },
              {
                  "type": "fill",
                  "filter": ["==", "mapcolor7", 5],
                  "id": "countries-fill-5",
                  "source-layer": "countries",
                  "paint": {
                      "fill-color": "#C3FFFF",
                      "fill-opacity": 0.5
                  }
              },
              {
                  "type": "fill",
                  "filter": ["==", "mapcolor7", 6],
                  "id": "countries-fill-6",
                  "source-layer": "countries",
                  "paint": {
                      "fill-color": "#C3C3FF",
                      "fill-opacity": 0.5
                  }
              },
              {
                  "type": "fill",
                  "filter": ["==", "mapcolor7", 7],
                  "id": "countries-fill-7",
                  "source-layer": "countries",
                  "paint": {
                      "fill-color": "#FFC3FF",
                      "fill-opacity": 0.5
                  }
              },
              {
                  "type": "line",
                  "id": "countries-line",
                  "source-layer": "countries",
                  "paint": {
                      "line-color": "#777777",
                      "line-width": 0.5,
                      "line-dasharray": [4, 4]
                  }
              },
              {
                  "type": "symbol",
                  "id": "countries-symbol",
                  "source-layer": "countries",
                  "layout": {
                      "text-field": "{name}",
                      "text-transform": "uppercase",
                      "text-size": 14,
                      "text-font": ["Padauk"],
                      "text-max-width": 100
                  },
                  "paint": {
                      "text-color": "#333333"
                  }
              }
          ]
      }


   .. figure:: ../../ysld/tutorial/img/poly_label_color.png

      Adjacent countries will not have the same color

Compacting thematic styles with functions
-----------------------------------------

While filters are very useful, the required syntax is still quite long, and much of the content is redundant. The exact same functionality can be accomplished much more concisely using a `categorical function <https://www.mapbox.com/mapbox-gl-js/style-spec/#types-function>`_.

#. Remove all of the polygon rules and the variable at the top, and replace with our original rule:

   .. code-block:: yaml
      :emphasize-lines: 5-13

      {
          "version": 8,
          "name": "countries",
          "layers": [
              {
                  "type": "fill",
                  "id": "countries-fill",
                  "source-layer": "countries",
                  "paint": {
                      "fill-color": "#EFEFC3",
                      "fill-opacity": 0.5
                  }
              },
              {
                  "type": "line",
                  "id": "countries-line",
                  "source-layer": "countries",
                  "paint": {
                      "line-color": "#777777",
                      "line-width": 0.5,
                      "line-dasharray": [4, 4]
                  }
              },
              {
                  "type": "symbol",
                  "id": "countries-symbol",
                  "source-layer": "countries",
                  "layout": {
                      "text-field": "{name}",
                      "text-transform": "uppercase",
                      "text-size": 14,
                      "text-font": ["Padauk"],
                      "text-max-width": 100
                  },
                  "paint": {
                      "text-color": "#333333"
                  }
              }
          ]
      }

#. Change the ``fill-color`` to the following function:

   .. code-block:: json
      :emphasize-lines: 6-18

      {
          "type": "fill",
          "id": "countries-fill",
          "source-layer": "countries",
          "paint": {
              "fill-color": {
                  "property": "mapcolor7",
                  "type": "categorical",
                  "stops": [
                      [1, "#FFC3C3"],
                      [2, "#FFE3C3"],
                      [3, "#FFFFC3"],
                      [4, "#C3FFE3"],
                      [5, "#C3FFFF"],
                      [6, "#C3C3FF"],
                      [7, "#FFC3FF"]
                  ]
              },
              "fill-opacity": 0.5
          }
      }

This sets the ``fill-color`` based on the value of ``mapcolor7``, according to the key-value pairs in the ``recode`` function: if ``mapcolor7 = 1``, set to ``'#FFC3C3'``, if ``mapcolor7 = 2`` set to ``'#FFE3E3'``, etc.

It should be noted that this will produce the *exact same output* as in the previous section.

Final style
-----------

The full style now looks like this:

.. literalinclude:: files/mbtut_poly.json
   :language: json

.. note:: :download:`Download the final polygon style <files/mbtut_poly.json>`

Continue on to :ref:`cartography.mbstyle.tutorial.point`.
