# Suite GeoServer 

This module produces the GeoServer war used by Suite. It is made up of 
three submodules:

1. [webapp](webapp) - Web application containing custom theme, map preview, and other non-community GeoServer modules.
1. [data_dir](data_dir) - Vanilla GeoServer configuration and data shipped with suite.
1. [ext](ext) - GeoServer community extensions.
1. [externals](externals) - External upstream dependencies such as community GeoSeserver, GeoTools, etc.

Dependencies on upstream projects are defined with submodule references. The submodules define the exact revision of an upstream dependency. Because these revisions often correspond to a snapshot version it is necessary to configure Maven in such a way that prevents snapshots from being brought in via the public community repositories, which may be newer than the revision to be bundled with the suite. 

This is done by building with the maven `-nsu` option that tells maven not to look for online updates of a snapshot dependency. This option is specified in the global `build.properties` file and generally shouldn't be changed. 

For developers that often build versions of the upstream community projects it is recommended that a separate maven repository be utilizes for suite. This can be 
done by specifying a custom settings file in the global `local.properties` file. This is done with the property `mvn.settings`:

    mvn.settings=/path/to/settings.xml

The file is placed in the root [build](/build) directory. The contents of the `settings.xml` file should look something like:

    <settings>
       <localRepository>[path to separate maven repository]</localRepository>
    </settings>
