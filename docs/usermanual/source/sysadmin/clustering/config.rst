.. _sysadmin.clustering.config:

Clustering configuration parameters
===================================

This section will detail the parameters available in the various configuration files necessary for configuring the clustering extension.

There are three primary configuration files used in the clustering extension::

  <data_dir>/jdbcconfig/jdbcconfig.properties
  <data_dir>/cluster/cluster.properties
  <data_dir>/cluster/hazelcast.xml

jdbcconfig.properties
---------------------

This configuration file, in Java properties format, affects settings related to the database that will hold the GeoServer data directory.

.. list-table::
   :header-rows: 1

   * - Parameter
     - Description
   * - ``enabled``
     - Determines whether the database catalog is enabled. If set to ``false``, all other settings will be ignored, and the file-based data directory will be used instead.
   * - ``initdb``
     - If ``true``, will initialize a new database using the script at the location set by ``initScript``
   * - ``initScript``
     - The location of the script run when ``initdb`` is set to ``true``. There exist template scripts for the following databases: PostgreSQL, H2, Oracle, MySQL, SQL Server.
   * - ``import``
     - If set to ``true``, will import the data directory into a new database. After the script is completed, the setting will automatically be changed back to ``false`` to prevent subsequent loads.
   * - ``jndiName``
     - JNDI name of database. Can't be used with ``jdbcUrl`` or the other JDBC direct connection parameters.
   * - ``jdbcUrl``
     - JDBC direct connection parameter for location of the catalog. Can't be used with ``jndiName``.
   * - ``driverClassName``
     - JDBC direct connection parameter for the classname of the database driver. Can't be used with ``jndiName``.
   * - ``username``
     - JDBC direct connection parameter for database user name. Can't be used with ``jndiName``.
   * - ``password``
     - JDBC direct connection parameter for database password. Can't be used with ``jndiName``.
   * - ``pool.minIdle``
     - Minimum number of connections in connection pool.
   * - ``pool.maxActive``
     - Maximum number of connections in connection pool.
   * - ``pool.poolPreparedStatements``
     - If ``true`` will pool prepared statements.
   * - ``pool.maxOpenPreparedStatements``
     - Size of prepared statement cache. Only relevant if ``pool.poolPreparedStatements`` is set to ``true``.
   * - ``pool.testOnBorrow``
     - If ``true`` will validate connections from the connection pool.
   * - ``pool.validationQuery=SELECT now()``
     - Validation query for connections from pool. Only relevant if ``pool.testOnBorrow`` is set to ``true``.

clustering.properties
---------------------

This configuration file, in Java properties format, affects settings related to the clustering of GeoServer instances.

.. list-table::
   :header-rows: 1

   * - Parameter
     - Description
   * - ``enabled``
     - If ``true`` will enable clustering.
   * - ``sync_method``
     - Determines the method of synchronizing changes to the catalogs. Options are: ``reload``, which will collapse all synchronization events and reload the entire catalog and configuration; ``event``, which will notify system of each individual catalog or configuration object updated via event callbacks. BE CLEARER?
   * - ``sync_delay``
     - Time in seconds to delay before performing synchronization. This setting can be changed without a restart.
   * - ``session_sharing``
     - If ``true`` will enable session sharing. WHAT IS SESSION SHARING?
   * - ``session_sticky``
     - Load Balancer provides sticky sessions. UNCLEAR?
  
hazelcast.xml
-------------

This configuration file, in XML, configures Hazelcast, the mechanism for broadcasting GeoServer catalog changes to other nodes in the cluster.

Here is a template configuration file:

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <hazelcast xsi:schemaLocation="http://www.hazelcast.com/schema/config hazelcast-config-2.3.xsd"
               xmlns="http://www.hazelcast.com/schema/config"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <group>
        <name>CLUSTER_NAME</name>
        <password>CLUSTER_PASSWORD</password>
      </group>
      
      <instanceName>INSTANCE_NAME</instanceName>

      <network>
        <port auto-increment="true">PORT</port>
        <join>
          <multicast enabled="true">
            <multicast-group>MULTICAST_IP</multicast-group>
            <multicast-port>MULTICAST_PORT</multicast-port>
          </multicast>
        </join>
      </network>

    </hazelcast>

where:

.. list-table::
   :header-rows: 1

   * - Parameter
     - Description
   * - ``CLUSTER_NAME``
     - Name of the cluster group. All nodes must share this name in order to be considered part of the group.
   * - ``CLUSTER_PASSWORD``
     - Password for the cluster group. WHERE IS THIS DETERMINED?
   * - ``INSTANCE_NAME``
     - DON'T KNOW. SOMETHING ABOUT web.xml?
   * - ``PORT``
     - Port on which the catalog changes will be broadcast.
   * - ``MULTICAST_IP``
     - IP address for the multicast server. UNCLEAR?
   * - ``MULTICAST_PORT``
     - Port on which the multicast server information is broadcast. UNCLEAR?
