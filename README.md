# Geo

Geo is a module for the sc-web system. It provides a cartographic interface, and also allows to work with geographic objects.

[!['npm'](https://img.shields.io/badge/dynamic/json.svg?label=npm&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fgeo-ostis-dev%2Fsc-web.module.geo%2Fmaster%2Fpackage.json&query=%24.version&colorB=%23f770b4)](https://www.npmjs.com/package/sc-web.module.geo)
[!['sc-web'](https://img.shields.io/badge/dynamic/json.svg?label=sc-web&uri=https%3A%2F%2Fraw.githubusercontent.com%2FIvan-Zhukau%2Fsc-web%2Fmaster%2Fpackage.json&query=%24.version)](https://github.com/Ivan-Zhukau/sc-web)
[![GitHub issues](https://img.shields.io/github/issues/geo-ostis-dev/sc-web.module.geo.svg)](https://github.com/geo-ostis-dev/sc-web.module.geo/issues)
[![GitHub forks](https://img.shields.io/github/forks/geo-ostis-dev/sc-web.module.geo.svg)](https://github.com/geo-ostis-dev/sc-web.module.geo/network)
[![GitHub license](https://img.shields.io/github/license/geo-ostis-dev/sc-web.module.geo.svg)](https://github.com/geo-ostis-dev/sc-web.module.geo)

## How to use Geo in SC-web project
To **connect** the module to your **sc-web project**, it's enough to use the command:
```bash
cd sc-web
npm install sc-web.module.geo
```
To **disconnect** a module from the project, use the command:
```
npm uninstall sc-web.module.geo
```

## How to use Geo for development
First, **clone** this repository, and **install**.
```bash
git clone https://github.com/geo-ostis-dev/sc-web.module.geo
cd sc-web.module.geo
npm install
```
After, run **place** script and specify the path to the sc-web project:
```bash
npm run place ../geo.ostis/sc-web
```
So you **connect** Geo to a third-party sc-web project.

To **watch** the Geo module, type:
```bash
npm run watch ../../geo.ostis/sc-web
```

To **remove** the Geo module from the specified sc-web project, type:
```bash
npm run remove ../../geo.ostis/sc-web
```

## Contributing
To contribute to the project, need to do a fork project and make a pull request.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details
