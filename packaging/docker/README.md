# Suite Docker Instructions  

----

## Prerequisite  
### Login to DockerHub.  
Suite image is Boundless-internal presently.  
DockerHub account must be member of Boundlessgeo organization.  
For assistance, contact Chris Del Pino  
```bash  
docker login
```

----

## Deploy and configure containers  
### Provision Suite docker container  
Note- Command as written will forward 8080 locally to container. Adjust as needed.  
Format is `-p <localPort>:<remotePort>`  
Note- Modify shared directory path as needed.  
Format is `-v <localDir>:<containerDir>`  
```bash
docker run --name suite -v /location/of/local/data/dir:/opt/suite-datadir -p 8080:8080 -d boundlessgeo/suite:nightly
```

### Provision PostgreSQL container.  
Note- Command as written will forward 5432 locally to container. Adjust as needed.  
Format is `-p <localPort>:<remotePort>`  
Note- Postgres will be available via localPost (as set above) on host (local) IP. User postgres, password suitepostgres.  
```bash
docker run --name suite-pgsql -p 5432:5432 -e POSTGRES_PASSWORD=suitepostgres -d boundlessgeo/suite-pgsql:master
```

### (Optional) Change location of data dir  
Modify line 6 to change location of data dir  
```bash
docker exec -it suite vim /etc/tomcat8/Catalina/localhost/geoserver.xml  
docker exec -it suite service tomcat8 restart
```

----

## Helpful commands  
### List all containers  
```bash
docker ps -a
```

### Launch shell on container  
```bash
docker exec -it <container_name_or_id> bash
```

### Delete container  
```bash
docker rm <container_name_or_id>
```

### Remove all  
```bash
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker images -q |xargs docker rmi
```

Additional Suite documentation available at: http://suite.boundlessgeo.com/docs/latest/

----

# Suite containers build process

Note- largely forked from: 
https://github.com/boundlessgeo/docker/tree/master/suite-desktop-testing/suite-410/ubuntu/ubuntu14.04

## Step-by-step guide

Build testing containers for Suite 4.10 using Ubuntu.


### Clone repo

    $> git clone git@github.com:boundlessgeo/suite-build.git

### Executing in Jenkins

This build was designed to be performed within Jenkins, with the image 
published to the Boundless internal Dockerhub repo.

The image is not intended to be shared, but for interal development.

#### Examples of building Suite image

Select OS to build (subsequent steps follow an Ubuntu 14.04 Trusty workflow)

    $> cd $WORKSPACE/suite-build/jenkins2/docker

    $> VERSION=`cat $WORKSPACE/suite-build/jenkins2/version.txt`

    $> docker rmi -f $(docker images -a -q)

    $> sed -i 's/REPLACE_VERSION/$VERSION/g' Dockerfile

    $> docker build -t suite:$VERSION .

### Make a shared directory on your host OS's filesystem

This will be made available in the docker container. You can use this shared
directory to pass test input data, for example. This needs to be writable by the
docker process user.

    $> mkdir ~/suite-test-data

### Run image as container

    $> docker run -it -v ~/suite-test-data --name suite-$VERSION -p 8443:8443 -p 8080:8080 -p 5432:5432 suite:$VERSION

See: https://docs.docker.com/engine/userguide/dockervolumes/#mount-a-host-directory-as-a-data-volume

Inspect logs with:

    $> docker exec -it suite-$VERSION less +F /var/log/tomcat.log

Use `Ctrl-C` to exit output following, and `:n` to go to next log screen, where
you can use `Shift-F` to follow again. When done, use `Ctrl-C` to exit any
following and `q` to quit `less`, exiting the container.

### Get container's IP address

On Linux, the IP address is:

    $> docker inspect --format '{{ .NetworkSettings.IPAddress }}' suite-$VERSION

If using `docker-machine` on OSX and Win (or some Linux setups), docker runs in
a thin VirtualBox or VMware virtual machine and is managed by the
`docker-machine` utility, with the default machine name called 'default'.

It's IP address can be obtained with the following command:

    $> docker-machine ip $(docker-machine active)

or, if the docker machine's environment has already been sourced:

    $> docker-machine ip $DOCKER_MACHINE_NAME

### Update hosts File

NOTE: if using a VM via recent versions of the `docker-machine` utility, your VM
may essentially have a _static_ local IP address.

Add the following to your `hosts` file:

    <docker-machine-ip> boundless.test

### Access Suite Dashboard

Connect to Dashboard web app with the following URL:

    <docker IP address>:8080/dashboard


### Manage container

Maintain state:

    $> docker stop suite-$VERSION

    $> docker start suite-$VERSION

Rollback state:

    $> docker rm suite-$VERSION

    (Redo step 'Run image as container')

### Public Key Infrastructure (PKI) setup

By default, SSL/TLS connections to GeoServer require a user with
a client certificate. The test client certificates and keys are available in
this repo:

    https://github.com/boundlessgeo/boundless-test-certs

The certificates installed in the server are the wildcard certificates for
`*.boundless.test`.

Review the included `README.md` with the certificates for more information.
