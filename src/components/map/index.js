import './map.less'
import 'leaflet/dist/images/marker-shadow.png'

import {MAP} from 'middleware/constants.js';
import {uniqBy, filter, reject, first, values, isEmpty} from 'lodash';

class Map {
    layers = [];

    constructor() {
        this.mapInitialize();
        this.map.on('contextmenu', this.eventMapContextMenu.bind(this));
        this.map.on('pm:create', this.eventCreatePMLayer.bind(this));

        // natureMonuments.forEach((item) => {
        //     let marker = L.marker([item['lat'], item['lon']], {
        //         contextmenu: true,
        //         contextmenuItems: [{
        //             text: 'Показать полную информацию',
        //             callback: this.showFullInformation.bind(this)
        //         }]
        //     });
        //
        //     marker.addTo(this.map).bindPopup(item['naim']);
        //     marker.code = item['code'];
        // });
    }

    eventCreatePMLayer(event) {
        let layer = event.layer;
        layer.options.shape = event.shape;
        this.addLayer(layer, {noAddToMap: true});
    }

    eventMapContextMenu(event) {
        this.map.spin(true);

        let promises = MAP.ZOOM.map((zoom) => {
            let apiUrl = Map.nominatimApi('reverse', {
                lat: event['latlng']['lat'],
                long: event['latlng']['lng'],
                zoom: zoom
            });

            return fetch(apiUrl);
        });

        Promise.all(promises)
            .then(results => {
                let jsonResults = results.map(result => result.json());
                return Promise.all(jsonResults);
            })
            .then((jsons) => {
                this.map.contextmenu.removeAllItems();

                uniqBy(jsons, 'place_id').forEach(json => {
                    let item = this.map.contextmenu.addItem({text: json['display_name']});

                    $(item).data('osm_info', json);

                    $(item).on('mouseenter', event => {
                        let geojson = $(event.target).data('osm_info')['geojson'],
                            layer = first(L.geoJson(geojson).getLayers());

                        this.addLayer(layer, {temp: true});
                    });

                    $(item).on('click', event => {
                        let geojson = $(event.target).data('osm_info')['geojson'],
                            layer = first(L.geoJson(geojson, {
                                contextmenu: true,
                                bubblingMouseEvents: false,
                                contextmenuInheritItems: false,
                                osm: $(event.target).data('osm_info'),
                                contextmenuItems: [{text: 'Найти санатории'}, {text: 'Найти достопримечательности'}]
                            }).getLayers());

                        this.addLayer(layer);
                    });

                    $(item).on('mouseleave', () => this.removeTempLayers());
                });

                this.map.contextmenu.showAt(event.latlng);
                this.map.spin(false);
            })
    }

    eventLayerSelect(event) {
        let layer = event.target;

        Map.toggleActiveLayer(layer);

        if (Map.isActiveLayer(layer)) {
            layer.addContextMenuItem({
                text: 'Найти включение',
                index: 100,
                callback: this.shapeInclusion.bind(this)
            });
            layer.addContextMenuItem({
                text: 'Найти пересечения',
                index: 200,
                callback: this.shapeIntersection.bind(this)
            });
            layer.addContextMenuItem({
                text: 'Найти граничные элементы',
                index: 300,
                callback: this.boundaryElements.bind(this)
            });
            layer.addContextMenuItem({
                text: 'Найти примыкающие элементы',
                index: 400,
                callback: this.contiguity.bind(this)
            });
        } else {
            layer.removeContextMenuItemWithIndex(100);
            layer.removeContextMenuItemWithIndex(200);
            layer.removeContextMenuItemWithIndex(300);
            layer.removeContextMenuItemWithIndex(400);
        }
    }

    shapeInclusion() {
        let activeLayers = _.filter(_.toArray(this.map._renderer._layers), 'options.active');

        let results = [];

        for (let i = 0; i < activeLayers.length; i++) {
            for (let j = 0; j < activeLayers.length; j++) {
                if (i === j) continue;

                let layer1 = activeLayers[i].toGeoJSON(),
                    layer2 = activeLayers[j].toGeoJSON(),
                    solution1 = null,
                    solution2 = null;

                try {
                    solution1 = turf.booleanContains(layer1, layer2) ? 'включает' : 'не включает';
                } catch (e) {
                    solution1 = 'не включает';
                }

                try {
                    solution2 = turf.booleanContains(layer2, layer1) ? 'включает' : 'не включает';
                } catch (e) {
                    solution2 = 'не включает';
                }

                results.push(`${activeLayers[i].options.name} ${solution1} элемент ${activeLayers[j].options.name}`);
                results.push(`${activeLayers[j].options.name} ${solution2} элемент ${activeLayers[i].options.name}`);
            }
        }

        alert(_.uniq(results).join('\n'));
    }

    shapeIntersection() {
        let activeLayers = _.filter(_.toArray(this.map._renderer._layers), 'options.active');

        let results = [];

        for (let i = 0; i < activeLayers.length; i++) {
            for (let j = 0; j < activeLayers.length; j++) {
                if (i === j) continue;

                let layer1 = activeLayers[i].toGeoJSON(),
                    layer2 = activeLayers[j].toGeoJSON(),
                    solution = null;

                try {
                    let intersections = turf.lineIntersect(layer1, layer2).features;

                    solution = intersections.length > 0 ? 'пересекается' : 'не пересекается';
                } catch (e) {
                    solution = 'не пересекается';
                }

                results.push(`${activeLayers[i].options.name} ${solution} с элементом ${activeLayers[j].options.name}`);
            }
        }

        alert(_.uniq(results).join('\n'));
    }

    boundaryElements() {
        let activeLayers = this.getActiveLayers();

        let results = [];

        for (let i = 0; i < activeLayers.length; i++) {
            for (let j = 0; j < activeLayers.length; j++) {
                if (i === j) continue;

                let layer1 = activeLayers[i].toGeoJSON(),
                    layer2 = activeLayers[j].toGeoJSON(),
                    layer1Name = activeLayers[i].options.name,
                    layer2Name = activeLayers[j].options.name;

                let intersection = turf.intersect(layer1, layer2);

                if (intersection && (intersection.geometry.type === 'LineString' || intersection.geometry.type === 'MultiLineString')) {
                    results.push(`${layer1Name} граничит с элементом ${layer2Name}`);
                } else {
                    results.push(`${layer1Name} не граничит с элементом ${layer2Name}`);
                }
            }
        }

        alert(_.uniq(results).join('\n'));
    }

    contiguity() {
        let activeLayers = _.filter(_.toArray(this.map._renderer._layers), 'options.active');

        let results = [];

        for (let i = 0; i < activeLayers.length; i++) {
            for (let j = 0; j < activeLayers.length; j++) {
                if (i === j) continue;

                let layer1 = activeLayers[i].toGeoJSON(),
                    layer2 = activeLayers[j].toGeoJSON(),
                    layer1Name = activeLayers[i].options.name,
                    layer2Name = activeLayers[j].options.name,
                    intersection = turf.lineIntersect(layer1, layer2);

                try {
                    let layer1firstPoint = _.first(layer1.geometry.coordinates).map((a) => (_.round(a, 3))),
                        layer1lastPoint = _.last(layer1.geometry.coordinates).map((a) => (_.round(a, 3))),
                        layer2firstPoint = _.first(layer2.geometry.coordinates).map((a) => (_.round(a, 3))),
                        layer2lastPoint = _.last(layer2.geometry.coordinates).map((a) => (_.round(a, 3))),
                        intersectionType = intersection.features[0].geometry.type,
                        intersectionPoint = intersection.features[0].geometry.coordinates.map((a) => (_.round(a, 3)));

                    if (intersectionType === 'Point' && (_.isEqual(intersectionPoint, layer1firstPoint) || _.isEqual(intersectionPoint, layer1lastPoint))) {
                        results.push(`${layer1Name} примыкает к элементу ${layer2Name}`);
                    } else if (intersectionType === 'Point' && (_.isEqual(intersectionPoint, layer2firstPoint) || _.isEqual(intersectionPoint, layer2lastPoint))) {
                        results.push(`${layer2Name} примыкает к элементу ${layer1Name}`);
                    } else {
                        results.push(`${layer1Name} не примыкает к элементу ${layer2Name}`);
                    }
                } catch (e) {
                    results.push(`${layer1Name} не примыкает к элементу ${layer2Name}`);
                }
            }
        }

        alert(_.uniq(results).join('\n'));
    }

    showFullInformation(event) {
        let object = _.find(window.result, ['code', event.relatedTarget.code]),
            naim = object['naim'],
            img1 = object['img1'],
            img2 = object['img2'],
            img3 = object['img3'],
            oblast = object['oblast'];

        this.sidebar.setContent('<table>' +
            '  <tr><td>' + 'Наименование' + '</td><td>' + naim + '</td></tr>' +
            '  <tr><td>' + 'Область' + '</td><td>' + oblast + '</td></tr>' +
            '  <tr><td>' + 'Изображение1' + '</td><td><img src="' + img1 + '" /></td></tr>' +
            '  <tr><td>' + 'Изображение2' + '</td><td><img src="' + img2 + '" /></td></tr>' +
            '  <tr><td>' + 'Изображение3' + '</td><td><img src="' + img3 + '" /></td></tr>' +
            '</table>');
        this.sidebar.show();
    }

    static toTurfObject(layer) {
        switch (layer.options.shape) {
            case 'Circle':
                let center = [layer._latlng['lat'], layer._latlng['lng']],
                    radius = layer._mRadius / 1000;

                return turf.circle(center, radius);
            case 'Line':
                let points = layer._latlngs.map((point) => ([point['lat'], point['lng']]));

                return turf.lineString(points);
            default:
                return turf.polygonize(layer.toGeoJSON());
        }
    }

    mapInitialize() {
        this.map = L.map('map', {
            contextmenu: true,
            contextmenuWidth: 300
        });

        this.map.off('contextmenu');
        this.map.setView([53.53, 27.34], 13);
        this.map.doubleClickZoom.disable();
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        // Sidebar
        this.sidebar = L.control.sidebar('sidebar', {position: 'right'});
        this.map.addControl(this.sidebar);

        //define toolbar options
        let options = {
            position: 'topleft',
            drawMarker: true,
            drawPolyline: true,
            drawRectangle: true,
            drawPolygon: true,
            drawCircle: true,
            editMode: true,
            removalMode: true,

        };

        // add leaflet.pm controls to the map
        this.map.pm.addControls(options);

        let controlOptions = {
            // snapping
            snappable: true,
            snapDistance: 20,
            allowSelfIntersection: false,
            templineStyle: {
                color: 'red',
            },
            hintlineStyle: {
                color: 'red',
                dashArray: [5, 5],
            },

            finishOn: 'contextmenu',
            markerStyle: {
                opacity: 0.5,
                draggable: true,
            }
        };

        this.map.pm.enableDraw('Poly', controlOptions);
        this.map.pm.enableDraw('Rectangle', controlOptions);
        this.map.pm.enableDraw('Line', controlOptions);
        this.map.pm.enableDraw('Marker', controlOptions);
        this.map.pm.enableDraw('Circle', controlOptions);
        this.map.pm.enableDraw('Cut', controlOptions);
        this.map.pm.disableDraw('Poly');
        this.map.pm.disableDraw('Rectangle');
        this.map.pm.disableDraw('Line');
        this.map.pm.disableDraw('Marker');
        this.map.pm.disableDraw('Circle');
        this.map.pm.disableDraw('Cut');
    }

    addLayer(layer, options = {}) {
        layer.options.active = !!options.active;
        layer.options.temp = !!options.temp;
        if (!layer.options.temp) layer.options.name = this.resolveLayerName(layer);
        if (!layer.options.temp) layer.on('click', this.eventLayerSelect.bind(this));
        if (!options.noAddToMap) layer.addTo(this.map);

        this.layers.push(layer);
    }

    resolveLayerName(layer) {
        if (layer.options.osm) return layer.options.osm.name;

        let shape = layer.options.shape;

        if (shape) {
            let sameShapesCount = filter(this.getLayers(), ['options.shape', shape]).length;
            let shapeNumber = (sameShapesCount === 0) ? '' : sameShapesCount + 1;

            return `${shape}${shapeNumber}`;
        }

        return 'Элемент';
    }

    static nominatimApi(api, params) {
        let host = 'https://nominatim.openstreetmap.org/';

        switch (api) {
            case 'reverse':
                return `${host}/reverse?format=jsonv2&lat=${params['lat']}&lon=${params['long']}&polygon_geojson=1&zoom=${params['zoom']}`;
        }
    }

    getActiveLayers() {
        return filter(this.layers, 'options.active');
    }

    getLayers() {
        return this.layers;
    }

    static toggleActiveLayer(layer) {
        layer.options.active = !layer.options.active;
        layer.setStyle({color: !!layer.options.active ? 'red' : '#3388ff'});
    }

    static isActiveLayer(layer) {
        return !!layer.options.active;
    }

    removeTempLayers() {
        let tempLayers = filter(this.layers, 'options.temp');
        tempLayers.forEach(layer => this.map.removeLayer(layer));

        this.layers = reject(this.layers, ['layerType', 'temp']);
    }
}

export default Map;
