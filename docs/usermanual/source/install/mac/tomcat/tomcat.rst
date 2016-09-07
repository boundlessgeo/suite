.. _install.mac.tomcat.tomcat:

Tomcat installation
===================

.. note:: During installation we will be editing files that require Administrator access to modify. We recommend using :guilabel:`TextWrangler` (from `Apple App Store <https://itunes.apple.com/ca/app/textwrangler/id404010395?mt=12/>`__ ).

The Tomcat Application server is used to host the Boundless Suite web applications. Tomcat itself is a Java application, and some care will be required to configure it appropriately for use.

#. Download the :guilabel:`'Core' - tar.gz` from the Apache website:

   * `Tomcat Windows Service Installer <http://tomcat.apache.org/download-80.cgi>`__

   .. figure:: img/tomcat_download_mac.png
      :scale: 75%

      Tomcat 8 download

   .. warning: Boundless Suite requires a recent version of Tomcat supporting Servlet 3.

#. Unpack the Tomcat tar.gz inside your :file:`~/Downloads` folder by double-clicking on it.

   .. figure:: img/tomcat_unpacked_mac.png

      Apache Tomcat unpacked

#. Open the :guilabel:`Terminal` application available in :menuselection:`Applications --> Utilities` folder.

    .. figure:: img/terminal_app_mac.png

        The Terminal application icon

#. Execute the following commands in the command line interface.

    .. code-block:: bash

        sudo mkdir -p /usr/local
        sudo mv ~/Downloads/apache-tomcat-8.5.4 /usr/local
        sudo rm -f /Library/Tomcat
        sudo ln -s /usr/local/apache-tomcat-8.5.4 /Library/Tomcat
        sudo chown -R [YOUR_USERNAME] /Library/Tomcat
        sudo chmod +x /Library/Tomcat/bin/*.sh

    .. note:: The previous commands may need to be modified slightly, depending on whether a different release of Tomcat was obtained.

#. To optimize performance switch into the :file:`/Library/Tomcat/bin` folder.  Create a new file :file:`setenv.sh`.

    .. code-block:: bash

        sudo nano setenv.sh

#. Add the following Catalina Options to the file in order to set the Initial Memory Pool (-Xms) and Maximum Memory Pool (-Xmx):

    .. code-block:: bash

        export CATALINA_OPTS="$CATALINA_OPTS -Xms256m"
        export CATALINA_OPTS="$CATALINA_OPTS -Xmx756m"

#. To use the Tomcat manager graphical user interface, it is necessary to set up login credentials.  Add the following line to the :file:`/Library/Tomcat/conf/tomcat-users.xml`.

    .. code-block:: bash

        <user username="admin" password="geoserver" roles="manager-gui" />

#. To start and stop the application server use the following commands:

    * **Starting Tomcat**:

        .. code-block:: bash

            /Library/Tomcat/bin/catalina.sh start

    * **Stopping Tomcat**:

        .. code-block:: bash

            /Library/Tomcat/bin/shutdown.sh

#. In order to ensure that Tomcat was installed correctly, start the application server and go to the `Tomcat Welcome Page <localhost:8080>`__ .

    .. figure:: img/tomcat_welcome.png

        Successful Tomcat install

#. If the Tomcat installation was successful, visit the `Tomcat Web Application Manager <http://localhost:8080/manager/html/>`__.  Login using the credentials you created earlier.

    .. figure:: img/tomcat_web_manager.png

        Tomcat Web Application Manager
