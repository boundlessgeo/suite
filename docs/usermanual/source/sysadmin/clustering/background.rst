.. _sysadmin.clustering.background:

Background
==========

This page will discuss the theory and technology underlying the clustering extension for GeoServer in OpenGeo Suite.

What is clustering?
-------------------

Clustering is the process of utilizing multiple systems in a fault-tolerant and load-balanced manner to increase responsiveness and uptime. While GeoServer is a very robust software solution, other aspects of the setup (such as network availability, file corruption) may cause the server to become unresponsive or unavailable. Having multiple GeoServers deployed can greatly reduce or eliminate downtime.

Clustering challenges
---------------------

To create a cluster with a common configuration, several instances of GeoServer can use a common data directory. However, setting up a cluster based on the standard deployment of GeoServer can be challenging for a number of reasons.

#. **The GeoServer data directory is file-based.** Having multiple GeoServers all interacting with a file-based system can lead to corruption and permissions issues. Also, changes written from one server might not be picked up by other instances due to in-memory caching.

#. **Setting up the cluster is a manual process.** There is nothing built-in to GeoServer to make it aware of other clustered instances.

Clustering solutions
--------------------

The clustering extension is designed to mitigate both of the above issues. It greatly simplifies the setup and operation of a cluster of GeoServer instances used to distribute load.

Database for data directory
~~~~~~~~~~~~~~~~~~~~~~~~~~~

The clustering extension solves the first issue by storing the configuration into a relational database. This database can then be accessed by multiple GeoServers without issues.

It should be noted that after the conversion to a database, some files will necessarily remain. The files that will remain include:

* Security subsystem details (including user/group/role information)  
* Style definitions (SLD files)
* Freemarker templates (FTL files)
* GeoWebCache configuration (including grid sets and tiles)
* Other extension configuration (including Mapmeter and CSW)
* Logs and logging-related files (including logging properties)
* Clustering configuration (files discussed in this section)

To generalize, XML files will in most cases be ingested into the database, while non-XML files will remain.

For this reason, **a shared file-based data directory will still be needed**. However, as these remaining files are unlikely or less likely to be edited, this should not adversely affect performance or stability.

Broadcasting updates
~~~~~~~~~~~~~~~~~~~~

The clustering extension solves the second issue above by detecting changes, broadcasting these changes to the rest of the cluster, and then acting to clear the relevant caches.

This broadcasting also allows for HTTP session sharing, which is how multiple GeoServers will recognize that the same users are authenticated (such as the admin user being logged into the web interface on all instances).

Technical details
-----------------

The clustering extension is technically not one extension, but two: **JDBCConfig**, which provides the support for data directories in a database, and **Cluster**, which handles the broadcasting. JDBCConfig is a community GeoServer extension. Cluster is exclusive to OpenGeo Suite.

Cluster uses `Hazelcast <http://hazelcast.com>`_, a library that allows nodes in a cluster to link together automatically.