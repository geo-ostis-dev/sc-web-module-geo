import {MAP} from '../../Constants';

export default class Map extends L.Map {

    constructor(id, options) {
        super(id, options);

        let copyright = 'javascripts.map.copyright';
        let donate = 'javascripts.map.donate_link_text';

        this.baseLayers = [];

        this.baseLayers.push(new L.OSM.Mapnik({
            attribution: copyright + " &hearts; " + donate,
            code: "M",
            keyid: "mapnik",
            name: "javascripts.map.base.standard"
        }));

        if (MAP.THUNDERFOREST_KEY) {
            this.baseLayers.push(new L.OSM.CycleMap({
                attribution: copyright + ". Tiles courtesy of <a href='https://www.thunderforest.com/' target='_blank'>Andy Allan</a>",
                apikey: MAP.THUNDERFOREST_KEY,
                code: "C",
                keyid: "cyclemap",
                name: "javascripts.map.base.cycle_map"
            }));

            this.baseLayers.push(new L.OSM.TransportMap({
                attribution: copyright + ". Tiles courtesy of <a href='https://www.thunderforest.com/' target='_blank'>Andy Allan</a>",
                apikey: MAP.THUNDERFOREST_KEY,
                code: "T",
                keyid: "transportmap",
                name: "javascripts.map.base.transport_map"
            }));
        }

        // this.baseLayers.push(new L.MAP.HOT({
        //     attribution: copyright + ". Tiles courtesy of <a href='https://www.hotosm.org/' target='_blank'>Humanitarian OpenStreetMap Team</a>",
        //     code: "H",
        //     keyid: "hot",
        //     name: "javascripts.map.base.hot"
        // }));

        this.noteLayer = new L.FeatureGroup();
        this.noteLayer.options = {code: 'N'};

        this.dataLayer = new L.OSM.DataLayer(null);
        this.dataLayer.options.code = 'D';

        // this.gpsLayer = new L.MAP.GPS({
        //     pane: "overlayPane",
        //     code: "G",
        //     name: "javascripts.map.base.gps"
        // });
    }

    updateLayers(layerParam) {
        layerParam = layerParam || "M";
        let layersAdded = "";

        for (let i = this.baseLayers.length - 1; i >= 0; i--) {
            if (layerParam.indexOf(this.baseLayers[i].options.code) >= 0) {
                this.addLayer(this.baseLayers[i]);
                layersAdded = layersAdded + this.baseLayers[i].options.code;
            } else if (i === 0 && layersAdded === "") {
                this.addLayer(this.baseLayers[i]);
            } else {
                this.removeLayer(this.baseLayers[i]);
            }
        }
    }

    getLayersCode() {
        let layerConfig = '';
        for (let i in this._layers) { // TODO: map.eachLayer
            let layer = this._layers[i];
            if (layer.options && layer.options.code) {
                layerConfig += layer.options.code;
            }
        }
        return layerConfig;
    }

    getMapBaseLayerId() {
        for (let i in this._layers) { // TODO: map.eachLayer
            let layer = this._layers[i];
            if (layer.options && layer.options.keyid) return layer.options.keyid;
        }
    }

    getUrl(marker) {
        let precision = OSM.zoomPrecision(this.getZoom()),
            params = {};

        if (marker && this.hasLayer(marker)) {
            let latLng = marker.getLatLng().wrap();
            params.mlat = latLng.lat.toFixed(precision);
            params.mlon = latLng.lng.toFixed(precision);
        }

        let url = window.location.protocol + '//' + MAP.SERVER_URL + '/',
            query = querystring.stringify(params),
            hash = OSM.formatHash(this);

        if (query) url += '?' + query;
        if (hash) url += hash;

        return url;
    }

    getShortUrl(marker) {
        let zoom = this.getZoom(),
            latLng = marker && this.hasLayer(marker) ? marker.getLatLng().wrap() : this.getCenter().wrap(),
            str = window.location.hostname.match(/^www\.openstreetmap\.org/i) ?
                window.location.protocol + '//osm.org/go/' :
                window.location.protocol + '//' + window.location.hostname + '/go/',
            char_array = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_~",
            x = Math.round((latLng.lng + 180.0) * ((1 << 30) / 90.0)),
            y = Math.round((latLng.lat + 90.0) * ((1 << 30) / 45.0)),
            // JavaScript only has to keep 32 bits of bitwise operators, so this has to be
            // done in two parts. each of the parts c1/c2 has 30 bits of the total in it
            // and drops the last 4 bits of the full 64 bit Morton code.
            c1 = interlace(x >>> 17, y >>> 17), c2 = interlace((x >>> 2) & 0x7fff, (y >>> 2) & 0x7fff),
            digit;

        for (let i = 0; i < Math.ceil((zoom + 8) / 3.0) && i < 5; ++i) {
            digit = (c1 >> (24 - 6 * i)) & 0x3f;
            str += char_array.charAt(digit);
        }
        for (i = 5; i < Math.ceil((zoom + 8) / 3.0); ++i) {
            digit = (c2 >> (24 - 6 * (i - 5))) & 0x3f;
            str += char_array.charAt(digit);
        }
        for (i = 0; i < ((zoom + 8) % 3); ++i) str += "-";

        // Called to interlace the bits in x and y, making a Morton code.
        function interlace(x, y) {
            x = (x | (x << 8)) & 0x00ff00ff;
            x = (x | (x << 4)) & 0x0f0f0f0f;
            x = (x | (x << 2)) & 0x33333333;
            x = (x | (x << 1)) & 0x55555555;
            y = (y | (y << 8)) & 0x00ff00ff;
            y = (y | (y << 4)) & 0x0f0f0f0f;
            y = (y | (y << 2)) & 0x33333333;
            y = (y | (y << 1)) & 0x55555555;
            return (x << 1) | y;
        }

        let params = {};
        let layers = this.getLayersCode().replace('M', '');

        if (layers) {
            params.layers = layers;
        }

        if (marker && this.hasLayer(marker)) {
            params.m = '';
        }

        if (this._object) {
            params[this._object.type] = this._object.id;
        }

        let query = querystring.stringify(params);
        if (query) {
            str += '?' + query;
        }

        return str;

    }

    getGeoUri(marker) {
        let precision = OSM.zoomPrecision(this.getZoom()),
            latLng,
            params = {};

        if (marker && this.hasLayer(marker)) {
            latLng = marker.getLatLng().wrap();
        } else {
            latLng = this.getCenter();
        }

        params.lat = latLng.lat.toFixed(precision);
        params.lon = latLng.lng.toFixed(precision);
        params.zoom = this.getZoom();

        return 'geo:' + params.lat + ',' + params.lon + '?z=' + params.zoom;
    }

    addObject(object, callback) {
        let objectStyle = {
            color: "#FF6200",
            weight: 4,
            opacity: 1,
            fillOpacity: 0.5
        };

        let changesetStyle = {
            weight: 4,
            color: '#FF9500',
            opacity: 1,
            fillOpacity: 0,
            interactive: false
        };

        this.removeObject();

        let map = this;
        this._objectLoader = $.ajax({
            url: Map.apiUrl(object),
            dataType: "xml",
            success: function (xml) {
                map._object = object;

                map._objectLayer = new L.OSM.DataLayer(null, {
                    styles: {
                        node: objectStyle,
                        way: objectStyle,
                        area: objectStyle,
                        changeset: changesetStyle
                    }
                });

                map._objectLayer.interestingNode = function (node, ways, relations) {
                    if (object.type === "node") {
                        return true;
                    } else if (object.type === "relation") {
                        for (let i = 0; i < relations.length; i++)
                            if (relations[i].members.indexOf(node) !== -1)
                                return true;
                    } else {
                        return false;
                    }
                };

                map._objectLayer.addData(xml);
                map._objectLayer.addTo(map);

                if (callback) callback(map._objectLayer.getBounds());
            }
        });
    }

    removeObject() {
        this._object = null;
        if (this._objectLoader) this._objectLoader.abort();
        if (this._objectLayer) this.removeLayer(this._objectLayer);
    }

    getState() {
        return {
            center: this.getCenter().wrap(),
            zoom: this.getZoom(),
            layers: this.getLayersCode()
        };
    }

    setState(state, options) {
        if (state.center) this.setView(state.center, state.zoom, options);
        if (state.layers) this.updateLayers(state.layers);
    }

    setSidebarOverlaid(overlaid) {
        if (overlaid && !$("#content").hasClass("overlay-sidebar")) {
            $("#content").addClass("overlay-sidebar");
            this.invalidateSize({pan: false})
                .panBy([-350, 0], {animate: false});
        } else if (!overlaid && $("#content").hasClass("overlay-sidebar")) {
            this.panBy([350, 0], {animate: false});
            $("#content").removeClass("overlay-sidebar");
            this.invalidateSize({pan: false});
        }
        return this;
    }
}
