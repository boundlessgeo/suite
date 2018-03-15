# Boundless Server VM Image Creation:

1. Download/Setup Packer: https://www.packer.io/downloads.html  

2. Clone Suite Build repo `git@github.com:boundlessgeo/suite-build.git`

3. Navigate to `packer/` dir  

4. Ensure version has been updated!  
  * `boundless-server.json`: Lines 21, 54  
  * `scripts/vm_deploy.sh`: Lines 123, 138  

5. Start build:

```bash
packer build boundless-server.json
```

6. Compress build image. (replace version as needed)

```bash
cd output-virtualbox-iso
zip BoundlessServer_VirtualBox_1.0.1.ova.zip BoundlessServer_VirtualBox_1.0.1.ova
```

