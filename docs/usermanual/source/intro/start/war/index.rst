.. _intro.installation.war:

OpenGeo Suite for Application Servers
=====================================

In addition to being available through installers and packages, OpenGeo Suite components are available as operating system independent web application archives (WAR). This is the recommended method of install for systems that already have an application server in place. Rather than install a second Tomcat or Jetty container, it is desirable to deploy the applications on the existing infrastructure.

The individual applications shipped as part of the WAR bundle are:

* GeoServer
* GeoExplorer
* GeoWebCache
* Dashboard

As PostGIS is not a web application, it is not included in this bundle. If you want to use PostGIS as part of your OpenGeo Suite installation, you should use the packages available for your operating system, and install only the PostGIS component.

QGIS is also not included. Boundless has installers for :ref:`Windows <intro.installation.windows.qgis>` and :ref:`OS X <intro.installation.mac.qgis>`. To use QGIS with Linux, please see the `QGIS community installation instructions <https://www.qgis.org/en/site/forusers/download.html>`_.


Installing an application server
--------------------------------

.. note:: If you already have an application server installed, you may skip to the next section.

OpenGeo Suite is compatible with a number of application servers, among them Jetty, JBoss, and WebSphere. One of the most popular platforms is `Apache Tomcat <http://tomcat.apache.org/>`_. Tomcat is available for all operating systems and is a stable and well-tested solution.

The following sections will assume that Tomcat is used, although most of the instructions and recommended strategies will also apply to other application servers with minimal alterations.


Adding the WARs to the application server
-----------------------------------------

Web applications are usually deployed by copying the individual WAR files to an application server's :file:`webapps` directory. You may have to restart the container service afterwards. Otherwise, please see your application server's instructions for further information on deploying web applications.

.. todo:: More probably needs to be said here.

Installation strategies
-----------------------

The main benefit of the application server bundle is its flexibility. It is up to you determine the exact deployment that suits our needs. The following describes some common deployment scenarios.

Split GeoServer and GeoWebCache
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

GeoWebCache can act as a proxy between GeoServer and a client. It may be advantageous to place GeoWebCache in an public facing servlet container, as it only hosts images and contains no data. You can then host GeoServer in a non-public facing implementation such that only GeoWebCache can access it. This provides a level of security for your data. 

Multiple GeoServers
~~~~~~~~~~~~~~~~~~~

It is possible to deploy multiple copies of GeoServer in the same application server. This may be used to implement a "round robin" strategy for handling requests. You could go further and use multiple application servers to host GeoServer instances, making your system more fault tolerant.

Separate PostGIS and GeoServer
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A recommended installation strategy is to ensure PostGIS and GeoServer are not installed on the same server. This is primarily for security reasons, to prevent PostGIS from being accessed via the web. Give that PostGIS is a separate installation from the WAR bundle, this configuration is straightforward to implement.

