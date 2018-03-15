#!/bin/bash
export PATH="/bin/:/usr/sbin:/usr/bin:/sbin:${PATH}"
apt="apt-get -qq -y"
yum="yum -q -y"

set -x

fail()
{
    echo "FATAL: $*"
    exit 1
}

chroot_cmd() {
    chroot /mnt/gentoo $@
}

if [ -x /usr/bin/lsb_release ] ; then
    OS="$(lsb_release -s -i | tr '[A-Z]' '[a-z]')"
    if [ "$OS" = "centos" ] ; then
        OSRELEASE="$(lsb_release -s -r | sed -e 's/\..*//')"
        run_cmd=""
        rootfs=""
        cf_class="vagrant_centos_cfengine"
    else
        OSRELEASE="$(lsb_release -s -c)"
    fi
elif [ -f /etc/redhat-release ] ; then
    OSRELEASE="$(awk '{print $3}' /etc/redhat-release | sed -e 's/\..*//')"
    OS="$(awk '{print tolower($1)}' /etc/redhat-release)"
    run_cmd=""
    rootfs=""
    cf_class="vagrant_centos_cfengine"
elif [ -f /etc/gentoo-release ] ; then
    run_cmd="chroot_cmd"
    rootfs="/mnt/gentoo"
    OS="gentoo"
fi
