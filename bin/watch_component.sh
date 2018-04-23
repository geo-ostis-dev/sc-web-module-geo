#!/bin/bash

project_name='sc-web.module.geo'

if [[ -n $1 ]]; then
  scweb_folder=$(readlink -f $1)

  if [[ ! -d ${scweb_folder} ]]; then
    echo "Not found directory ${scweb_folder}."
    exit 0
  fi

  dest_folder=$(readlink -f "${scweb_folder}/client/static/components/${project_name}/")
  cp -r public/* ${dest_folder}
  npx webpack --output-path ${dest_folder} --watch true --mode development
else
  npx webpack --watch true --mode development
fi
