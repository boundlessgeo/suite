.. _sysadmin.clustering.install:

Installing the clustering extension
===================================

The clustering extension is not installed by default in :ref:`installations <installation>` of OpenGeo Suite. It must be installed separately and then later :ref:`enabled <sysadmin.clustering.setup>`.

.. note:: Prior to installation of the clustering extension, it is important to ensure that you have set up an external data directory, located in a shared location that all GeoServer instances will be able to access.

Install
-------

Windows
~~~~~~~

The clustering extension is set to be installed on the :guilabel:`Components` page of the :ref:`installer wizard <installation.windows>`. Expand the :guilabel:`GeoServer Extensions` by clicking the plus, and then check the box next to :guilabel:`Clustering`.

If OpenGeo Suite was installed without the clustering extension, first stop the OpenGeo Jetty service, then run the installer again, and at the :guilabel:`Components` page of the installer wizard, uncheck all other components aside from :guilabel:`Clustering`, and then continue with the install.

A restart of the OpenGeo Jetty service will be required.

OS X
~~~~

The clustering extension is not currently supported on using the OS X installer, as OpenGeo Suite for OS X is not designed to be used in a production environment. If you would like to use Clustering on OS X, use the Production WARs.

Linux
~~~~~

The clustering extension is available in a collection of two separate packages::

  geoserver-jdbc
  geoserver-cluster

To install the clustering extension, use the package manager.

Red Hat / CentOS / Fedora::

  yum install geoserver-jdbc
  yum install geoserver-cluster

Ubuntu::

  apt-get install geoserver-jdbc
  apt-get install geoserver-cluster

A restart of GeoServer is not required.

Production WARs
~~~~~~~~~~~~~~~

The clustering extension must be downloaded and installed manually when using the Production WARs.

#. Stop the servlet container (or just the GeoServer webapp).

#. Download this archive:

   .. note:: File names and locations to be determined

#. Extract the archive. Copy the ``.jar`` files into ``<webapps>/geoserver/WEB-INF/lib``, where ``<webapps>`` is the location of the webapps served by the servlet container (such as Tomcat).

#. Restart the servlet container (or just the GeoServer webapp).

Verification
------------

To verify that the installation of the extension was successful, look for the existence of a ``jdbcconfig`` and ``cluster`` directory inside the GeoServer data directory. If these directories were created and contain files, the installation was successful.