.. _sysadmin.clustering.setup:

Setting up the clustering extension
===================================

Upon installation of the clustering extension, no actions will take place, so GeoServer will still be using the original file-based data directory. In order to make use of the clustering extension, some configuration files will need to be edited and GeoServer restarted.


.. note:: Configuration of the clustering extension, as it involves changes to the data directory, must be done through configuration files. It cannot be done through the UI.

.. note:: It is also not possible to use the REST API to configure the clustering extension.


The following process will detail how to set up an initial cluster. The specific network details will change depending on your system.

Database setup
--------------

To set up the shared database that will contain the data directory:

#. Create a database and a role able to create tables in that database. PostgreSQL, Oracle, MySQL, SQL Server, and H2 are supported.

#. Install GeoServer if it is not already installed, but make sure it is not running. The data directory associated with this instance will be the one that is ingested into the database.

#. Open the file :file:`<data_dir>/jdbcconfig/jdbcconfig.properties` in a text editor, where ``<data_dir>`` is the location of the current file-based data directory.

#. Replace the the lines::

     initdb=false
     import=false

   with the lines::

     initdb=true
     import=true
     
#. Set the connection information for the database created earlier.

   .. todo:: what lines are this?

#. Save and close this file.

Broadcasting setup
------------------

#. Open the file :file:`<data_dir>/cluster/cluster.properties` in a text editor.

#. Replace the lines::

     sync_mode=SOMETHING
     sync_delay=SOMETHING

   with the lines::

     sync_mode=event
     sync_delay=0

   .. todo:: WHY DO WE NEED TO DO THIS?

#. Save and close this file.

#. Open the file :file:`<data_dir>/cluster/hazelcast.xml` in a text editor.

#. Edit SOMETHING.

   .. todo:: WHAT?

#. Save and close this file.

Verification
------------

#. Start GeoServer and log in as an administrator to the web interface.

#. Verify that clustering extension is working. HOW?

   .. todo:: Screenshot needed.

             Confirm that the JDBC message lists the correct JDBC URL.
             Confirm that the layers, stores, and other catalog objects have been imported correctly.

Other nodes
-----------

To configure the other GeoServer nodes, perform the following steps on each of them:

#. Install GeoServer with the clustering extension. Make sure that it is responding on the same subnet as the initial GeoServer.

   .. note:: CORRECT TERMINOLOGY?

#. Copy the files edited in the previous sections to the new GeoServer, overwriting the existing ones::

     <data_dir>/jdbcconfig/jdbcconfig.properties
     <data_dir>/cluster/cluster.properties
     <data_dir>/cluster/hazelcast.xml

#. Start GeoServer. Verify that the extension is working properly and that the node is reading the shared data directory.

Final verification
------------------

To verify that the cluster is set up correctly:

#. Make a change to the catalog on one GeoServer (for example, by adding a layer or editing a layer property)

#. Now move to another GeoServer and verify that the change has propagated.

#. Repeat this process for all GeoServers to make sure that a change on one node is propagated to all other nodes.

