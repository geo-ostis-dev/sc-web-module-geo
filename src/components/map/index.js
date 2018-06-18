import './map.less'
import 'leaflet/dist/images/marker-shadow.png'
import {MAP} from 'middleware/constants.js';
import {uniqBy, filter, reject, first, values, isEmpty, keys, get, replace} from 'lodash';
import layerInformation from './layerInformation.mustache';
import layersComparision from './layersComparision.mustache';
import md5 from 'md5';

class Map {
    layers = [];
    api = window.components.api;

    constructor() {
        this.mapInitialize();

        this.el.on('contextmenu', this.eventMapContextMenu.bind(this));
        this.el.on('pm:create', this.eventCreatePMLayer.bind(this));
        this.el.on('click', () => this.sidebar.hide());
    }

    eventCreatePMLayer(event) {
        let layer = event.layer;
        layer.options.shape = event.shape;
        layer.bindContextMenu({
            contextmenu: true,
            bubblingMouseEvents: false,
            contextmenuInheritItems: false
        });

        layer.on('click', this.eventLayerSelect.bind(this));
        this.addLayer(layer, {noAddToMap: true, pm: true});
    }

    addLayer(layer, options = {}) {
        layer.options.active = !!options.active;
        layer.options.temp = !!options.temp;
        layer.options.pm = !!options.pm;
        layer.once('remove', this.eventRemoveLayer.bind(this));

        if (!layer.options.temp) layer.options.name = this.resolveLayerName(layer);
        if (!options.noAddToMap) layer.addTo(this.el);

        this.layers.push(layer);

        return layer;
    }

    eventShowLayerInfo(event) {
        let nominatimInfo = get(event, 'relatedTarget.options.nominatimInfo'),
            wikiInfo = get(event, 'relatedTarget.options.wikiInfo'),
            area_km2 = turf.area(nominatimInfo.geojson) / 1000000;

        let content = {
            name: get(nominatimInfo, 'name') || get(nominatimInfo, 'display_name'),
            population: get(nominatimInfo, 'extratags.population'),
            country: get(nominatimInfo, 'address.country'),
            country_code: get(nominatimInfo, 'address.country_code'),
            county: get(nominatimInfo, 'address.county'),
            place_rank: get(nominatimInfo, 'place_rank'),
            area: Math.round(area_km2 * 1000) / 1000,
            state: get(nominatimInfo, 'address.state')
        };

        if (wikiInfo) {
            content.website = this.api.getWikiWebsite(wikiInfo);
            content.images = this.api.getWikiImages(wikiInfo);
            content.flagImage = this.api.getWikiFlagImage(wikiInfo);
            content.postalCode = this.api.getWikiPostalCode(wikiInfo);
            content.coord = this.api.getWikiCoord(wikiInfo);
            content.wikiLink = this.api.getWikiRuLink(wikiInfo);
        }

        keys(content).map((key, _) => {
            if (!content[key] || content[key] === '' || content[key].length === 0) {
                content[key] = '-';
            }
        });

        this.sidebar.setContent(layerInformation(content));
        this.sidebar.show();
    }

    eventCompareLayers() {
        let activeLayers = this.getActiveOSMLayers();

        if (activeLayers.length !== 2) return;

        let nominatimInfo1 = activeLayers[0].options.nominatimInfo,
            wikiInfo1 = activeLayers[0].options.wikiInfo,
            nominatimInfo2 = activeLayers[1].options.nominatimInfo,
            wikiInfo2 = activeLayers[1].options.wikiInfo,
            area1_km2 = turf.area(nominatimInfo1.geojson) / 1000000,
            area2_km2 = turf.area(nominatimInfo2.geojson) / 1000000;

        let content = {
            name1: nominatimInfo1.name,
            population1: get(nominatimInfo1, 'extratags.population'),
            country1: nominatimInfo1.address.country,
            country_code1: nominatimInfo1.address.country_code,
            county1: nominatimInfo1.address.county,
            place_rank1: nominatimInfo1.place_rank,
            area1: Math.round(area1_km2 * 1000) / 1000,
            state1: nominatimInfo1.address.state,

            name2: nominatimInfo2.name,
            population2: get(nominatimInfo2, 'extratags.population'),
            country2: nominatimInfo2.address.country,
            country_code2: nominatimInfo2.address.country_code,
            county2: nominatimInfo2.address.county,
            place_rank2: nominatimInfo2.place_rank,
            area2: Math.round(area2_km2 * 1000) / 1000,
            state2: nominatimInfo2.address.state
        };

        if (wikiInfo1) {
            content.website1 = this.api.getWikiWebsite(wikiInfo1);
            content.images1 = this.api.getWikiImages(wikiInfo1);
            content.flagImage1 = this.api.getWikiFlagImage(wikiInfo1);
            content.postalCode1 = this.api.getWikiPostalCode(wikiInfo1);
            content.coord1 = this.api.getWikiCoord(wikiInfo1);
            content.wikiLink1 = this.api.getWikiRuLink(wikiInfo1);
        }

        if (wikiInfo2) {
            content.website2 = this.api.getWikiWebsite(wikiInfo2);
            content.images2 = this.api.getWikiImages(wikiInfo2);
            content.flagImage2 = this.api.getWikiFlagImage(wikiInfo2);
            content.postalCode2 = this.api.getWikiPostalCode(wikiInfo2);
            content.coord2 = this.api.getWikiCoord(wikiInfo2);
            content.wikiLink2 = this.api.getWikiRuLink(wikiInfo2);
        }

        keys(content).map((key, _) => {
            if (!content[key] || content[key] === '') {
                content[key] = '-';
            }
        });

        this.sidebar.setContent(layersComparision(content));
        this.sidebar.show();

    }

    eventMapContextMenu(event) {
        this.el.spin(true);

        let promises = MAP.ZOOM.map((zoom) => {
            return fetch(this.api.nominatim({
                path: 'reverse',
                lat: event['latlng']['lat'], long: event['latlng']['lng'],
                geojson: 1, extra: 1, address: 1, zoom: zoom
            }));
        });

        Promise.all(promises)
            .then(results => {
                let jsonResults = results.map(result => result.json());
                return Promise.all(jsonResults);
            })
            .then((jsons) => {
                this.el.contextmenu.removeAllItems();
                this._nominatimTempResults = {};

                uniqBy(jsons, 'place_id').forEach(json => {
                    let item = this.el.contextmenu.addItem({text: json['display_name']});

                    this._nominatimTempResults[json['place_id']] = json;
                    $(item).data('place_id', json['place_id']);

                    $(item).on('mouseenter', this.addTempLayer.bind(this));
                    $(item).on('mouseleave', this.removeTempLayers.bind(this));
                    $(item).on('click', this.eventAddProposedLayer.bind(this));
                });

                this.el.contextmenu.showAt(event.latlng);
                this.el.spin(false);
            })
    }

    eventAddProposedLayer(event) {
        this.el.spin(true);

        let place_id = $(event.target).data('place_id');
        this._nominatimInfo = this._nominatimTempResults[place_id];

        let wiki_id = this._nominatimInfo['extratags']['wikidata'],
            wikidataPromise = wiki_id ? fetch(this.api.wikidata({ids: wiki_id})) : Promise.resolve(false);

        wikidataPromise
            .then((wikiResult) => wikiResult ? wikiResult.json() : false)
            .then((wikiJSON) => {
                let layerGroup = L.geoJson(this._nominatimInfo['geojson'], {
                        contextmenu: true,
                        bubblingMouseEvents: false,
                        contextmenuInheritItems: false,
                        nominatimInfo: this._nominatimInfo,
                        wikiInfo: wikiJSON ? first(values(wikiJSON.entities)) : null,
                        contextmenuItems: [{
                            text: 'Показать пространственную информацию',
                            callback: this.eventShowLayerInfo.bind(this)
                        }]
                    }),
                    layer = first(layerGroup.getLayers());

                this.addLayer(layer);
                layer.on('click', this.eventLayerSelect.bind(this));

                this.el.spin(false);
            });
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

        L.control.window(this.el, {
            title: 'Результат включения элементов',
            content: _.uniq(results).join('<br>'),
            visible: true
        });
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

        L.control.window(this.el, {
            title: 'Результат пересечения элементов',
            content: _.uniq(results).join('<br>'),
            visible: true
        });
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

        L.control.window(this.el, {
            title: 'Граничащие элементы',
            content: _.uniq(results).join('<br>'),
            visible: true
        });
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

        L.control.window(this.el, {
            title: 'Результат примыкания элементов',
            content: _.uniq(results).join('<br>'),
            visible: true
        });
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

        if (layer.options.nominatimInfo) {
            return layer.options.nominatimInfo.name || layer.options.nominatimInfo.display_name;
        } else if (shape) {
            return `${shape}${shapeNumber}`;
        } else {
            return 'Элемент';
        }
    }

    getActiveOSMLayers() {
        let layers = filter(this.layers, 'options.active');
        return reject(layers, 'options.pm');
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
        let place_id = $(event.target).data('place_id'),
            geojson = this._nominatimTempResults[place_id]['geojson'],
            layer = first(L.geoJson(geojson).getLayers());

        this.addLayer(layer, {temp: true});
    }

    removeTempLayers() {
        let tempLayers = filter(this.layers, 'options.temp');
        tempLayers.forEach(layer => this.el.removeLayer(layer));
    }
}

export default Map;
