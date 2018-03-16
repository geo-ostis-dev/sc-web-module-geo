#!/bin/bash

function puts {
    if [ $2 == "red" ]; then echo -e "\033[0;31m$1\033[0m"; fi;
    if [ $2 == "green" ]; then echo -e "\033[0;32m$1\033[0m"; fi;
    if [ $2 == "blue" ]; then echo -e "\033[0;34m$1\033[0m"; fi;
    if [ $2 == "yellow" ]; then echo -e "\033[1;33m$1\033[0m"; fi;
}

if [[ ! -n $1 ]]; then
  puts "Usage: place <path_to_sc-web_folder>" blue
  exit 0
fi

scweb_folder=$1

mkdir -p $scweb_folder/client/static/components/sc-web.module.geo
cp -r ./kb $scweb_folder/client/static/components/sc-web.module.geo/
cp -r ./src $scweb_folder/client/static/components/sc-web.module.geo/
echo "<script charset=\"utf-8\" src=\"/static/components/sc-web.module.geo/index.js\"></script>" >> $scweb_folder/client/templates/components.html

puts "module placed in $(readlink -f ${scweb_folder}/client/static/components/sc-web.module.geo)" "green"
puts "module included in $(readlink -f ${scweb_folder}/client/templates/components.html)" "green"

