#!/bin/bash

# $1 - Input text
# $2 - Color (optional: default white)
function text {
  local color_reset="\e[0m"
  local color=''

  case $1 in
    "red")       color="\e[1;31m";;
    "blue")      color="\e[0;34m";;
    "green")     color="\e[0;32m";;
  esac

  if [ -n ${color} ]; then
    echo -e "${color}$2${color_reset}"
  else
    echo -e $2
  fi
}

# Path to file or directory relative geo.sh file
# Examples:
#  path ../ => sc-web.module.geo
#  path -f ../package.json => /home/katerina/sc-web.module.geo/package.json
function path {
  if [[ $1 == "-f" ]]; then
    echo "$(readlink -f $(dirname $(readlink -f $0))/$2)"
  elif [[ -d $1 ]]; then
    echo "$(basename $(readlink -f $(dirname $(readlink -f $0))/$1))"
  else
    echo ""
  fi
}

function place {
  if [[ -d ${geo_dest_folder} ]]; then
    echo -e "The sc-web project $(text red "already has a geo module installed"), remove it before installing a new one.\nUse '$(text blue "geo replace")' to overwrite the existing Geo module."
    exit 0
  fi

  # Add component to scweb project
  mkdir ${geo_dest_folder}
  cp -r ${geo_source_folder}/src/* ${geo_dest_folder}

  # Include component
  sed -i "/${geo_project_name}/d" ${scweb_components_file}
  echo "<script charset=\"utf-8\" src=\"/static/components/${geo_project_name}/index.js\"></script>" >> ${scweb_components_file}

  # Print result message
  if [[ -d ${geo_dest_folder} ]]; then
    echo "Component $(text green "has been added") in [${geo_dest_folder}]"
  else
    echo "Component $(text red "hasn't been added") in [${geo_dest_folder}]"
  fi

  if [[ -n $(grep ${geo_project_name} ${scweb_components_file}) ]]; then
    echo "Component $(text green "has been included") in [${scweb_components_file}]"
  else
    echo "Component $(text red "hasn't been included") in [${scweb_components_file}]"
  fi
}

function clean {
  # Remove component folder
  rm -rf ${geo_dest_folder}

  # Uninclude component
  sed -i "/${geo_project_name}/d" ${scweb_components_file}

  # Print result message
  if [[ ! -d ${geo_dest_folder} ]]; then
    echo "Component $(text green "has been removed") from [${geo_dest_folder}]"
  else
    echo "Component $(text red "hasn't been removed") from [${geo_dest_folder}]"
  fi

  if [[ ! -n $(grep ${geo_project_name} ${scweb_components_file}) ]]; then
    echo "Component $(text green "has been unincluded") from [${scweb_components_file}]"
  else
    echo "Component $(text red "hasn't been unincluded") from [${scweb_components_file}]"
  fi
}

# Script start here
# =================

if [[ ! -n $1 ]]; then
  echo "Usage: geo <mode> [path_to_scweb_folder]

Modes:
  place   - place the Geo component in the specified sc-web project.
  replace - replace the Geo component in the specified sc-web project.
  clean   - remove the Geo component from the specified sc-web project.

Examples (if you running geo in sc-web project):
  geo place   - Place the geo component in the current sc-web project.
  geo replace - Replace the existing geo component in the current sc-web project.
  geo clean   - Remove the geo component in the current sc-web project.

Examples (if you running geo in sc-web.module.geo project):
  geo place ../sc-web2/   - Place the geo component in the specified sc-web project,
                                  in example '../sc-web2' folder.
  geo replace ../sc-web2/ - Replace the existing geo component in the specified sc-web project.,
                                  in example '../sc-web2' folder.
  geo clean ../sc-web2/   - Remove the geo component in the specified sc-web project,
                                  in example '../sc-web2' folder."

  exit 0
fi

geo_project_name="sc-web.module.geo"

# Define scweb folder
if [[ -n $2 ]]; then
  full_path=$(readlink -f $2)
  current_path=$(pwd)

  if [[ $(basename ${full_path}) != "sc-web" ]]; then
    echo $(text red "[${full_path}] is not a sc-web project.")
    exit 0
  fi

  if [[ $(basename ${current_path}) != "sc-web.module.geo" ]]; then
    echo "You are $(text red "not in a sc-web.module.geo project")."
    exit 0
  fi

  scweb_folder=${full_path}
  geo_source_folder=${current_path}
else
  current_path=$(pwd)

  if [[ $(basename ${current_path}) != "sc-web" ]]; then
    echo "You are $(text red "not in a sc-web project")."
    exit 0
  fi

  if [[ ! -d "${current_path}/node_modules/${geo_project_name}" ]]; then
    echo "Component $(text red "sc-web.module.geo not installed") in current project."
    exit 0
  fi

  scweb_folder="${current_path}"
  geo_source_folder=$(readlink -f "${current_path}/node_modules/${geo_project_name}/")
fi

mode=$1
geo_dest_folder="${scweb_folder}/client/static/components/${geo_project_name}/"
scweb_components_file="${scweb_folder}/client/templates/components.html"

case ${mode} in
  "place")
    place
  ;;
  "replace")
    clean
    place
  ;;
  "clean")
    clean
  ;;
  *)
    echo $(text red "Unknown mode [$1].")
esac
