#!/usr/bin/env bash

function puts {
    if [ $2 == "red" ]; then echo -e "\033[0;31m$1\033[0m"; fi;
    if [ $2 == "green" ]; then echo -e "\033[0;32m$1\033[0m"; fi;
    if [ $2 == "blue" ]; then echo -e "\033[0;34m$1\033[0m"; fi;
    if [ $2 == "yellow" ]; then echo -e "\033[1;33m$1\033[0m"; fi;
}

mode=$1
cd $(npm root)
cd ..

case $mode in
  "place")  cp -r node_modules/sc-web.module.geo client/static/components
            echo "<script charset=\"utf-8\" src=\"/static/components/sc-web.module.geo/index.js\"></script>" >> client/templates/components.html
            puts "module placed in $(readlink -f client/static/components/sc-web.module.geo)" "green"
            puts "module included in $(readlink -f client/templates/components.html)" "green"
            ;;
  "clean")  status="buh"
            rm -r client/static/components/sc-web.module.geo 2>/dev/null
            sed -i '/sc-web\.module\.geo/d' ./client/templates/components.html
            puts "module has been removed from $(readlink -f client/static/components)" "green"
            puts "module has been unincluded from $(readlink -f client/templates/components.html)" "green"
            ;;
        *)  puts "incorrect mode" "red"
            ;;
esac

