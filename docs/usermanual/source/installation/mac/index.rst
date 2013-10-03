.. _installation.osx:

Installing OpenGeo Suite for OS X
=================================

This document describes how to install OpenGeo Suite for Mac OS X.

Prerequisites
-------------

OpenGeo Suite has the following system requirements:

* **Operating System**: 10.7 or newer
* **Memory**: 1GB minimum (2GB recommended)
* **Disk space**: 600MB minimum (plus extra space for any loaded data)
* **Browser**: Any modern web browser is supported
* **Permissions**: Administrative rights

New Installation
----------------

Open ``OpenGeoSuite.dmg``. There are two applications (plus two more in the PostGIS Utilities folder), ``GeoServer`` and ``PostGIS``. These can be run from anywhere, but should probably be copied to ``/Applications``.

.. figure:: img/apps.png

   OpenGeo Suite apps

Double click ``PostGIS`` to start the PostgreSQL server. You will see a "Welcome" window the first time the application is launched.

.. figure:: img/pgwelcome.png

   PostGIS welcome page

You can check the server status, start psql, or open the docs from the PostGIS menu.

.. figure:: img/pgmenu.png

   PostGIS menu

Double click ``GeoServer``. You will see a similar "Welcome" window upon first startup. It will show a progress bar as the server is initialized.

.. figure:: img/gsstarting.png

   GeoServer startup

A web browser will open with the Dashboard when the server is ready.

.. figure:: img/dashboard.png

   OpenGeo Suite Dashboard

You can check the server status or open the docs from the GeoServer menu.

.. figure:: img/gsmenu.png

   GeoServer menu

CLI tools
~~~~~~~~~

The CLI tools installs some useful tools into ``/usr/local/opengeo``. To use these utilities, open ``~/.profile`` in a text editor and add ``PATH=$PATH:/usr/local/opengeo/bin``. Alternately, run ``/usr/local/opengeo/bin/opengeo-clitools-doctor`` which will symlink everything to /usr/local/bin, though this may cause problems with some self-installed tools.

.. figure:: img/clitools.png

   PostGIS welcome page

