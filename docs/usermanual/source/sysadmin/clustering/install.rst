.. _sysadmin.clustering.install:

Installing the clustering extension
===================================

The clustering extension is not installed by default in :ref:`installations <installation>` of OpenGeo Suite. It must be installed separately and then later :ref:`enabled <sysadmin.clustering.config>`.

Install
-------

Windows
~~~~~~~

The clustering extension is set to be installed on the "Components" page of the installer wizard. Expand the Clustering options, and then check the box next to Clustering.

If OpenGeo Suite is installed without the clustering extension, run the installer again, and at the "Components" page of the installer wizard, uncheck all other components aside from "Clustering", and then continue with the install.

.. todo:: RESTART REQUIRED?

OS X
~~~~

The clustering extension is available in the OpenGeo Suite disk image under the folder "OpenGeo Extensions".

.. todo:: UNSURE HOW THIS WORKS.

Linux
~~~~~

The clustering extension is available as a separate package, called ``geoserver-clustering``. To install the clustering extension, use the package manager to install this package.

Red Hat / CentOS / Fedora::

  yum install geoserver-clustering

Ubuntu::

  apt-get install geoserver clustering

Restart GeoServer after installation.

.. todo:: RESTART REQUIRED?

Production WARs
~~~~~~~~~~~~~~~

The clustering extension must be downloaded and installed manually when using the Production WARs.

#. Stop the servlet container (or just the GeoServer webapp).

#. Download this archive:

   .. todo:: SOME LINK

#. Extract the archive. Copy the ``.jar`` files into ``<webapps>/geoserver/WEB-INF/lib``, where ``<webapps>`` is the location of the webapps served by the servlet container (such as Tomcat).

#. Restart the servlet container (or just the GeoServer webapp).

Verification
------------

.. todo:: Verify that the extension was installed correctly by going SOMEWHERE.
