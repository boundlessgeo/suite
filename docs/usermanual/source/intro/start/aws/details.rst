.. _intro.installation.aws.details:

Installation details
====================

After having set up and launch OpenGeo Suite for AWS, this page will show how to connect to and interact with the instance.

SSH access
----------

SSH access requires that port 22 was opened as part of the Security Group created during the launching of your instance. The default security group, if used, will contain this setting.

A keypair must also have been generated and linked to the instance.

Linux / Mac OS X
~~~~~~~~~~~~~~~~

You may connect to this instance via SSH using the ``ssh`` command:

.. code-block:: console

   ssh -i yourkey.pem ubuntu@<Public_DNS>

For example:

.. code-block:: console

   ssh -i yourkey.pem ubuntu@ec2-23-20-179-35.compute-1.amazonaws.com

where :file:`yourkey.pem` is the name of the downloaded key file.

Windows
~~~~~~~

You may connect to this instance via SSH using `PuTTY <http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html>`_, but you will need to convert your key to a format that PuTTY understands. This is done with `PuTTYgen <http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html>`_:

#. Run PuTTYgen.

#. Click :guilabel:`Load` ("Load an existing private key").

#. Select the key file.

#. After loading, click :guilabel:`Save private key`. This is the key to use when connecting with PuTTY. it will have a ``.ppk`` file extension.

To connect with PuTTY, make sure to load the ``.ppk`` file under :menuselection:`Connection --> SSH --> Auth` in the box titled :guilabel:`Private key file for authentication`. Once done, enter the host name, and connect as user ``ubuntu``.

To connect with PuTTY using the command line:

.. code-block:: console

   putty -i yourkey.ppk -ssh ubuntu@<Public_DNS>

For example:

.. code-block:: console

   putty -i yourkey.ppk -ssh ubuntu@ec2-23-20-179-35.compute-1.amazonaws.com

where :file:`yourkey.ppk` is the name of the key file created by PuTTYgen.

PostGIS
-------

There is no web-based access to PostGIS, but there are two ways to connect to manage PostGIS:

* Using the command-line utility ``psql`` via SSH.
* Using a local copy of ``pgAdmin III`` via an SSH tunnel.

Starting/stopping services
--------------------------

.. todo:: Not verified as part of AWS Marketplace

OpenGeo Suite uses two system services:  **Apache Tomcat** (for GeoServer and all other webapps) and **PostgreSQL** (for PostGIS). While all services are running by default when the instance is initialized, here are the commands to stop and start these services should it become necessary:


For Tomcat:

.. code-block:: console

   service tomcat6 stop
   service tomcat6 start

For PostGIS:

.. code-block:: console

   service postgresql stop
   service postgresql start

For more information
--------------------

Full documentation is available at the following URL from your instance::

  http://<Public_DNS>:8080/opengeo-docs/

