.. _webapps.sdk:

Creating and deploying apps with Boundless SDK
==============================================

Boundless SDK provides tools for building JavaScript-based web mapping applications backed by OpenGeo Suite. The application development life-cycle is as follows:

#. **Creation** - Generating a new template application
#. **Customization** - Adding features and functionality to the application
#. **Testing** - Deploying the application in a test mode to verify functionality and troubleshoot
#. **Packaging** - Creating a web archive that be deployed on any application server
#. **Deployment** - Deploying the application in a production environment

.. _webapps.sdk.create:

Creating a new application
--------------------------

The Boundless SDK comes with three application templates:

* ``gxp`` - A template based on GXP, GeoExt, and OpenLayers 2
* ``ol3view`` - A template for viewing, based on OpenLayers 3 and Bootstrap 
* ``ol3edit`` - A template for editing, based on OpenLayers 3 and Bootstrap

.. todo:: Need to say more about these.

To create a new application based on this template, run the ``suite-sdk create`` command::

  suite-sdk create path/to/myapp template

In the above command, the application will be called :file:`myapp` and will be placed in the :file:`path/to/myapp` directory. The ``template`` to be used must be one of the three listed above (``gxp``, ``ol3view``, ``ol3edit``).

.. warning:: Be sure to not name your application :file:`geoserver`, :file:`geoexplorer`, :file:`manager`, :file:`docs`, or any other name that might cause a conflict when deploying your application.


.. _webapps.sdk.customize:

Customizing the application
---------------------------

The method of customizing the application depends on which template is used.

* If using the ``gxp`` template, please see the section on :ref:`webapps.gxp`.
* If using the ``ol3view`` or ``ol3edit`` templates, please see the section on :ref:`webapps.ol3.templates`.

.. _webapps.sdk.debug:

Testing the application
-----------------------

Boundless SDK comes with a server that can be used to debug your application during development. The server loads all of your code as individual, uncompressed scripts, useful for debugging in a browser.

Run the following command to launch a server that loads the application in "debug mode"::

  suite-sdk debug path/to/myapp

This server will publish the :file:`myapp` application at ``http://localhost:9080/`` . Navigate to this URL to view and test your application.

.. todo:: Add image.

.. note::  Type ``suite-sdk debug --help`` to see a full list of possible arguments.

Press :command:`Ctrl-C` in the terminal window to shut down the server.

Changing the port
~~~~~~~~~~~~~~~~~

By default, the application will be published on port ``9080``. To run the server on another port, provide the ``-l <port>`` option to the debug command::

  suite-sdk debug -l 8000 path/to/myapp

This will make your application available for debugging at ``http://localhost:8000/``.

Accessing GeoServer while testing
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Applications built with Boundless SDK are designed to be deployed in the same application server as OpenGeo Suite. So these applications will expect to have GeoServer accessible at the relative URL of :file:`/geoserver`.

While testing locally, you will likely have to set up a proxy to a remote GeoServer to make it look as if it were available locally as well. To do this, provide the ``-g <URL>`` option::

  suite-sdk debug -g http://example.com:8080/geoserver path/to/myapp 

This will make the GeoServer located at ``http://example.com:8080/geoserver`` available locally to your application at the relative URL of ``http://localhost:9080/geoserver``.

.. note::

   The port and proxy options can be used together. For example, you could debug your application on port 8000 while accessing a local GeoServer running on port 8080::

     suite-sdk debug -l 8000 -g http://localhost:8080/geoserver path/to/myapp 

   This would make your application available at ``http://localhost:8000/`` while making GeoServer available on the same port at ``http://localhost:8000/geoserver``.

The testing server and proxy are suitable for debugging purposes only. Use the ``suite-sdk deploy`` command to prepare your application for production.


.. _webapps.sdk.package:

Packaging the application
-------------------------

After the applications is completed, the next step is to package it.

Packaging the application is the process of creating a web archive (WAR) that can be deployed to any application server, such as the one hosting OpenGeo Suite web applications. This process will concatenate and compress ("minify") all JavaScript resources and then create a WAR.

To package your application, run the following command::

  suite-sdk package /path/to/myapp /path/to/destination

.. note::  Type ``suite-sdk package --help`` to see a full list of possible arguments.

The above command will package the :file:`myapp` application found at :file:`/path/to/myapp` and create a :file:`myapp.war` file at :file:`/path/to/destination`. Leaving the destination option blank will cause the WAR file to be created in the current directory.


.. _webapps.sdk.deploy:

Deploying the application
-------------------------

Once the WAR file is created, it can be manually deployed to your application server.

Windows
~~~~~~~

To deploy to OpenGeo Suite for Windows, copy the WAR file to :file:`<OPENGEO_SUITE>\\jetty\\webapps`. For example, if OpenGeo Suite is installed at :file:`C:\\Program Files\\Boundless\\OpenGeo\\`, copy the WAR file to :file:`C:\\Program Files\\Boundless\\OpenGeo\\jetty\\webapps\\`

OS X
~~~~

To deploy to OpenGeo Suite for OS X, copy the WAR file to::

  ~/Library/Containers/com.boundlessgeo.geoserver/Data/Library/Application\ Support/GeoServer/jetty/webapps

Linux
~~~~~

To deploy to OpenGeo Suite for Linux (either Ubuntu or any Red Hat-based Linux), and assuming an application named :file:`myapp`:

#. Extract :file:`myapp.war` to :file:`/usr/share/opengeo/myapp`.

#. Create a file called :file:`myapp.xml` in :file:`/etc/tomcat6/Catalina/localhost/` with the following content::

     <Context displayName="myapp" docBase="/usr/share/opengeo/myapp" path="/myapp">

#. Save this file and restart Tomcat.

Application Servers
~~~~~~~~~~~~~~~~~~~

To deploy to OpenGeo Suite for Application Servers, please see the documentation for your application server.
