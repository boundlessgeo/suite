.. _webapps.gxp.plugin.action:

Plugin with action only
=======================

The first example plugin will contain only an action, with no output. Specifically, the plugin will add a button called "Draw Box" to the toolbar which when clicked will allow the user to draw a rectangle on the map.

New application setup
---------------------

#. To begin, create a new application and run it in debug mode.

   .. note:: Please see the section on :ref:`webapps.sdk` for details about creating a new application. This tutorial will assume an application called "myapp".

   OS X / Linux:

   .. code-block:: console

      suite-sdk create ~/myapp gxp
      suite-sdk debug ~/myapp

   Windows:

   .. code-block:: console

      suite-sdk create "%USERPROFILE%\myapp" gxp
      suite-sdk debug "%USERPROFILE%\myapp"

#. Verify in the browser that the application is running successfully by navigating to ``http://localhost:9080/``, replacing ``localhost`` with the name of the host where the SDK is being served.

Creating a basic plugin
-----------------------

#. In the :file:`src/app` directory inside the application, create a :file:`plugins` directory.

#. In a text editor, create a new file called :file:`DrawBox.js` in the :file:`plugins` directory. This file will contain the plugin code. 

#. Add the following content to :file:`DrawBox.js`:

   .. literalinclude:: script/action_DrawBox_initial.js
      :language: javascript

   As for user interaction, this code will only add a button to the toolbar with the text "Draw box". This button will not have any functionality. Also, the final line registers the ``ptype`` name as a shortcut for creating the plugin.

   .. note:: This example sets a namespace for the plugin called "myapp", but this can be changed, so long as any new namespace is used consistently throughout. In addition, we recommend you include a prefix on the name of the ptype that matches the namespace, but this is not required.

   .. note:: Find out more about the `Tool.js plugin <../../../sdk-api/lib/plugins/Tool.html>`_ in the SDK API.


Connect plugin to application
-----------------------------

#. Now that the plugin has been created, it must be connected to the application. Open :file:`src/app/app.js` and add a dependency at the top:

   .. literalinclude:: script/action_app.js
      :language: javascript
      :lines: 15

#. In the ``tools`` configuration section of the file add the following item to the bottom of the list:

   .. literalinclude:: script/action_app.js
      :language: javascript
      :lines: 66-69

   This tool will place the draw box button in the Map Window toolbar of the map.
   
#. Save this file.

#. Since a new dependency was added, the application will need to be restarted to see the changes. In the terminal, type CTRL+C to stop the SDK and then run the debug command again.

#. Reload the application in the browser. You should now see a new button in the toolbar titled :guilabel:`Draw box`.

   .. figure:: img/action_button_drawbox.png

      Draw box button

Adding functionality
--------------------

#. The Draw Box button currently does nothing, so the next step is to add some functionality to it.

   Open :file:`DrawBox.js` for editing again. Replace the existing ``addActions`` function with the following:

   .. literalinclude:: script/action_DrawBox.js
      :language: javascript
      :lines: 17-41

   This code pulls in an `OpenLayers.Control.DrawFeature <http://dev.openlayers.org/docs/files/OpenLayers/Control/DrawFeature-js.html>`_ control that will allow you to draw rectangular geometries on the map. It also creates a vector layer that holds the boxes that are being drawn by the ``OpenLayers.Control.DrawFeature`` control. The ``handlerOptions`` specified ensure that only rectangular geometries can be drawn.

#. The layer that contains the drawn boxes should always remain visible even when new layers get added to the map. To accomplish this, the ``raiseLayer`` function is called as a listener for the ``addlayer`` event on the map. This function calls ``setLayerIndex`` to set the index for the new layer to the highest number (based on the total number of layers in the map). This ensures the new layer will be drawn last, superimposed over any other layers.

   Add the following code to the :file:`DrawBox.js`:

   .. literalinclude:: script/action_DrawBox.js
      :language: javascript
      :lines: 43-48

#. Since these functions depend on additional classes from OpenLayers and GeoExt, these dependencies must be added to the top of :file:`DrawBox.js`:

   .. literalinclude:: script/action_DrawBox.js
      :language: javascript
      :lines: 3-8

   .. note:: While it is possible to add these dependencies to :file:`src/app/app.js` instead of :file:`DrawBox.js`, it is preferable to keep the plugin dependencies with the plugin file to clarify where the dependencies are used.

#. Restart the SDK and reload the application in the browser to see the code in effect.

   .. figure:: img/action_drawingboxes.png

      Drawing boxes

Download the :download:`DrawBox.js <script/action_DrawBox.js>` and :download:`app.js <script/action_app.js>` files created in this section.

