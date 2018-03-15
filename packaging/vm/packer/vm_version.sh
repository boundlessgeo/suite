#!/bin/bash

# Verify proper command use
if [ "$1" == "" ]; then
  echo "No arguements provided."
  echo "Proper use is: vm_version.sh dev/master"
  exit 1
fi

# Do versioning
if [ "$1" == "dev" ]; then
  sed -i "s/REPLACE_VERSION/`date +%Y%m%d%H%M`/" $WORKSPACE/suite/packaging/vm/packer/suite.json
elif [ "$1" == "master" ]; then
  sed -i "s/REPLACE_VERSION/`cat $WORKSPACE/suite/packaging/version.txt`/" $WORKSPACE/suite/packaging/vm/packer/suite.json
else
  echo "Improper arguement provided."
  echo "Proper use is: vm_version.sh dev/test/master"
  exit 1
fi
