.. _install.mac.tomcat.java:

Java installation
=================

Install Java on your system:

1. Boundless Suite on Windows requires a 32-bit Java Runtime Environment, available from the `Oracle Java download page <http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html>`__ .

   .. figure:: img/java_download_mac_JDK.png

      Java JDK for OS X Download

   .. note:: Boundless Suite requires Java 8, and is no longer compatible with Java 7.

2. Run the installer, agreeing to the license terms provided to install.

   .. figure:: img/java_install_mac.png

      Java Installation

   .. note:: During the installation process the installer may ask permission to uninstall prior versions of Java.

3. Wait while Java installs.

   .. figure:: img/java_wait_mac.png

      Java Installation

   During installation Java may detect any prior versions and offer to uninstall.

4. When complete java is available in a subdirectory inside :file:`/Library/Java/JavaVirtualMachines/jdk1.8.0_101.jdk/Contents/Home`. This location will be referred to as ``JRE_HOME`` in subsequent documentation.

   .. figure:: img/java_done_mac.png

      Java Installation
