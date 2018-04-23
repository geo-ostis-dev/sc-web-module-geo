#!/bin/bash

project_name='sc-web.module.geo'
scweb_folder=$(readlink -f $1)
dest_folder=$(readlink -f "${scweb_folder}/client/static/components/${project_name}/")
scweb_components_file=$(readlink -f "${scweb_folder}/client/templates/components.html")

if [[ ! -d ${scweb_folder} ]]; then
  echo "Not found directory ${scweb_folder}."
  exit 0
fi

rm -rf ${dest_folder}
sed -i "/${project_name}/d" ${scweb_components_file}
