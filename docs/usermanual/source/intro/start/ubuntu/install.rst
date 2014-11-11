.. _intro.installation.ubuntu.install:

Installing
==========

This section describes how to install OpenGeo Suite on Ubuntu Linux. These instructions should be followed if:

* Your system does not have OpenGeo Suite
* You are upgrading from a **minor version** of OpenGeo Suite (for example: from **4.x** to **4.y**)

Do not use these instructions if upgrading from a previous **major version** of OpenGeo Suite (for example: from **3.x** to **4.y**). Instead, see the :ref:`Upgrade <intro.installation.ubuntu.upgrade>` section.

.. note:: QGIS, while part of OpenGeo Suite, is not currently bundled as a package by Boundless. To use QGIS with an Ubuntu system, please see the `QGIS community installation instructions <https://www.qgis.org/en/site/forusers/download.html>`_.

System requirements
-------------------

The following Ubuntu versions are supported:

* `Precise Pangolin <http://releases.ubuntu.com/precise/>`_ (12.04 LTS)
* `Trusty Tahr <http://releases.ubuntu.com/trusty/>`_ (14.04 LTS)

.. warning::

   OpenGeo Suite is not supported on any other versions of Ubuntu. If running an unsupported installation, dependency conflicts may occur.

OpenGeo Suite for Ubuntu has the following system requirements:

* Memory: 512MB minimum (1GB recommended)
* Disk space: 750MB minimum (plus extra space for any loaded data)
* Browser: Any modern web browser is supported
* Permissions: Super user privileges are required for installation

Pre-installation process
------------------------

This installation will add the OpenGeo Suite package repository and then install the appropriate packages. See the :ref:`Packages <intro.installation.ubuntu.packages>` section for details about the possible packages to install.

.. warning:: Mixing repositories is not recommended. If you already have a repository that contains some of the components of OpenGeo Suite (such as PostgreSQL) please remove them before installing OpenGeo Suite.

The commands in this section require root privileges. 

#. Change to the ``root`` user:

   .. code-block:: bash

      sudo su - 

#. Import the OpenGeo GPG key:

   .. code-block:: bash

      wget -qO- http://apt.boundlessgeo.com/gpg.key | apt-key add - 

#. Add the OpenGeo Suite repository.

   If installing on Precise:

   .. code-block:: bash

      echo "deb http://apt.boundlessgeo.com/suite/v45/ubuntu/ precise main" > /etc/apt/sources.list.d/opengeo.list

   If installing on Trusty:

   .. code-block:: bash

      echo "deb http://apt.boundlessgeo.com/suite/v45/ubuntu/ trusty main" > /etc/apt/sources.list.d/opengeo.list

Installation process
--------------------

#. Update:

   .. code-block:: bash

      apt-get update

#. Search for OpenGeo Suite packages:

   .. code-block:: bash

      apt-cache search opengeo

   If the search command does not return any results, the repository was not added properly. Examine the output of the ``apt`` commands for any errors or warnings.

#. You have options on what packages to install:

   .. note::  See the :ref:`Packages <intro.installation.ubuntu.packages>` section for details of individual packages.

   For server components:

   .. code-block:: bash

      apt-get install opengeo-server

   For client components:

   .. code-block:: bash

      apt-get install opengeo-client

   For both client and server components:

      apt-get install opengeo

After installation
------------------

Installation is now complete. Please see the section on :ref:`intro.installation.ubuntu.misc`.

