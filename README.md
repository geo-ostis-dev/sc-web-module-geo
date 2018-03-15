# Geo

Geo is a module for the sc-web system. It provides a cartographic interface, and also allows to work with geographic objects.

[!['npm'](https://img.shields.io/badge/dynamic/json.svg?label=npm&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fgeo-ostis-dev%2Fsc-web.module.geo%2Fmaster%2Fpackage.json&query=%24.version&colorB=%23f770b4)](https://www.npmjs.com/package/sc-web.module.geo)
[!['sc-web'](https://img.shields.io/badge/dynamic/json.svg?label=sc-web&uri=https%3A%2F%2Fraw.githubusercontent.com%2FIvan-Zhukau%2Fsc-web%2Fmaster%2Fpackage.json&query=%24.version)](https://github.com/Ivan-Zhukau/sc-web)
[![GitHub issues](https://img.shields.io/github/issues/geo-ostis-dev/sc-web.module.geo.svg)](https://github.com/geo-ostis-dev/sc-web.module.geo/issues)
[![GitHub forks](https://img.shields.io/github/forks/geo-ostis-dev/sc-web.module.geo.svg)](https://github.com/geo-ostis-dev/sc-web.module.geo/network)
[![GitHub license](https://img.shields.io/github/license/geo-ostis-dev/sc-web.module.geo.svg)](https://github.com/geo-ostis-dev/sc-web.module.geo)


## Installing
To install the module, go to sc-web project folder:
```
cd sc-web
```
Install module Geo:
```
npm install sc-web.module.geo
```

## Using Geo in your SC-web project
To use the module in your sc-web project, use the command:
```
geo place
```
To remove the Geo module from the sc-web project, use the command:
```
geo clean
```
### Example
```
➜  geo.ostis git:(master) ✗ cd sc-web 
➜  sc-web git:(master) ✗ geo place
module placed in /home/local/PROFITERO/mikhliuk.k/geo.ostis/sc-web/client/static/components/sc-web.module.geo
module included in /home/local/PROFITERO/mikhliuk.k/geo.ostis/sc-web/client/templates/components.html
➜  sc-web git:(master) ✗ geo clean  
module has been removed from /home/local/PROFITERO/mikhliuk.k/geo.ostis/sc-web/client/static/components
module has been unincluded from /home/local/PROFITERO/mikhliuk.k/geo.ostis/sc-web/client/templates/components.html
```

## Contributing
To contribute to the project, need to do a fork project and make a pull request.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details
