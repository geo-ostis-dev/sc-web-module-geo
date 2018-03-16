#!/bin/bash

function puts {
    if [[ $2 == "red" ]]; then echo -e "\033[0;31m$1\033[0m"; fi;
    if [[ $2 == "green" ]]; then echo -e "\033[0;32m$1\033[0m"; fi;
    if [[ $2 == "blue" ]]; then echo -e "\033[0;34m$1\033[0m"; fi;
    if [[ $2 == "yellow" ]]; then echo -e "\033[1;33m$1\033[0m"; fi;
    if [[ $2 == "" ]]; then echo -e $1; fi
}

if [[ ! -n $1 ]]; then
  puts "Usage: place <path_to_sc-web_folder>" blue
  exit 0
fi

scweb_folder=$(readlink -f $1)

puts $scweb_folder/client/static/components/sc-web.module.geo
puts $scweb_folder/client/templates/components.html

rm -rf $scweb_folder/client/static/components/sc-web.module.geo 2>/dev/null
sed -i '/sc-web\.module\.geo/d' $scweb_folder/client/templates/components.html
puts "module has been removed from $(readlink -f ${scweb_folder}/client/static/components)" "green"
puts "module has been unincluded from $(readlink -f ${scweb_folder}/client/templates/components.html)" "green"

