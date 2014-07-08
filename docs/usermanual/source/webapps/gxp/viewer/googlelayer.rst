.. _webapps.gxp.viewer.googlelayer:

Adding a Google base layer
==========================

This section describes how to add the ability to add a Google Maps layer to the viewer application.

.. warning:: Before adding Google components to your applications, make sure that the `Google Terms of Use <https://developers.google.com/terms/>`_ allow you to do so.

Navigate to the :file:`src/app/app.js` in the :file:`myviewer` directory. Open up this file in a text editor. In the `API documentation <../../../sdk-api/>`_, find `gxp.plugins.GoogleSource <../../../sdk-api/lib/plugins/GoogleSource.html>`_. This provides the base Google Maps functionality.

The ``ptype`` for ``gxp.plugins.GoogleSource`` is ``gxp_googlesource``. Open up :file:`app.js`, and configure this source:

.. code-block:: javascript

    google: {
        ptype: "gxp_googlesource"
    }

Next search for the ``layers`` section, and add a Google base layer:

.. code-block:: javascript

    {
        source: "google",
        name: "ROADMAP",
        group: "background"
    }

In the build config at the top of :file:`app.js`, add a dependency line for :file:`plugins/GoogleSource.js`.

.. code-block:: javascript

  * @require plugins/GoogleSource.js

Finally, restart your application. There will now be a new base layer called "Google RoadMap" in our viewer:

.. figure:: img/viewer_google.png

