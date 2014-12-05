.. _dataadmin.pgGettingStarted.restload:


Publishing a PostGIS table in GeoServer
---------------------------------------

The next section describes how to link a PostGIS database to GeoSever and publish some data.


#. To begin with, a new GeoServer store for the PostGIS database must be created. To avoid typing one lengthy command, it is easier to save the connection parameters to an XML file. Create an XML file with the following content, substituting the correct connection parameters for your particular configuration.

   .. code-block:: xml

      <dataStore>
        <name>pgstore</name>
        <type>PostGIS</type>
        <enabled>true</enabled>
        <workspace>
          <name>opengeo</name>
          <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://localhost:8080/geoserver/rest/workspaces/opengeo.xml" type="application/xml"/>
        </workspace>
        <connectionParameters>
          <entry key="port">5432</entry>
          <entry key="user">postgres</entry>
          <entry key="passwd">postgres</entry>
          <entry key="dbtype">postgis</entry>
          <entry key="host">localhost</entry>
          <entry key="database">OpenGeo</entry>
          <entry key="schema">public</entry>
        </connectionParameters>
        <__default>false</__default>
      </dataStore>

#. Save this file as :file:`pgrest.xml`.  The name of the file is not important and does not need to match the store name.

#. Load this content into GeoServer using the following command:

   .. code-block:: console

      curl -v -u admin:geoserver -X POST -H "Content-type: text/xml" -T pgrest.xml http://localhost:8080/geoserver/rest/workspaces/opengeo/datastores.xml

   If the command was successful, you should see the following in the output:

   .. code-block:: console

      < HTTP/1.1 201 Created

   .. Warning:: If you see a ``500 Internal Server Error`` or ``405 Method Not Allowed``, or any other error, the command failed to execute correctly. Verify the syntax and content of the XML file. Examine the output and logs for any error messages.

#. The store created in the above example was called ``pgstore``. The name of the store is defined in the ``<name>`` tag. To confirm the store was created successfully, execute the following command:

   .. code-block:: console

      curl -v -u admin:geoserver -X GET http://localhost:8080/geoserver/rest/workspaces/opengeo/datastores/pgstore.xml

   .. note:: The password to this database, unencrypted in our example, is displayed encrypted.

Now that the connection has been made, you can publish a table from the PostGIS database as a layer in GeoServer.

#. To publish a dataset, execute the following command:

   .. code-block:: console

      curl -v -u admin:geoserver -X POST -H "Content-type: text/xml" -d "<featureType><name>lakes</name></featureType>" http://localhost:8080/geoserver/rest/workspaces/opengeo/datastores/pgstore/featuretypes

   
   This example creates a new layer ``lakes`` based on the table of the same name. The layer is contained in the previously created ``pgstore`` GeoServer store, as part of the ``opengeo`` workspace. The command uses a POST request to create a new *featuretype* resource.

#. If the command was successful, you should see in the output:

   .. code-block:: console

      < HTTP/1.1 201 Created

   If you don't see this entry, examine the output for errors.

#. To verify that the layer was published, execute the following command:

   .. code-block:: console

      curl -v -u admin:geoserver -X GET http://localhost:8080/geoserver/rest/workspaces/opengeo/datastores/pgstore/featuretypes.xml

   You should see the layer listed in the output. You can also view the layer in the GeoServer Layer Preview.
