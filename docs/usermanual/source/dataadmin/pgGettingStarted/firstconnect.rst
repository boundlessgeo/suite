.. _dataadmin.pgGettingStarted.firstconnect:

Connecting to PostgreSQL on Linux for the first time
====================================================

.. note::
   This section uses the command line utility ``psql`` and optionally the graphical utility ``pgAdmin``. These tools may not be automatically present, depending on the type of installation of OpenGeo Suite. Please see the :ref:`intro.installation` section for information on how to install these tools for your platform.

On Windows and OS X, PostgreSQL is configured to be accessed immediately. No further configuration is required. The user name is ``postgres`` and password is ``postgres``.

However, on Linux, both on Ubuntu and Red Hat-based systems, additional work needs to be undertaken. This is because the default PostgreSQL configuration on both Ubuntu and Red Hat-based systems has connections turned off for the ``postgres`` user by default.

So after install of OpenGeo Suite, if you try to connect to PostgreSQL via the :command:`psql` command-line utility or through `pgAdmin <dataadmin.pgGettingStarted.pgadmin>`_, you will get the following connection error::

  psql: FATAL:  peer authentication failed for user "postgres"

There are two steps to allow connections to PostgreSQL:

* Set a password for the ``postgres`` user
* Allow local connections to PostgreSQL

For more information, please see the `Ubuntu documentation on PostgreSQL <https://help.ubuntu.com/community/PostgreSQL>`_.

Setting a password for the ``postgres`` user
--------------------------------------------

On Windows and OS X, the default password is ``postgres``. But on Linux systems, there is no default password set.

To set the default password:

#. Run the :command:`psql` command from the ``postgres`` user account:

   .. code-block:: console

      sudo -u postgres psql postgres

#. Set the password:

   .. code-block:: console

      \password postgres

#. Enter a password.

#. Close :command:`psql`.

   .. code-block:: console

      \q

Allowing local connections
--------------------------

The file :file:`pg_hba.conf` governs the basic constraints underlying connection to PostgreSQL. By default, these settings are very conservative. Specifically, local connections are not allowed for the ``postgres`` user.

To allow this:

#. As a super user, open :file:`/etc/postgresql/9.3/main/pg_hba.conf` (Ubuntu) or :file:`/var/lib/pgsql/9.3/data/pg_hba.conf` (Red Hat) in a text editor.

#. Scroll down to the line that describes local socket connections. It may look like this:

   .. code-block:: console

      local   all             all                                      peer

#. Change the ``peer`` method to ``md5``.

   .. note:: For more information on the various options, please see the `PostgreSQL documentation on pg_hba.conf <http://www.postgresql.org/docs/devel/static/auth-pg-hba-conf.html>`_. 

#. To allow connections using pgAdmin, find the line that describes local loopback connections over IPv6:

   .. code-block:: console

      host    all             all             ::1/128                 ident

#. Change the ``ident`` method to ``md5``.

#. Save and close the file.

#. Restart PostgreSQL:

   .. code-block:: console

      sudo service postgresql restart  

#. To test your connection using :command:`psql`, run the following command:

   .. code-block:: console

      psql -U postgres -W

   and enter your password when prompted. You should be able to access the :command:`psql` console.

#. To test your connection using **pgAdmin**, connect to the database at localhost:5432 using the user name ``postgres`` and the password supplied.

   .. figure:: img/firstconnect_pgadmin_ubuntu.png

      Testing the connection in pgAdmin

If you encounter errors, make sure that the ``postgres`` password is set correctly, and that the correct line was edited in :file:`pg_hba.conf`, as many look alike.
