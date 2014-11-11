.. _intro.installation.redhat.install:

Installing
==========

This section describes how to install OpenGeo Suite on Red Hat-based Linux distributions. The following distributions are supported:

* Fedora 18 and 19
* CentOS 5 and 6
* RHEL 5 and 6

.. note:: QGIS, while part of OpenGeo Suite, is not currently bundled as a package by Boundless. To use QGIS with a Red Hat system, please see the `QGIS community installation instructions <https://www.qgis.org/en/site/forusers/download.html>`_.

System requirements
-------------------

OpenGeo Suite for Red Hat has the following system requirements:

* Memory: 512MB minimum (1GB recommended)
* Disk space: 750MB minimum (plus extra space for any loaded data)
* Browser: Any modern web browser is supported
* Permissions: Super user privileges are required for installation

Installation process
--------------------

This installation will add the OpenGeo Suite package repository and then install the appropriate packages. See the :ref:`Packages <intro.installation.redhat.packages>` section for details about the possible packages to install.

.. warning:: Mixing repositories is not recommended. If you already have a repository that contains some of the components of OpenGeo Suite (such as PostgreSQL) please remove them before installing OpenGeo Suite. 

The commands in this section require root privileges. 

#. Change to the ``root`` user:

   .. code-block:: bash

      sudo su - 

#. Add the OpenGeo repository by creating the file :file:`/etc/yum.repos.d/OpenGeo.repo` with the following contents::

      [opengeo]
      name=opengeo
      baseurl=http://yum.boundlessgeo.com/suite/v45/<OS>/$releasever/$basearch
      enabled=1
      gpgcheck=0

   Replace ``<OS>`` with one of "fedora", "centos", or "rhel" based on the 
   distribution.

#. Search for OpenGeo Suite packages:

   .. code-block:: bash

      yum search opengeo

   If the search command does not return any results, the repository was not added properly. Examine the output of the search command for any errors. 

#. You have options on what packages to install:

   .. note::  See the :ref:`Packages <intro.installation.redhat.packages>` section for details of individual packages.

   For server components:

   .. code-block:: bash

      yum install opengeo-server

   For client components:

   .. code-block:: bash

      yum install opengeo-client

   For both client and server components:

      yum install opengeo

After installation
------------------

Installation is now complete. Please see the section on :ref:`intro.installation.redhat.misc`.
