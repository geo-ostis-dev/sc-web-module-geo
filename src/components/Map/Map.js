function Map(options) {
    this.config = {
        el: ".map-wrapper"
    };

    this.map = null;
    this.layerGroup = null;

    /**
     * This is initialize function
     * @param options
     * @property {object} options
     * @property {string} options.tile_url - Default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
     * @property {number} options.lat - Default: 20
     * @property {number} options.lon - Default: 0
     * @property {number} options.zoom - Default: 0
     * @property {string} options.tile_attribution
     */
    this.initialize = function (options) {
        options = options ? options : {};

        this.map = new L.map('map', {
            scrollWheelZoom: true,
            touchZoom: false
        });

        L.tileLayer(options.tile_url || CONST.DEFAULT_TILE_URL, {
            noWrap: true, // otherwise we end up with click coordinates like latitude -728
            attribution: (options.tile_attribution || null)
        }).addTo(this.map);

        this.map.setView(
            [options.lat || CONST.DEFAULT_LAT, options.lon || CONST.DEFAULT_LON],
            options.zoom || CONST.DEFAULT_ZOOM
        );

        var miniMap = new L.TileLayer(options.tile_url || CONST.DEFAULT_TILE_URL, {
            minZoom: 0,
            maxZoom: 13,
            attribution: (options.tile_attribution || null)
        });
        new L.Control.MiniMap(miniMap, {toggleDisplay: true}).addTo(this.map);

        this.layerGroup = new L.layerGroup().addTo(this.map);
    };

    this.highlight_result = function (nominatim_results, position, bool_focus) {
        var result = nominatim_results[position];
        if (!result) {
            return
        }
        var result_el = get_result_element(position);

        $('.result').removeClass('highlight');
        result_el.addClass('highlight');

        this.layerGroup.clearLayers();

        if (result.boundingbox) {
            var bounds = [[result.boundingbox[0] * 1, result.boundingbox[2] * 1], [result.boundingbox[1] * 1, result.boundingbox[3] * 1]];
            this.map.fitBounds(bounds);

            if (result.geojson.type && result.geojson.type.match(/(Polygon)|(Line)/)) {

                var geojson_layer = L.geoJson(
                    parse_and_normalize_geojson_string(result.geojson),
                    {
                        // http://leafletjs.com/reference-1.0.3.html#path-option
                        style: function (feature) {
                            return {interactive: false, color: 'blue'};
                        }
                    }
                );
                this.layerGroup.addLayer(geojson_layer);
            }
            else {
                // var layer = L.rectangle(bounds, {color: "#ff7800", weight: 1} );
                // layerGroup.addLayer(layer);
            }
        }
        else {
            var result_coord = L.latLng(result.lat, result.lon);
            if (result_coord) {
                this.map.panTo(result_coord, result.zoom || nominatim_map_init.zoom);

            }
        }

        if (bool_focus) {
            $('#mapElement').focus();
        }
    };

    function get_result_element(position) {
        return $('.result').eq(position);
    }

    function marker_for_result(result) {
        return L.marker([result.lat, result.lon], {riseOnHover: true, title: result.name});
    }

    function circle_for_result(result) {
        return L.circleMarker([result.lat, result.lon], {
            radius: 10,
            weight: 2,
            fillColor: '#ff7800',
            color: 'blue',
            opacity: 0.75
        });
    }

    function parse_and_normalize_geojson_string(raw_string) {
        return {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: raw_string,
                    properties: {}
                }
            ]
        };
    }

    Base.apply(this, arguments);
}
