.. _sysadmin.clustering.params:

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

.. tabularcolumns:: |p{6cm}|p{9cm}|
.. list-table::
   :widths: 20 80
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

JNDI
~~~~

Request a connection from the application server using JNDI.  The details will depend on the particular application server.  If specified and lookup succeeds, then the direct connection parameters will be ignored.

.. tabularcolumns:: |p{6cm}|p{9cm}|
.. list-table::
   :widths: 20 80
   :header-rows: 1

   * - Parameter
     - Description
   * - ``jndiName``
     - JNDI name of database. Can't be used with ``jdbcUrl`` or the other JDBC direct connection parameters.

Direct Connection Parameters
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Specify the parameters for making the connection directly in the configuration file.  This includes the password in clear text.  Be sure to make ``jdbcconfig.properties`` readable only by GeoServer if using this mechanism.  Using JNDI can avoid this problem, depending on how the application server stores its passwords.

.. tabularcolumns:: |p{6cm}|p{9cm}|
.. list-table::
   :widths: 20 80
   :header-rows: 1

   * - Parameter
     - Description
   * - ``jdbcUrl``
     - JDBC direct connection parameter for location of the catalog.
   * - ``driverClassName``
     - JDBC direct connection parameter for the classname of the database driver.
   * - ``username``
     - JDBC direct connection parameter for database user name.
   * - ``password``
     - JDBC direct connection parameter for database password.  Stored in clear text.
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
   * - ``pool.validationQuery``
     - Validation query for connections from pool. Only relevant if ``pool.testOnBorrow`` is set to ``true``.

clustering.properties
---------------------

This configuration file, in Java properties format, affects settings related to the clustering of GeoServer instances.

.. tabularcolumns:: |p{4cm}|p{11cm}|
.. list-table::
   :widths: 20 80
   :header-rows: 1

   * - Parameter
     - Description
   * - ``enabled``
     - If ``true`` will enable clustering.
   * - ``sync_method``
     - Determines the method of synchronizing changes to the catalogs. Options are: ``reload``, which will reload the entire catalog and configuration; ``event``, which will more granularly expire specific relevant portions of the catalog.
   * - ``sync_delay``
     - Time in seconds to delay before performing synchronization. Only used when ``sync_method`` is set to ``reload``, otherwise should be set to ``0``. This setting can be changed without a restart.
   * - ``session_sharing``
     - If ``true`` will enable session sharing.
   * - ``session_sticky``
     - Some load balancers provide support for "sticky sessions," the ability to direct a session automatically to the same node. If the load balancer supports this, and this parameter is set to ``true``, the clustering extension will be more efficient, as it will let the load balancer handle the session events.

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

.. tabularcolumns:: |p{4cm}|p{11cm}|
.. list-table::
   :widths: 20 80
   :header-rows: 1


   * - Parameter
     - Description
   * - ``CLUSTER_NAME``
     - Name of the cluster group. All nodes must share this name in order to be considered part of the group.
   * - ``CLUSTER_PASSWORD``
     - Password for the cluster group.
   * - ``INSTANCE_NAME``
     - Used to distinguish from multiple Hazelcast instances in the same JVM, if present. Typically, this setting will not need to be altered.
   * - ``PORT``
     - Port that Hazelcast uses.
   * - ``MULTICAST_IP``
     - Address for the multicast server. Typically this setting will not need to be changed.
   * - ``MULTICAST_PORT``
     - Port on which the multicast server operated. Typically this setting will not need to be changed.

If your setup does not support multcast, your configuration file will look like this:

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
          <multicast enabled="false">
            <multicast-group>MULTICAST_IP</multicast-group>
            <multicast-port>MULTICAST_PORT</multicast-port>
          </multicast>
          <tcp-ip enabled="true">
            <interface>IP1</interface>
            <interface>IP2</interface>
          </tcp-ip>

        </join>
      </network>

    </hazelcast>

where ``IP1`` and ``IP2`` are individual IP addresses of the nodes in the cluster.

For more information about configuring Hazelcast, please see the `Hazelcast documentation <http://www.hazelcast.com/docs/2.3/manual/multi_html/>`_. The default settings should suffice for most users.
