import './map.less'
import 'leaflet/dist/images/marker-shadow.png'
import {MAP} from 'middleware/constants.js';
import Layer from 'components/layer';
import component from 'middleware/decorators/component';
import {uniqBy, filter, reject, first, values, isEmpty} from 'lodash';
import layerInformation from './layerInformation.mustache';
import layersComparision from './layersComparision.mustache';

class Map {
    layers = [];

    constructor() {
        this.mapInitialize();

        this.el.on('contextmenu', this.eventMapContextMenu.bind(this));
        this.el.on('pm:create', this.eventCreatePMLayer.bind(this));
        this.el.on('click', () => this.sidebar.hide());
    }

    eventCreatePMLayer(event) {
        let layer = new Layer(event.layer);

        layer.options.shape = event.shape;
        layer.bindContextMenu({
            contextmenu: true,
            bubblingMouseEvents: false,
            contextmenuInheritItems: false,
            contextmenuItems: [{
                text: 'Показать пространственную информацию',
                callback: this.eventShowLayerInfo.bind(this)
            }]
        });
        this.addLayer(layer, {noAddToMap: true});
    }

    addLayer(layer, options = {}) {
        layer.options.active = !!options.active;
        layer.options.temp = !!options.temp;
        layer.options.search = !!options.search;
        layer.once('remove', this.eventRemoveLayer.bind(this));

        if (!layer.options.temp) {
            // layer.bindPopup(layer.options.osm.name, {closeButton: false});
            layer.options.name = this.resolveLayerName(layer);
            // layer.on('mouseover', () => layer.openPopup());
            // layer.on('mouseout', () => layer.closePopup());
        }
        if (!options.noAddToMap) layer.addTo(this.el);

        this.layers.push(layer);

        return layer;
    }


    eventShowLayerInfo(event) {
        let osm = event.relatedTarget.options.osm;

        let content = layerInformation({
            name: osm.name,
            country: osm.address.country,
            country_code: osm.address.country_code,
            county: osm.address.county,
            place_rank: osm.place_rank,
            area: turf.area(osm.geojson),
            state: osm.address.state
        });

        this.sidebar.setContent(content);
        this.sidebar.show();
    }

    eventCompareLayers() {
        let activeLayers = this.getActiveLayers();
        if (activeLayers.length !== 2) return;

        let osm1 = activeLayers[0].options.osm;
        let osm2 = activeLayers[1].options.osm;

        let content = layersComparision({
            name1: osm1.name,
            country1: osm1.address.country,
            country_code1: osm1.address.country_code,
            county1: osm1.address.county,
            place_rank1: osm1.place_rank,
            area1: turf.area(osm1.geojson),
            state1: osm1.address.state,
            name2: osm2.name,
            country2: osm2.address.country,
            country_code2: osm2.address.country_code,
            county2: osm2.address.county,
            place_rank2: osm2.place_rank,
            area2: turf.area(osm2.geojson),
            state2: osm2.address.state
        });

        this.sidebar.setContent(content);
        this.sidebar.show();

    }

    eventMapContextMenu(event) {
        this.el.spin(true);

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
                this.el.contextmenu.removeAllItems();

                uniqBy(jsons, 'place_id').forEach(json => {
                    let item = this.el.contextmenu.addItem({text: json['display_name']});

                    $(item).data('osm_info', json);

                    $(item).on('mouseenter', this.addTempLayer.bind(this));
                    $(item).on('mouseleave', this.removeTempLayers.bind(this));

                    $(item).on('click', event => {
                        let geojson = $(event.target).data('osm_info')['geojson'],
                            layer = first(L.geoJson(geojson, {
                                contextmenu: true,
                                bubblingMouseEvents: false,
                                contextmenuInheritItems: false,
                                osm: $(event.target).data('osm_info'),
                                contextmenuItems: [{
                                    text: 'Показать пространственную информацию',
                                    callback: this.eventShowLayerInfo.bind(this)
                                }]
                            }).getLayers());

                        this.addLayer(layer);
                        layer.on('click', this.eventLayerSelect.bind(this));
                    });

                });

                this.el.contextmenu.showAt(event.latlng);
                this.el.spin(false);
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

            layer.addContextMenuItem({
                text: 'Сравнить площадные объекты',
                index: 500,
                callback: this.eventCompareLayers.bind(this)
            });
        } else {
            layer.removeContextMenuItemWithIndex(100);
            layer.removeContextMenuItemWithIndex(200);
            layer.removeContextMenuItemWithIndex(300);
            layer.removeContextMenuItemWithIndex(400);
            layer.removeContextMenuItemWithIndex(400);
            layer.removeContextMenuItemWithIndex(500);
        }
    }

    shapeInclusion() {
        let activeLayers = this.getActiveLayers(),
            results = [];

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

                results.push(`<b>${activeLayers[i].options.name}</b> ${solution1} элемент <b>${activeLayers[j].options.name}</b>`);
                results.push(`<b>${activeLayers[j].options.name}</b> ${solution2} элемент <b>${activeLayers[i].options.name}</b>`);
            }
        }

        L.control.window(this.el, {title: 'Результат включения элементов', content: _.uniq(results).join('<br>'), visible: true});
    }

    shapeIntersection() {
        let activeLayers = this.getActiveLayers(),
            results = [];

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

                results.push(`<b>${activeLayers[i].options.name}</b> ${solution} с элементом <b>${activeLayers[j].options.name}</b>`);
            }
        }

        L.control.window(this.el, {title: 'Результат пересечения элементов', content: _.uniq(results).join('<br>'), visible: true});
    }

    boundaryElements() {
        let activeLayers = this.getActiveLayers(),
            results = [];

        for (let i = 0; i < activeLayers.length; i++) {
            for (let j = 0; j < activeLayers.length; j++) {
                if (i === j) continue;

                let layer1 = activeLayers[i].toGeoJSON(),
                    layer2 = activeLayers[j].toGeoJSON(),
                    layer1Name = activeLayers[i].options.name,
                    layer2Name = activeLayers[j].options.name;

                let intersection = turf.intersect(layer1, layer2);

                if (intersection && (intersection.geometry.type === 'LineString' || intersection.geometry.type === 'MultiLineString')) {
                    results.push(`<b>${layer1Name}</b> граничит с элементом <b>${layer2Name}</b>`);
                } else {
                    results.push(`<b>${layer1Name}</b> не граничит с элементом <b>${layer2Name}</b>`);
                }
            }
        }

        L.control.window(this.el, {title: 'Граничащие элементы', content: _.uniq(results).join('<br>'), visible: true});
    }

    contiguity() {
        let activeLayers = this.getActiveLayers(),
            results = [];

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
                        results.push(`<b>${layer1Name}</b> примыкает к элементу <b>${layer2Name}</b>`);
                    } else if (intersectionType === 'Point' && (_.isEqual(intersectionPoint, layer2firstPoint) || _.isEqual(intersectionPoint, layer2lastPoint))) {
                        results.push(`<b>${layer2Name}</b> примыкает к элементу <b>${layer1Name}</b>`);
                    } else {
                        results.push(`<b>${layer1Name}</b> не примыкает к элементу <b>${layer2Name}</b>`);
                    }
                } catch (e) {
                    results.push(`<b>${layer1Name}</b> не примыкает к элементу <b>${layer2Name}</b>`);
                }
            }
        }

        L.control.window(this.el, {title: 'Результат примыкания элементов', content: _.uniq(results).join('<br>'), visible: true});
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

    mapInitialize() {
        this.el = L.map('map', {
            contextmenu: true,
            contextmenuWidth: 300,
            closePopupOnClick: false
        });

        this.el.off('contextmenu');
        this.el.setView([53.53, 27.34], 13);
        this.el.doubleClickZoom.disable();
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.el);

        // Sidebar
        this.sidebar = L.control.sidebar('sidebar', {
            closeButton: true,
            position: 'right'
        });
        this.el.addControl(this.sidebar);

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
        this.el.pm.addControls(options);

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

        this.el.pm.enableDraw('Poly', controlOptions);
        this.el.pm.disableDraw('Poly');

        this.el.pm.enableDraw('Rectangle', controlOptions);
        this.el.pm.disableDraw('Rectangle');

        this.el.pm.enableDraw('Line', controlOptions);
        this.el.pm.disableDraw('Line');

        this.el.pm.enableDraw('Marker', controlOptions);
        this.el.pm.disableDraw('Marker');

        this.el.pm.enableDraw('Circle', controlOptions);
        this.el.pm.disableDraw('Circle');

        this.el.pm.enableDraw('Cut', controlOptions);
        this.el.pm.disableDraw('Cut');
    }


    eventRemoveLayer(event) {
        this.layers = reject(this.layers, ['_leaflet_id', event.target._leaflet_id]);
    }

    resolveLayerName(layer) {
        let shape = layer.options.shape;
        let sameShapesCount = filter(this.getLayers(), ['options.shape', shape]).length;
        let shapeNumber = (sameShapesCount === 0) ? '' : sameShapesCount;

        if (layer.options.osm) {
            return layer.options.osm.name;
        } else if (shape) {
            return `${shape}${shapeNumber}`;
        } else {
            return 'Элемент';
        }
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

    addTempLayer(event) {
        let geojson = $(event.target).data('osm_info')['geojson'],
            layer = first(L.geoJson(geojson).getLayers());

        this.addLayer(layer, {temp: true});

    }

    removeTempLayers() {
        let tempLayers = filter(this.layers, 'options.temp');
        tempLayers.forEach(layer => this.el.removeLayer(layer));
    }

    removeSearchLayers() {
        let tempLayers = filter(this.layers, 'options.search');
        tempLayers.forEach(layer => this.el.removeLayer(layer));
    }
}

export default Map;
