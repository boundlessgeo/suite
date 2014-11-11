.. _intro.installation.aws.govcloud:

AWS GovCloud
============

`AWS GovCloud <http://aws.amazon.com/govcloud-us/>`_ is a special region in AWS, in that it is designed for US government use. As Amazon puts it:

*"AWS GovCloud (US) is an isolated AWS Region designed to allow US government agencies and customers to move sensitive workloads into the cloud by addressing their specific regulatory and compliance requirements. The AWS GovCloud (US) framework adheres to U.S. International Traffic in Arms Regulations (ITAR) regulations as well as the Federal Risk and Authorization Management Program (FedRAMP) requirements."*

OpenGeo Suite is available in the GovCloud region.

.. note:: The process is more complicated than the standard :ref:`AWS Marketplace <intro.installation.aws.marketplace>`, so only use these instructions if your situation requires use of GovCloud. OpenGeo Suite is available in all the other regions when using AWS Marketplace.

Purchasing
----------

Please `contact us <http://boundlessgeo.com/about/contact-us/sales/>`_ for information on purchasing OpenGeo Suite for AWS GovCloud.

  .. todo:: Add pricing info here.

After purchasing OpenGeo Suite, you will receive an email containing the ID of the OpenGeo Suite AMI (Amazon Machine Image). You'll need that number later on.

Creating a GovCloud account
---------------------------

You need to have an Amazon Web Services (AWS) account in order to use OpenGeo Suite for AWS. Amazon has `detailed instructions on how to sign up for AWS/EC2 <http://aws.amazon.com/documentation/ec2/>`_.

But obtaining an AWS GovCloud account requires a few extra steps in addition to the standard AWS account. To gain access to GovCloud you will need to `contact <https://aws.amazon.com/govcloud-us/contact/>`_ AWS. Fill out the form, and you will be sent instructions on how to complete the application.

Gaining access to GovCloud
--------------------------

#. After being granted access to GovCloud, you will have received two codes, an **Access Key ID** and a **Secret Access Key**. These are strings of characters used to authenticate with GovCloud.

#. Download the `GovCloud Console Setup Tool <https://govcloudconsolesetup.s3-us-gov-west-1.amazonaws.com/setup.html>`_. This tool is available for Windows and OS X. Linux users can use the command line tools referenced on that page to accomplish the same tasks.

#. Run the GovCloud Console Setup Tool. Enter the Access Key ID and Secret Access Key that was given to you and click :guilabel:`Next`.

   .. figure:: img/govcloud-setuptool.png

      GovCloud Console Setup Tool

#. You will be given a user name. Create a password for this new account that will be used to access GovCloud.

#. Submit the form. When this is done, you will receive a custom URL. This is the URL that you will use to access GovCloud.

   .. note:: This will be of the approximate form:

             ::

                 https://##############.signin.amazonaws-us-gov.com

#. Navigate to this URL. You will need to log in with the user name and password that was generated in the GovCloud Console Setup Tool. (Not your standard AWS account credentials.)

#. Once logged in, the site will look much like the standard AWS Management Console, though with fewer options.

   .. figure:: img/govcloud-console.png

      GovCloud Console

Launching
---------

Once you have access to the GovCloud Management Console, you can access the OpenGeo Suite.

OpenGeo Suite in AWS GovCloud requires that you set up a VPC (Virtual Private Cloud) to launch your instances in. For information on setting up a VPC, please see the documentation on `Amazon EC2 and Amazon Virtual Private Cloud <http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-vpc.html>`_

#. In the GovCloud Console, click :guilabel:`Images`.

#. In the search field, enter the AMI ID as it was given to you. (Alternately, type ``opengeo`` to search for the correct AMI.)

   .. figure:: img/govcloud-amis.png

      OpenGeo Suite AMIs

#. You should see the correct AMI in the list. Click :guilabel:`Launch`.

#. Step through the wizard, entering all required information including the VPC created to house the GovCloud instance. When finished, click :guilabel:`Launch`.

   .. figure:: img/govcloud-launch.png

      Launching an instance

If you see no errors during this process, then you now have a running instance of OpenGeo Suite.

Continue to :ref:`installation details <intro.installation.aws.details>`.