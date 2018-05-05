import './map.less'
import {MAP} from 'middleware/constants.js';
import {uniqBy} from 'lodash';

class Map {
    layers = [];
    tempLayers = [];

    constructor() {
        this.mapInitialize();
        this.map.on('contextmenu', this.eventMapContextMenu.bind(this));
        this.map.on('contextmenu.hide', () => this.map.contextmenu.disable());
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
                // this.map.contextmenu.enable();
                this.map.contextmenu.removeAllItems();

                uniqBy(jsons, 'place_id').forEach(json => {
                    let item = this.map.contextmenu.addItem({text: json['display_name'], index: json['osm_id']});
                    let $item = $(item);

                    $item.data('geojson', json['geojson']);

                    $item.on('mouseenter', event => {
                        let geojson = $(event.target).data('geojson'),
                            layer = L.geoJson(geojson);

                        this.addTempLayer(layer);
                    });

                    $item.on('click', event => {
                        let geojson = $(event.target).data('geojson'),
                            layer = L.geoJson(geojson);

                        this.addLayer(layer);
                        layer.bindContextMenu({contextmenu: true, contextmenuItems: MAP.BASE_LAYER_ITEMS});
                        layer.on('click', this.eventLayerClick.bind(this));
                    });

                    $item.on('mouseleave', () => this.removeAllTempLayers());
                });

                this.map.contextmenu.showAt(event.latlng);
                this.map.spin(false);
            })
    }

    eventLayerClick(layer) {
        let targetOptions = layer.target.options,
            target = layer.target;

        targetOptions.active = !targetOptions.active;

        if (targetOptions.active) {
            target.setStyle({color: 'red', fillColor: 'blue'});
            target.addContextMenuItem({
                text: 'Найти включение',
                index: 100,
                callback: this.shapeInclusion.bind(this)
            });
            target.addContextMenuItem({
                text: 'Найти пересечения',
                index: 200,
                callback: this.shapeIntersection.bind(this)
            });
            target.addContextMenuItem({
                text: 'Найти граничные элементы',
                index: 300,
                callback: this.boundaryElements.bind(this)
            });
            target.addContextMenuItem({
                text: 'Найти примыкающие элементы',
                index: 400,
                callback: this.contiguity.bind(this)
            });
        } else {
            target.setStyle({color: 'blue'});
            target.removeContextMenuItemWithIndex(100);
            target.removeContextMenuItemWithIndex(200);
            target.removeContextMenuItemWithIndex(300);
            target.removeContextMenuItemWithIndex(400);
        }
    }

    resolveShapeNames(shapeName) {
        switch (shapeName.toLowerCase()) {
            case 'rectangle':
                return 'Прямоугольник';
            case 'circle':
                return 'Круг';
            case 'line':
                return 'Линия';
            case 'poly':
                return 'Полигон';
            default:
                return shapeName;
        }
    }

    shapeInclusion() {
        let activeLayers = _.filter(_.toArray(this.map._renderer._layers), 'options.active');

        let results = [];

        for (let i = 0; i < activeLayers.length; i++) {
            for (let j = 0; j < activeLayers.length; j++) {
                if (i === j) continue;

                let layer1 = Map.getTurfObject(activeLayers[i]),
                    layer2 = Map.getTurfObject(activeLayers[j]),
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

                results.push(`${activeLayers[i].options.shapeName} ${solution1} элемент ${activeLayers[j].options.shapeName}`);
                results.push(`${activeLayers[j].options.shapeName} ${solution2} элемент ${activeLayers[i].options.shapeName}`);
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

                let layer1 = Map.getTurfObject(activeLayers[i]),
                    layer2 = Map.getTurfObject(activeLayers[j]),
                    solution = null;

                try {
                    let intersections = turf.lineIntersect(layer1, layer2).features;

                    solution = intersections.length > 0 ? 'пересекается' : 'не пересекается';
                } catch (e) {
                    solution = 'не пересекается';
                }

                results.push(`${activeLayers[i].options.shapeName} ${solution} с элементом ${activeLayers[j].options.shapeName}`);
            }
        }

        alert(_.uniq(results).join('\n'));
    }

    boundaryElements() {
        let activeLayers = _.filter(_.toArray(this.map._renderer._layers), 'options.active');

        let results = [];

        for (let i = 0; i < activeLayers.length; i++) {
            for (let j = 0; j < activeLayers.length; j++) {
                if (i === j) continue;

                let layer1 = Map.getTurfObject(activeLayers[i]),
                    layer2 = Map.getTurfObject(activeLayers[j]),
                    layer1Name = activeLayers[i].options.shapeName,
                    layer2Name = activeLayers[j].options.shapeName;

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

                let layer1 = Map.getTurfObject(activeLayers[i]),
                    layer2 = Map.getTurfObject(activeLayers[j]),
                    layer1Name = activeLayers[i].options.shapeName,
                    layer2Name = activeLayers[j].options.shapeName,
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

    static getTurfObject(layer) {
        switch (layer.options.shapeType) {
            case 'Circle':
                let center = [layer._latlng['lat'], layer._latlng['lng']],
                    radius = layer._mRadius / 1000;

                return turf.circle(center, radius);
            case 'Line':
                let points = layer._latlngs.map((point) => ([point['lat'], point['lng']]));

                return turf.lineString(points);
            case 'Poly':
            case 'Rectangle':
                let polygon = layer._latlngs[0].map((a) => [a['lat'], a['lng']]);
                polygon.push(polygon[0]);

                return turf.polygon([polygon]);
        }
    }

    mapInitialize() {
        this.map = L.map('map', {
            contextmenu: true,
            contextmenuWidth: 300
        });

        this.map.unbindContextMenu();
        this.map.setView([51.505, -0.09], 13);
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

            // self intersection
            allowSelfIntersection: false,

            // the lines between coordinates/markers
            templineStyle: {
                color: 'red',
            },

            // the line from the last marker to the mouse cursor
            hintlineStyle: {
                color: 'red',
                dashArray: [5, 5],
            },

            // finish drawing on double click
            // DEPRECATED: use finishOn: 'dblclick' instead
            finishOnDoubleClick: false,

            // specify type of layer event to finish the drawn shape
            // example events: 'mouseout', 'dblclick', 'contextmenu'
            // List: http://leafletjs.com/reference-1.2.0.html#interactive-layer-click
            finishOn: 'contextmenu',

            // custom marker style (only for Marker draw)
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
        this.map.pm.Draw.Cut.disable(controlOptions);
    }

    static nominatimApi(api, params) {
        let host = 'https://nominatim.openstreetmap.org/';

        switch (api) {
            case 'reverse':
                return `${host}/reverse?format=jsonv2&lat=${params['lat']}&lon=${params['long']}&polygon_geojson=1&zoom=${params['zoom']}`;
        }

    }

    getLayers() {
        return this.layers;
    }

    addLayer(layer) {
        this.layers.push(layer);
        layer.addTo(this.map);
    }

    addTempLayer(layer) {
        this.tempLayers.push(layer);
        layer.addTo(this.map);
    }

    removeAllTempLayers() {
        this.tempLayers.forEach(layer => this.map.removeLayer(layer));
        this.tempLayers = [];
    }
}

export default Map;
