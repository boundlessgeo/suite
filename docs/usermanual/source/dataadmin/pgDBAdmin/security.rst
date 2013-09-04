.. _dataadmin.pgDBAdmin.security:


PostgreSQL security
===================

PostgreSQL has a flexible permissions system, with the ability to assign specific privileges to specific roles_, and assign users to one or more of those roles_. In addition, as the PostgreSQL server supports a number of methods for authenticating users, the database can use the same authentication infrastructure as other system components. This helps reduces the maintenance overhead by simplifying password management.


Users and roles
---------------

Instead of creating users and individually granting the necessary access rights to each user, a simpler solution is to define a number of database roles with the requisite permissions and then assign users to those roles. When new users are created, they can be assigned to existing roles. When users are deleted from the database, the roles will remain.


Creating roles
~~~~~~~~~~~~~~

Conceptually, a role is a user and a user is a role. The only difference is that a *user* is a role with the *login* privilege. Functionally, the two SQL statements below are the same—they both create a *role with the login privilege* or in other words, a *user*.

.. code-block:: sql

  CREATE ROLE user1 LOGIN;

  CREATE USER user1;


Read-only users
~~~~~~~~~~~~~~~

For users who only need to query but not update or delete data, read-only access to the database can be granted. For example, if a web publishing application requires access to the ``nyc_streets`` table, read-only access to that specific table can be granted. The applications could also inherit the necessary system access for PostGIS operations from a ``postgis_reader`` role. 

The following example will create a new user ``app1`` with SELECT privileges on the ``nyc_streets`` table and assign the user to the ``postgis_reader`` role.  

.. code-block:: sql

  CREATE USER app1;

  GRANT SELECT ON nyc_streets TO app1;
  
  CREATE ROLE postgis_reader INHERIT;

  GRANT postgis_reader TO app1;

When the user ``app1`` logs in to the database, they can now select rows from the ``nyc_streets`` table. 

.. code-block:: sql

  SELECT * FROM nyc_streets LIMIT 1; 

However, the ``app1`` user cannot run an :command:`ST_Transform` command. 

.. code-block:: sql

  SELECT ST_AsText(ST_Transform(geom, 4326)) 
    FROM nyc_streets LIMIT 1; 

:: 

  ERROR:  permission denied for relation spatial_ref_sys
  CONTEXT:  SQL statement "SELECT proj4text FROM spatial_ref_sys WHERE srid = 4326 LIMIT 1"

Although the ``app1`` user can view the contents of the ``nyc_streets`` table, they do not have permission to view the contents of ``spatial_ref_sys``, so executing the :command:`ST_Transform` command fails. 

To resolve this, grant SELECT privilege on all the PostGIS :ref:`dataadmin.pgBasics.metatables` objects to the ``postgis_reader`` role as follows:

.. code-block:: sql

  GRANT SELECT ON geometry_columns TO postgis_reader;
  GRANT SELECT ON geography_columns TO postgis_reader;
  GRANT SELECT ON spatial_ref_sys TO postgis_reader;

The ``postgis_reader`` role can be assigned to any user who needs read access to the PostGIS metadata tables.


Read-write users
~~~~~~~~~~~~~~~~

There are two kinds of read/write scenarios to consider:

 * Web-based and other applications that need to modify existing data or create new data.
 * Developers or analysts who need to create new tables and geometry columns.

For web applications that require write access to data tables, simply grant the extra permissions (INSERT, UPDATE, and DELETE) to the specific tables themselves, and continue to use the ``postgis_reader`` role.

.. code-block:: sql

  GRANT INSERT,UPDATE,DELETE ON nyc_streets TO app1;

.. note:: These database access privileges would be required for a read/write WFS service.

For developers and analysts, a ``postgis_writer`` role with read/write access to the PostGIS metadata objects, is required. This new role should inherit the access rights already assigned to the ``postgis_reader`` role and have additional INSERT, UPDATE, and DELETE privileges granted on the metadata objects. 

.. code-block:: sql

  CREATE ROLE postgis_writer;

  GRANT postgis_reader TO postgis_writer;

  GRANT INSERT,UPDATE,DELETE ON spatial_ref_sys TO postgis_writer;
 
  GRANT postgis_writer TO app1;

.. todo:: check this section - metatables have changed at 3.0

Encryption
----------

PostgreSQL provides a number of `encryption facilities <http://www.postgresql.org/docs/current/static/encryption-options.html>`_. Some of these facilities are enabled by default, while others are optional.

All passwords are MD5 encrypted by default. The client/server handshake double encrypts the MD5 password to prevent re-use of the hash by anyone who intercepts the password. `SSL connections <http://www.postgresql.org/docs/current/static/libpq-ssl.html>`_ (Secure Sockets Layer) are optionally available between the client and server, to encrypt all data and login information. SSL certificate authentication is also available when SSL connections are used.

Database columns can be encrypted using the pgcrypto_ module, which includes hashing algorithms, direct ciphers (blowfish, aes) and both public key and symmetric PGP encryption.

SSL connections
~~~~~~~~~~~~~~~

To use SSL connections, both your client and server must support SSL. The OpenGeo Suite provides PostgreSQL with SSL support, but SSL is not enabled by default.  To enable SLL support:

 1. Shutdown the OpenGeo Suite server. On the OpenGeo Dashboard click :guilabel:`Shutdown`.
 2. Acquire or generate an SSL certificate and key. The certificate must not include a passphrase otherwise the database server won't be able to start up. To generate a self-signed key, enter the following:

  .. code-block:: console 
     
     # Create a new certificate, completing the certification info as prompted
     openssl req -new -text -out server.req
     
     # Strip the passphrase from the certificate
     openssl rsa -in privkey.pem -out server.key
     
     # Convert the certificate into a self-signed cert
     openssl req -x509 -in server.req -text -key server.key -out server.crt

     # Set the permission of the key to private read/write
     chmod og-rwx server.key
     
 3. Copy the ``server.crt`` and ``server.key`` into the OpenGeo Suite PostgreSQL installation folder's data directory (``pgdata``).

 4. Enable SSL support in the ``postgresql.conf`` file and set the ssl :guilabel:`Value` to *on*.

    .. figure:: ./screenshots/ssl_conf.png

      Enabling SSL support

 5.  Restart OpenGeo Suite service to activate support for SSL. On the OpenGeo Dashboard, click :guilabel:`Start`.

 6.  To add an encrypted server connection, on the pgAdmin main menu click :guilabel:`File` and click :guilabel:`Add Server` to open the :guilabel:`New Server Registration` dialog box. 

 7. Enter the server properties and click the :guilabel:`SSL` tab. 

 8. Set the :guilabel:`SSL` parameter to :guilabel:`require` and click :guilabel:`OK` to create the connection.

  .. figure:: ./screenshots/ssl_create.png

     Setting the SSL parameter in pgAdmin

Once you connect to the database using the new connection, check the connection properties to confirm SSL encryption is used.

.. figure:: ./screenshots/ssl_props.png
   
   SSL-encrypted connection

Since the default SSL connection mode is *prefer*, you don't have to specify an SSL preference when connecting. A connection made using the command line ``psql`` tool will read the SSL option and use it by default:

:: 

  psql (8.4.9)
  SSL connection (cipher: DHE-RSA-AES256-SHA, bits: 256)
  Type "help" for help.

  postgres=# 


Data encryption
~~~~~~~~~~~~~~~

.. ToDo:: couldn't find this file - consider removing topic - too brief to be of much use

There are many encryption options available with the pgcrypto_ module. One of the simplest examples is encrypting a column of data using a symmetric cipher. To set this up, complete the following steps:


 1. Enable pgcrypto by loading the :file:`pgcrypto.sql` file, either using pgAdmin or psql.

   :: 
     
      pgsql/9.1/share/postgresql/contrib/pgcrypto.sql


 2. Test the encryption function.

   .. code-block:: sql
      
      -- encrypt a string using blowfish (bf)
      SELECT encrypt('this is a test phrase', 'mykey', 'bf');

 3. Ensure the encryption is reversible.

   .. code-block:: sql
      
      -- round-trip a string using blowfish (bf)
      SELECT decrypt(encrypt('this is a test phrase', 'mykey', 'bf'), 'mykey', 'bf');


Authentication
--------------

PostgreSQL supports a number of `authentication methods <http://www.postgresql.org/docs/current/static/auth-methods.html>`_, to allow easy integration into existing enterprise architectures. In production systems, the following methods are commonly used:

 * **Password**—Passwords are stored by the database with MD5 encryption
 * Kerberos_—Enterprise authentication method used by both the GSSAPI_ and SSPI_ schemes in PostgreSQL. With SSPI_, PostgreSQL can authenticate against Windows servers.
 * LDAP_—Common enterprise authentication method. The `OpenLDAP <http://www.openldap.org/>`_ server bundled with most Linux distributions provides an open source implementation of LDAP_.
 * **Certificate**—Works with client connections made via SSL (assumes clients can manage the distribution of keys)
 * PAM_—Supports Linux or Solaris PAM_ scheme for transparent authentication provision

Authentication methods are controlled by the :file:`pg_hba.conf` file. The *hba* in the file name stands for host based access, as in addition to allowing you to specify the authentication method to use for each database, it allows you to limit host access using network addresses. 

To edit the settings in the :file:`pg_hba.conf` file, on the pgAdmin main menu click :guilabel:`File` and click :guilabel:`Open pg_hba.conf` to open the file in the :guilabel:`Backend Access Configuration Editor`.

.. figure:: ./screenshots/pg_hba.png

  Accessing the pg_hba.conf file

The  :file:`pg_hba.conf` file includes the following:

 * **Type**—Determines the type of access, either *local* for connections from the same server or *host* for remote connections
 * **Database**—Which database the access rule refers to or "all" for all databases
 * **User**—Which users the access rule refers to or "all" for all users
 * **IP-Address**—Network limitations for remote connections using network/netmask syntax
 * **Method**—Authentication protocol to use. *Trust* skips authentication entirely and simply accepts any valid user name without challenge.
 * **Option**—Specifies options for the selected authentication method

Generally local connections are trusted, since access to the server itself is usually privileged. Remote connections are disabled by default when PostgreSQL is installed. If you want to connect from remote machines, you must add the appropriate entry to the file.

To add a new entry, double-click the last empty row in the list of entries to open the :guilabel:`Client Access Configuration` dialog box.

.. figure:: ./screenshots/pg_hba_new.png

  *Adding a new remote access entry*

This new entry is an example of a remote access connection, allowing LDAP authenticated access only to machines on the local network (in this case the 192.168.1. network) and only to the *nyc* database. 

Implementing the various authentication rules in a production system will largely depend on the security requirements of your network.


Links
-----

 * `PostgreSQL Authentication <http://www.postgresql.org/docs/current/static/auth-methods.html>`_
 * `PostgreSQL Encrpyption <http://www.postgresql.org/docs/current/static/encryption-options.html>`_
 * `PostgreSQL SSL Support <http://www.postgresql.org/docs/current/static/libpq-ssl.html>`_

.. _GSSAPI: <http://en.wikipedia.org/wiki/Generic_Security_Services_Application_Program_Interface>
.. _SSPI: http://msdn.microsoft.com/en-us/library/windows/desktop/aa380493(v=vs.85).aspx
.. _RADIUS: http://en.wikipedia.org/wiki/RADIUS
.. _LDAP: http://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol
.. _Kerberos: http://en.wikipedia.org/wiki/Kerberos_(protocol)
.. _PAM: http://en.wikipedia.org/wiki/Pluggable_authentication_module
.. _pgcrypto: http://www.postgresql.org/docs/current/static/pgcrypto.html
.. _roles: http://www.postgresql.org/docs/current/static/user-manag.html
