$(document).ready(function () {
    window.parent.$("#window-header-tools").css("visibility", "hidden");
    window.parent.$("#history-item-langs").css("visibility", "visible");
    window.parent.$("#history-item-langs").css("left", "96px");
    window.parent.$("#history-item-langs").css("top", "34px");

    window.parent.$("#history-item-langs a").on("click", function(event) {
        var innerText = event.target.innerHTML;

        if (innerText === "Map interface" || innerText === "Картографический интерфейс") {
            window.parent.$("#window-header-tools").css("visibility", "hidden");
            window.parent.$("#history-item-langs").css("visibility", "visible");
            window.parent.$("#history-item-langs").css("left", "96px");
            window.parent.$("#history-item-langs").css("top", "34px");
        } else {
            window.parent.$("#window-header-tools").css("visibility", "");
            window.parent.$("#history-item-langs").css("visibility", "");
            window.parent.$("#history-item-langs").css("left", "");
            window.parent.$("#history-item-langs").css("top", "");
        }
    });

    $(".menu").on("click",function() {
        window.parent.$(".histoy-item-btn").click();
    });

    $(".hide-history").on("click",function() {
        window.parent.$("#windows-list").click();
    });

    var OSM = {

        MAX_REQUEST_AREA:        0.25,
        SERVER_PROTOCOL:         "http",
        SERVER_URL:              "openstreetmap.example.com",
        API_VERSION:             "0.6",
        STATUS:                  "online",
        MAX_NOTE_REQUEST_AREA:   25,
        OVERPASS_URL:            "https://overpass-api.de/api/interpreter",
        NOMINATIM_URL:           "https://nominatim.openstreetmap.org/",
        GRAPHHOPPER_URL:         "https://graphhopper.com/api/1/route",
        MAPQUEST_DIRECTIONS_URL: "https://open.mapquestapi.com/directions/v2/route",
        OSRM_URL:                "https://router.project-osrm.org/route/v1/driving/",
        DEFAULT_LOCALE:          "en",


        MARKER_GREEN:            "/assets/marker-green-a9c0b29cb063cce2ad2e158dc81d3ba69e192f83e6d99d8fbdce51f510333c69.png",
        MARKER_RED:              "/assets/marker-red-642ccf845d55fc3aff154f0d0d7664fe3a9842b5f32a9858df1e1c827641499f.png",

        MARKER_ICON:             "/assets/images/marker-icon-574c3a5cca85f4114085b6841596d62f00d7c892c7b03f28cbfa301deb1dc437.png",
        MARKER_ICON_2X:          "/assets/images/marker-icon-2x-00179c4c1ee830d3a108412ae0d294f55776cfeb085c60129a39aa6fc4ae2528.png",
        MARKER_SHADOW:           "/assets/images/marker-shadow-264f5c640339f042dd729062cfc04c17f8ea0f29882b538e3848ed8f10edb4da.png",

        NEW_NOTE_MARKER:         "/assets/new_note_marker-589c133512af83879f3004b07a34772498a2f3c12d41253ccfa15f6edb8b894a.png",
        OPEN_NOTE_MARKER:        "/assets/open_note_marker-5adc781e5c21f9ef5917a96bbe2268bc08612953b7bb512cbb8025f17854fa03.png",
        CLOSED_NOTE_MARKER:      "/assets/closed_note_marker-2da3d5484647880e056ea9160f48ae0762c004f2746149e1d3cf5e6a449aeb00.png",

        SEARCHING:               "/assets/searching-b66184be88a18bc2147e414ab67bde941db2507a69d455439a09d5280a8bdb63.gif",

        apiUrl: function (object) {
            var url = "/api/" + OSM.API_VERSION + "/" + object.type + "/" + object.id;

            if (object.type === "way" || object.type === "relation") {
                url += "/full";
            } else if (object.version) {
                url += "/" + object.version;
            }

            return url;
        },

        params: function(search) {
            var params = {};

            search = (search || window.location.search).replace('?', '').split(/&|;/);

            for (var i = 0; i < search.length; ++i) {
                var pair = search[i],
                    j = pair.indexOf('='),
                    key = pair.slice(0, j),
                    val = pair.slice(++j);

                try {
                    params[key] = decodeURIComponent(val);
                } catch (e) {
                    // Ignore parse exceptions
                }
            }

            return params;
        },

        mapParams: function (search) {
            var params = OSM.params(search), mapParams = {}, loc, match;

            if (params.mlon && params.mlat) {
                mapParams.marker = true;
                mapParams.mlon = parseFloat(params.mlon);
                mapParams.mlat = parseFloat(params.mlat);
            }

            // Old-style object parameters; still in use for edit links e.g. /edit?way=1234
            if (params.node) {
                mapParams.object = {type: 'node', id: parseInt(params.node)};
            } else if (params.way) {
                mapParams.object = {type: 'way', id: parseInt(params.way)};
            } else if (params.relation) {
                mapParams.object = {type: 'relation', id: parseInt(params.relation)};
            }

            var hash = OSM.parseHash(location.hash);

            // Decide on a map starting position. Various ways of doing this.
            if (hash.center) {
                mapParams.lon = hash.center.lng;
                mapParams.lat = hash.center.lat;
                mapParams.zoom = hash.zoom;
            } else if (params.bbox) {
                var bbox = params.bbox.split(',');
                mapParams.bounds = L.latLngBounds(
                    [parseFloat(bbox[1]), parseFloat(bbox[0])],
                    [parseFloat(bbox[3]), parseFloat(bbox[2])]);
            } else if (params.minlon && params.minlat && params.maxlon && params.maxlat) {
                mapParams.bounds = L.latLngBounds(
                    [parseFloat(params.minlat), parseFloat(params.minlon)],
                    [parseFloat(params.maxlat), parseFloat(params.maxlon)]);
            } else if (params.mlon && params.mlat) {
                mapParams.lon = parseFloat(params.mlon);
                mapParams.lat = parseFloat(params.mlat);
                mapParams.zoom = parseInt(params.zoom || 12);
            } else if (loc = $.cookie('_osm_location')) {
                loc = loc.split("|");
                mapParams.lon = parseFloat(loc[0]);
                mapParams.lat = parseFloat(loc[1]);
                mapParams.zoom = parseInt(loc[2]);
            } else if (OSM.home) {
                mapParams.lon = OSM.home.lon;
                mapParams.lat = OSM.home.lat;
                mapParams.zoom = 10;
            } else if (OSM.location) {
                mapParams.bounds = L.latLngBounds(
                    [OSM.location.minlat,
                        OSM.location.minlon],
                    [OSM.location.maxlat,
                        OSM.location.maxlon]);
            } else {
                mapParams.lon = -0.1;
                mapParams.lat = 51.5;
                mapParams.zoom = parseInt(params.zoom || 5);
            }

            mapParams.layers = hash.layers || (loc && loc[3]) || '';

            var scale = parseFloat(params.scale);
            if (scale > 0) {
                mapParams.zoom = Math.log(360.0 / (scale * 512.0)) / Math.log(2.0);
            }

            return mapParams;
        },

        parseHash: function(hash) {
            var args = {};

            var i = hash.indexOf('#');
            if (i < 0) {
                return args;
            }

            hash = querystring.parse(hash.substr(i + 1));

            var map = (hash.map || '').split('/'),
                zoom = parseInt(map[0], 10),
                lat = parseFloat(map[1]),
                lon = parseFloat(map[2]);

            if (!isNaN(zoom) && !isNaN(lat) && !isNaN(lon)) {
                args.center = new L.LatLng(lat, lon);
                args.zoom = zoom;
            }

            if (hash.layers) {
                args.layers = hash.layers;
            }

            return args;
        },

        formatHash: function(args) {
            var center, zoom, layers;

            if (args instanceof L.Map) {
                center = args.getCenter();
                zoom = args.getZoom();
                layers = args.getLayersCode();
            } else {
                center = args.center || L.latLng(args.lat, args.lon);
                zoom = args.zoom;
                layers = args.layers || '';
            }

            center = center.wrap();
            layers = layers.replace('M', '');

            var precision = OSM.zoomPrecision(zoom),
                hash = '#map=' + zoom +
                    '/' + center.lat.toFixed(precision) +
                    '/' + center.lng.toFixed(precision);

            if (layers) {
                hash += '&layers=' + layers;
            }

            return hash;
        },

        zoomPrecision: function(zoom) {
            return Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
        },

        locationCookie: function(map) {
            var center = map.getCenter().wrap(),
                zoom = map.getZoom(),
                precision = OSM.zoomPrecision(zoom);
            return [center.lng.toFixed(precision), center.lat.toFixed(precision), zoom, map.getLayersCode()].join('|');
        },

        distance: function(latlng1, latlng2) {
            var lat1 = latlng1.lat * Math.PI / 180,
                lng1 = latlng1.lng * Math.PI / 180,
                lat2 = latlng2.lat * Math.PI / 180,
                lng2 = latlng2.lng * Math.PI / 180,
                latdiff = lat2 - lat1,
                lngdiff = lng2 - lng1;

            return 6372795 * 2 * Math.asin(
                Math.sqrt(
                    Math.pow(Math.sin(latdiff / 2), 2) +
                    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(lngdiff / 2), 2)
                ));
        }
    };


    var url = OSM.OVERPASS_URL,
        queryButton = $(".control-query .control-button"),
        uninterestingTags = ['source', 'source_ref', 'source:ref', 'history', 'attribution', 'created_by', 'tiger:county', 'tiger:tlid', 'tiger:upload_uuid', 'KSJ2:curve_id', 'KSJ2:lat', 'KSJ2:lon', 'KSJ2:coordinate', 'KSJ2:filename', 'note:ja'],
        marker;

    var featureStyle = {
        color: "#FF6200",
        weight: 4,
        opacity: 1,
        fillOpacity: 0.5,
        interactive: false
    };

    queryButton
        .on("click", function (e) {
            debugger;
            e.preventDefault();
            e.stopPropagation();

            if (queryButton.hasClass("active")) {
                disableQueryMode();
            } else if (!queryButton.hasClass("disabled")) {
                enableQueryMode();
            }
        })
        .on("disabled", function () {
            if (queryButton.hasClass("active")) {
                map.off("click", clickHandler);
                $(map.getContainer()).removeClass("query-active").addClass("query-disabled");
                $(this).tooltip("show");
            }
        })
        .on("enabled", function () {
            if (queryButton.hasClass("active")) {
                map.on("click", clickHandler);
                $(map.getContainer()).removeClass("query-disabled").addClass("query-active");
                $(this).tooltip("hide");
            }
        });

    $("#sidebar_content")
        .on("mouseover", ".query-results li.query-result", function () {
            var geometry = $(this).data("geometry");
            if (geometry) map.addLayer(geometry);
            $(this).addClass("selected");
        })
        .on("mouseout", ".query-results li.query-result", function () {
            var geometry = $(this).data("geometry");
            if (geometry) map.removeLayer(geometry);
            $(this).removeClass("selected");
        })
        .on("mousedown", ".query-results li.query-result", function () {
            var moved = false;
            $(this).one("click", function (e) {
                if (!moved) {
                    var geometry = $(this).data("geometry");
                    if (geometry) map.removeLayer(geometry);

                    if (!$(e.target).is('a')) {
                        $(this).find("a").simulate("click", e);
                    }
                }
            }).one("mousemove", function () {
                moved = true;
            });
        });

    function interestingFeature(feature) {
        if (feature.tags) {
            for (var key in feature.tags) {
                if (uninterestingTags.indexOf(key) < 0) {
                    return true;
                }
            }
        }

        return false;
    }

    function featurePrefix(feature) {
        var tags = feature.tags;
        var prefix = "";

        if (tags.boundary === "administrative" && tags.admin_level) {
            prefix = I18n.t("geocoder.search_osm_nominatim.admin_levels.level" + tags.admin_level, {
                defaultValue: I18n.t("geocoder.search_osm_nominatim.prefix.boundary.administrative")
            });
        } else {
            var prefixes = I18n.t("geocoder.search_osm_nominatim.prefix");
            var key, value;

            for (key in tags) {
                value = tags[key];

                if (prefixes[key]) {
                    if (prefixes[key][value]) {
                        return prefixes[key][value];
                    }
                }
            }

            for (key in tags) {
                value = tags[key];

                if (prefixes[key]) {
                    var first = value.substr(0, 1).toUpperCase(),
                        rest = value.substr(1).replace(/_/g, " ");

                    return first + rest;
                }
            }
        }

        if (!prefix) {
            prefix = I18n.t("javascripts.query." + feature.type);
        }

        return prefix;
    }

    function featureName(feature) {
        var tags = feature.tags,
            locales = I18n.locales.get();

        for (var i = 0; i < locales.length; i++) {
            if (tags["name:" + locales[i]]) {
                return tags["name:" + locales[i]];
            }
        }

        if (tags.name) {
            return tags.name;
        } else if (tags.ref) {
            return tags.ref;
        } else if (tags["addr:housename"]) {
            return tags["addr:housename"];
        } else if (tags["addr:housenumber"] && tags["addr:street"]) {
            return tags["addr:housenumber"] + " " + tags["addr:street"];
        } else {
            return "#" + feature.id;
        }
    }

    function featureGeometry(feature) {
        var geometry;

        if (feature.type === "node" && feature.lat && feature.lon) {
            geometry = L.circleMarker([feature.lat, feature.lon], featureStyle);
        } else if (feature.type === "way" && feature.geometry && feature.geometry.length > 0) {
            geometry = L.polyline(feature.geometry.filter(function (point) {
                return point !== null;
            }).map(function (point) {
                return [point.lat, point.lon];
            }), featureStyle);
        } else if (feature.type === "relation" && feature.members) {
            geometry = L.featureGroup(feature.members.map(featureGeometry).filter(function (geometry) {
                return geometry !== undefined;
            }));
        }

        return geometry;
    }

    function runQuery(latlng, radius, query, $section, merge, compare) {
        var $ul = $section.find("ul");

        $ul.empty();
        $section.show();

        $section.find(".loader").oneTime(1000, "loading", function () {
            $(this).show();
        });

        if ($section.data("ajax")) {
            $section.data("ajax").abort();
        }

        $section.data("ajax", $.ajax({
            url: url,
            method: "POST",
            data: {
                data: "[timeout:10][out:json];" + query,
            },
            success: function (results) {
                var elements;

                $section.find(".loader").stopTime("loading").hide();

                if (merge) {
                    elements = results.elements.reduce(function (hash, element) {
                        var key = element.type + element.id;
                        if ("geometry" in element) {
                            delete element.bounds;
                        }
                        hash[key] = $.extend({}, hash[key], element);
                        return hash;
                    }, {});

                    elements = Object.keys(elements).map(function (key) {
                        return elements[key];
                    });
                } else {
                    elements = results.elements;
                }

                if (compare) {
                    elements = elements.sort(compare);
                }

                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];

                    if (interestingFeature(element)) {
                        var $li = $("<li>")
                            .addClass("query-result")
                            .data("geometry", featureGeometry(element))
                            .appendTo($ul);
                        var $p = $("<p>")
                            .text(featurePrefix(element) + " ")
                            .appendTo($li);

                        $("<a>")
                            .attr("href", "/" + element.type + "/" + element.id)
                            .text(featureName(element))
                            .appendTo($p);
                    }
                }

                if (results.remark) {
                    $("<li>")
                        .text(I18n.t("javascripts.query.error", {server: url, error: results.remark}))
                        .appendTo($ul);
                }

                if ($ul.find("li").length === 0) {
                    $("<li>")
                        .text(I18n.t("javascripts.query.nothing_found"))
                        .appendTo($ul);
                }
            },
            error: function (xhr, status, error) {
                $section.find(".loader").stopTime("loading").hide();

                $("<li>")
                    .text(I18n.t("javascripts.query." + status, {server: url, error: error}))
                    .appendTo($ul);
            }
        }));
    }

    function compareSize(feature1, feature2) {
        var width1 = feature1.bounds.maxlon - feature1.bounds.minlon,
            height1 = feature1.bounds.maxlat - feature1.bounds.minlat,
            area1 = width1 * height1,
            width2 = feature2.bounds.maxlat - feature2.bounds.minlat,
            height2 = feature2.bounds.maxlat - feature2.bounds.minlat,
            area2 = width2 * height2;

        return area1 - area2;
    }

    /*
     * To find nearby objects we ask overpass for the union of the
     * following sets:
     *
     *   node(around:<radius>,<lat>,lng>)
     *   way(around:<radius>,<lat>,lng>)
     *   relation(around:<radius>,<lat>,lng>)
     *
     * to find enclosing objects we first find all the enclosing areas:
     *
     *   is_in(<lat>,<lng>)->.a
     *
     * and then return the union of the following sets:
     *
     *   relation(pivot.a)
     *   way(pivot.a)
     *
     * In both cases we then ask to retrieve tags and the geometry
     * for each object.
     */
    function queryOverpass(lat, lng) {
        var latlng = L.latLng(lat, lng).wrap(),
            bounds = map.getBounds().wrap(),
            bbox = bounds.getSouth() + "," + bounds.getWest() + "," + bounds.getNorth() + "," + bounds.getEast(),
            radius = 10 * Math.pow(1.5, 19 - map.getZoom()),
            around = "around:" + radius + "," + lat + "," + lng,
            nodes = "node(" + around + ")",
            ways = "way(" + around + ")",
            relations = "relation(" + around + ")",
            nearby = "(" + nodes + ";" + ways + ");out tags geom(" + bbox + ");" + relations + ";out geom(" + bbox + ");",
            isin = "is_in(" + lat + "," + lng + ")->.a;way(pivot.a);out tags bb;out ids geom(" + bbox + ");relation(pivot.a);out tags bb;";

        $("#sidebar_content .query-intro")
            .hide();

        if (marker) map.removeLayer(marker);
        marker = L.circle(latlng, radius, featureStyle).addTo(map);

        $(document).everyTime(75, "fadeQueryMarker", function (i) {
            if (i === 10) {
                map.removeLayer(marker);
            } else {
                marker.setStyle({
                    opacity: 1 - i * 0.1,
                    fillOpacity: 0.5 - i * 0.05
                });
            }
        }, 10);

        runQuery(latlng, radius, nearby, $("#query-nearby"), false);
        runQuery(latlng, radius, isin, $("#query-isin"), true, compareSize);
    }

    function clickHandler(e) {
        var precision = OSM.zoomPrecision(map.getZoom()),
            latlng = e.latlng.wrap(),
            lat = latlng.lat.toFixed(precision),
            lng = latlng.lng.toFixed(precision);

        OSM.router.route("/query?lat=" + lat + "&lon=" + lng);
    }

    function enableQueryMode() {
        queryButton.addClass("active");
        map.on("click", clickHandler);
        $(map.getContainer()).addClass("query-active");
    }

    function disableQueryMode() {
        if (marker) map.removeLayer(marker);
        $(map.getContainer()).removeClass("query-active").removeClass("query-disabled");
        map.off("click", clickHandler);
        queryButton.removeClass("active");
    }

    var page = {};

    page.pushstate = page.popstate = function (path) {
        OSM.loadSidebarContent(path, function () {
            page.load(path, true);
        });
    };

    page.load = function (path, noCentre) {
        var params = querystring.parse(path.substring(path.indexOf('?') + 1)),
            latlng = L.latLng(params.lat, params.lon);

        if (!window.location.hash && !noCentre && !map.getBounds().contains(latlng)) {
            OSM.router.withoutMoveListener(function () {
                map.setView(latlng, 15);
            });
        }

        queryOverpass(params.lat, params.lon);
    };

    page.unload = function (sameController) {
        if (!sameController) {
            disableQueryMode();
        }
    };

});