#  A few scripts to get a Boundless Suite GeoServer up and running locally!
  - Gets a docker image from boundlessgeo/suite:nightly
  - Creates a local container and names it local-geoserver
  - Maps both the data and plugins directories
  - Scripts to start and stop "local-geoserver"

#### Creates and starts your server with /creategeo.sh
Downloads image, creates container named "local-geoserver" and start it on port :8080
```
sh ./creategeo.sh
```

#### Start your GeoServer with /startgeo.sh
Starts the "local-geoserver" container
```
sh ./startgeo.sh
```

#### Stop your GeoServer with /stopgeo.sh
Stops the "local-geoserver" container for both /creategeo.sh and /startgeo.sh
```
sh ./stopgeo.sh
```
