.. _sysadmin.clustering.background:

Background
==========

This page will discuss the theory and technology underlying the clustering extension for GeoServer in OpenGeo Suite.

What is clustering?
-------------------

Clustering is the process of utilizing multiple systems in a fault-tolerant and load-balanced manner to increase responsiveness and uptime. While GeoServer is a very robust software solution, other aspects of the setup (such as network availability, file corruption) may cause the server to become unresponsive or unavailable. Having multiple GeoServers deployed can greatly reduce or eliminate downtime.

Clustering challenges
---------------------

To create a cluster with a common configuration, several instances of GeoServer can use a common data directory. However, 

Setting up a cluster based on the standard deployment of GeoServer can be challenging for a number of reasons.

#. **The GeoServer data directory is file-based.** Having multiple GeoServer all interacting with a file-based system can lead to corruption and permissions problems when writing changes. Also, changes written from one server might not be picked up by other instances due to in-memory caching.

#. **Setting up the cluster is a manual process.** There is nothing built-in to GeoServer to make it aware of other clustered instances.

Clustering solutions
--------------------

The clustering extension is designed to mitigate both of the above issues. It greatly simplifies the setup and operation of a cluster of GeoServer instances used to distribute load.

Database for data directory
~~~~~~~~~~~~~~~~~~~~~~~~~~~

The clustering extension solves the first issue by storing the configuration into a relational database. This database can then be accessed by multiple GeoServers without issues.

It should be noted that after the conversion to a database, some files will necessarily remain. This is because SOMETHING. 

The files that will remain include:

* User information (WHAT DOES THIS MEAN?)
* Style definitions (SLD)
* Freemarker templates (FTL)
* GeoWebCache configuration (WHAT KIND?)
* Extension configuration (SUCH AS?)
* Clustering configuration

For this reason, a shared file-based data directory will still be needed. But as these files are unlikely or less likely to be edited, this should not affect performance or stability.

Broadcasting changes
~~~~~~~~~~~~~~~~~~~~

The clustering extension solves the second issue above by detecting changes, broadcasting these changes to the rest of the cluster, and then acting to clear the relevant caches.

MORE DETAILS






Technical details
-----------------

The actual clustering extension includes the community JDBCConfig extension, which provides the support for data directories in a database. The clustering mechanism (using Hazelcast) is exclusive to OpenGeo Suite.

.. todo:: DETAILS ON THE DB STRUCTURE

.. todo:: WHAT ELSE?

.. warning:: Setting up a database for the data directory is a **one-way process**. It is not currently possible to export the configuration back to a file-based data directory.

