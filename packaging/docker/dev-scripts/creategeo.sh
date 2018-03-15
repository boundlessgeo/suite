#!/bin/bash

docker run -v $HOME/Projects/Boundless/geoserver/data:/opt/geoserver/data_dir -v $HOME/Projects/Boundless/geoserver/extensions:/var/local/geoserver-exts/ --name "local-geoserver" -p 8080:8080 boundlessgeo/suite:nightly

echo "Geoserver is Created and should now be running on 8080"
