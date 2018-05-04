#!/bin/bash

if [[ ! -d $1 ]]; then
  echo "You must specify path to sc-web directory!"
  exit 0
fi

project_name='sc-web.module.geo'
scweb_folder=$(readlink -f $1)
dest_folder=$(readlink -f "${scweb_folder}/client/static/components/${project_name}/")
scweb_components_file=$(readlink -f "${scweb_folder}/client/templates/components.html")

if [[ ! -d ${scweb_folder} ]]; then
  echo "Not found sc-web directory ${scweb_folder}!"
  exit 0
fi

rm -rf ${dest_folder}
sed -i "/${project_name}/d" ${scweb_components_file}
