import Base from '../Base/Base.js';
import {MAP} from '../../common/Constants';
import querystring from 'querystring';
import LMap from './LComponents/LMap';

export default class Map extends Base {
    constructor() {
        super({
            el: ".map-wrapper"
        });

        // this.layerGroup = null;

        this.map = new LMap("map", {
            zoomControl: false,
            layerControl: false,
            contextmenu: true
        });


        L.tileLayer(MAP.DEFAULT_TILE_URL, {
            noWrap: true, // otherwise we end up with click coordinates like latitude -728
            attribution: (null)
        }).addTo(this.map);

        this.map.setView([MAP.DEFAULT_LAT, MAP.DEFAULT_LON], MAP.DEFAULT_ZOOM);

        // this.layerGroup = new L.layerGroup().addTo(this.map);
        //
        // let params = Map.mapParams();
        //
        // this.map.attributionControl.setPrefix('');
        //
        // this.map.updateLayers(params.layers);
        //
        // this.map.on("baselayerchange", function (e) {
        //     if (this.map.getZoom() > e.layer.options.maxZoom) {
        //         this.map.setView(this.map.getCenter(), e.layer.options.maxZoom, {reset: true});
        //     }
        // });
        //
        // let position = $('html').attr('dir') === 'rtl' ? 'topleft' : 'topright';
        //
        // L.OSM.zoom({position: position})
        //     .addTo(map);
        //
        // let locate = L.control.locate({
        //     position: position,
        //     icon: 'icon geolocate',
        //     iconLoading: 'icon geolocate',
        //     strings: {
        //         title: 'javascripts.map.locate.title',
        //         popup: 'javascripts.map.locate.popup'
        //     }
        // }).addTo(map);
        //
        // let locateContainer = locate.getContainer();
        //
        // $(locateContainer)
        //     .removeClass('leaflet-control-locate leaflet-bar')
        //     .addClass('control-locate')
        //     .children("a")
        //     .attr('href', '#')
        //     .removeClass('leaflet-bar-part leaflet-bar-part-single')
        //     .addClass('control-button');
        //
        // let sidebar = L.OSM.sidebar('#map-ui')
        //     .addTo(map);
        //
        // L.OSM.layers({
        //     position: position,
        //     layers: map.baseLayers,
        //     sidebar: sidebar
        // }).addTo(map);
        //
        // L.OSM.key({
        //     position: position,
        //     sidebar: sidebar
        // }).addTo(map);
        //
        // L.OSM.share({
        //     position: position,
        //     sidebar: sidebar,
        //     short: true
        // }).addTo(map);
        //
        // L.OSM.note({
        //     position: position,
        //     sidebar: sidebar
        // }).addTo(map);
        //
        // L.OSM.query({
        //     position: position,
        //     sidebar: sidebar
        // }).addTo(map);
        //
        // L.control.scale()
        //     .addTo(map);
        //
        // OSM.initializeContextMenu(map);
        //
        // if (MAP.STATUS !== 'api_offline' && MAP.STATUS !== 'database_offline') {
        //     OSM.initializeNotes(map);
        //     if (params.layers.indexOf(map.noteLayer.options.code) >= 0) {
        //         map.addLayer(map.noteLayer);
        //     }
        //
        //     OSM.initializeBrowse(map);
        //     if (params.layers.indexOf(map.dataLayer.options.code) >= 0) {
        //         map.addLayer(map.dataLayer);
        //     }
        //
        //     if (params.layers.indexOf(map.gpsLayer.options.code) >= 0) {
        //         map.addLayer(map.gpsLayer);
        //     }
        // }
        //
        // let placement = $('html').attr('dir') === 'rtl' ? 'right' : 'left';
        // $('.leaflet-control .control-button').tooltip({placement: placement, container: 'body'});
        //
        // let expiry = new Date();
        // expiry.setYear(expiry.getFullYear() + 10);
        //
        // map.on('moveend layeradd layerremove', function () {
        //     updateLinks(
        //         map.getCenter().wrap(),
        //         map.getZoom(),
        //         map.getLayersCode(),
        //         map._object);
        //
        //     $.removeCookie('_osm_location');
        //     $.cookie('_osm_location', OSM.locationCookie(map), {expires: expiry, path: '/'});
        // });
        //
        // if ($.cookie('_osm_welcome') === 'hide') {
        //     $('.welcome').hide();
        // }
        //
        // $('.welcome .close-wrap').on('click', function () {
        //     $('.welcome').hide();
        //     $.cookie('_osm_welcome', 'hide', {expires: expiry, path: '/'});
        // });
        //
        // let bannerExpiry = new Date();
        // bannerExpiry.setYear(bannerExpiry.getFullYear() + 1);
        //
        // $('#banner .close-wrap').on('click', function (e) {
        //     let cookieId = e.target.id;
        //     $('#banner').hide();
        //     e.preventDefault();
        //     if (cookieId) {
        //         $.cookie(cookieId, 'hide', {expires: bannerExpiry, path: '/'});
        //     }
        // });
        //
        // if (MAP.PIWIK) {
        //     map.on('layeradd', function (e) {
        //         if (e.layer.options) {
        //             let goal = MAP.PIWIK.goals[e.layer.options.keyid];
        //
        //             if (goal) {
        //                 $('body').trigger('piwikgoal', goal);
        //             }
        //         }
        //     });
        // }
        //
        // if (params.bounds) {
        //     map.fitBounds(params.bounds);
        // } else {
        //     map.setView([params.lat, params.lon], params.zoom);
        // }
        //
        // if (params.marker) {
        //     L.marker([params.mlat, params.mlon]).addTo(map);
        // }
        //
        // $("#homeanchor").on("click", function (e) {
        //     e.preventDefault();
        //
        //     let data = $(this).data(),
        //         center = L.latLng(data.lat, data.lon);
        //
        //     map.setView(center, data.zoom);
        //     L.marker(center, {icon: OSM.getUserIcon()}).addTo(map);
        // });
        //
        // function remoteEditHandler(bbox, object) {
        //     let loaded = false,
        //         url = "http://127.0.0.1:8111/load_and_zoom?",
        //         query = {
        //             left: bbox.getWest() - 0.0001,
        //             top: bbox.getNorth() + 0.0001,
        //             right: bbox.getEast() + 0.0001,
        //             bottom: bbox.getSouth() - 0.0001
        //         };
        //
        //     if (object) query.select = object.type + object.id;
        //
        //     let iframe = $('<iframe>')
        //         .hide()
        //         .appendTo('body')
        //         .attr("src", url + querystring.stringify(query))
        //         .on('load', function () {
        //             $(this).remove();
        //             loaded = true;
        //         });
        //
        //     setTimeout(function () {
        //         if (!loaded) {
        //             alert('site.index.remote_failed');
        //             iframe.remove();
        //         }
        //     }, 1000);
        //
        //     return false;
        // }
        //
        // $("a[data-editor=remote]").click(function (e) {
        //     let params = Map.mapParams(this.search);
        //     remoteEditHandler(map.getBounds(), params.object);
        //     e.preventDefault();
        // });
        //
        // if (Map.params().edit_help) {
        //     $('#editanchor')
        //         .removeAttr('title')
        //         .tooltip({
        //             placement: 'bottom',
        //             title: 'javascripts.edit_help'
        //         })
        //         .tooltip('show');
        //
        //     $('body').one('click', function () {
        //         $('#editanchor').tooltip('hide');
        //     });
        // }
        //
        // OSM.Index = function (map) {
        //     let page = {};
        //
        //     page.pushstate = page.popstate = function () {
        //         map.setSidebarOverlaid(true);
        //         document.title = I18n.t('layouts.project_name.title');
        //     };
        //
        //     page.load = function () {
        //         let params = querystring.parse(location.search.substring(1));
        //         if (params.query) {
        //             $("#sidebar .search_form input[name=query]").value(params.query);
        //         }
        //         if (!("autofocus" in document.createElement("input"))) {
        //             $("#sidebar .search_form input[name=query]").focus();
        //         }
        //         return map.getState();
        //     };
        //
        //     return page;
        // };
        //
        // OSM.Browse = function (map, type) {
        //     let page = {};
        //
        //     page.pushstate = page.popstate = function (path, id) {
        //         this.loadSidebarContent(path, function () {
        //             addObject(type, id);
        //         });
        //     };
        //
        //     page.load = function (path, id) {
        //         addObject(type, id, true);
        //     };
        //
        //     function addObject(type, id, center) {
        //         map.addObject({type: type, id: parseInt(id)}, function (bounds) {
        //             if (!window.location.hash && bounds.isValid() &&
        //                 (center || !map.getBounds().contains(bounds))) {
        //                 OSM.router.withoutMoveListener(function () {
        //                     map.fitBounds(bounds);
        //                 });
        //             }
        //         });
        //     }
        //
        //     page.unload = function () {
        //         map.removeObject();
        //     };
        //
        //     return page;
        // };
        //
        // let history = OSM.History(map);
        //
        // OSM.router = OSM.Router(map, {
        //     "/": OSM.Index(map),
        //     "/search": OSM.Search(map),
        //     "/directions": OSM.Directions(map),
        //     "/export": OSM.Export(map),
        //     "/note/new": OSM.NewNote(map),
        //     "/history/friends": history,
        //     "/history/nearby": history,
        //     "/history": history,
        //     "/user/:display_name/history": history,
        //     "/note/:id": OSM.Note(map),
        //     "/node/:id(/history)": OSM.Browse(map, 'node'),
        //     "/way/:id(/history)": OSM.Browse(map, 'way'),
        //     "/relation/:id(/history)": OSM.Browse(map, 'relation'),
        //     "/changeset/:id": OSM.Changeset(map),
        //     "/query": OSM.Query(map)
        // });
        //
        // if (OSM.preferred_editor === "remote" && document.location.pathname === "/edit") {
        //     remoteEditHandler(map.getBounds(), params.object);
        //     OSM.router.setCurrentPath("/");
        // }
        //
        // OSM.router.load();
        //
        // $(document).on("click", "a", function (e) {
        //     if (e.isDefaultPrevented() || e.isPropagationStopped())
        //         return;
        //
        //     // Open links in a new tab as normal.
        //     if (e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        //         return;
        //
        //     // Ignore cross-protocol and cross-origin links.
        //     if (location.protocol !== this.protocol || location.host !== this.host)
        //         return;
        //
        //     if (OSM.router.route(this.pathname + this.search + this.hash))
        //         e.preventDefault();
        // });
    }

    loadSidebarContent(path, callback) {
        this.map.setSidebarOverlaid(false);

        clearTimeout(loaderTimeout);

        let loaderTimeout = setTimeout(function () {
            $('#sidebar_loader').show();
        }, 200);

        // IE<10 doesn't respect Vary: X-Requested-With header, so
        // prevent caching the XHR response as a full-page URL.
        if (path.indexOf('?') >= 0) {
            path += '&xhr=1';
        } else {
            path += '?xhr=1';
        }

        $('#sidebar_content')
            .empty();

        $.ajax({
            url: path,
            dataType: "html",
            complete: function (xhr) {
                clearTimeout(loaderTimeout);
                $('#flash').empty();
                $('#sidebar_loader').hide();

                let content = $(xhr.responseText);

                if (xhr.getResponseHeader('X-Page-Title')) {
                    let title = xhr.getResponseHeader('X-Page-Title');
                    document.title = decodeURIComponent(title);
                }

                $('head')
                    .find('link[type="application/atom+xml"]')
                    .remove();

                $('head')
                    .append(content.filter('link[type="application/atom+xml"]'));

                $('#sidebar_content').html(content.not('link[type="application/atom+xml"]'));

                if (callback) {
                    callback();
                }
            }
        });
    }

    highlight_result(nominatim_results, position, bool_focus) {
        let result = nominatim_results[position];
        if (!result) return;

        let result_el = this.get_result_element(position);

        $('.result').removeClass('highlight');
        result_el.addClass('highlight');

        this.layerGroup.clearLayers();

        if (result.boundingbox) {
            let bounds = [[result.boundingbox[0] * 1, result.boundingbox[2] * 1], [result.boundingbox[1] * 1, result.boundingbox[3] * 1]];
            this.map.fitBounds(bounds);

            if (result.geojson.type && result.geojson.type.match(/(Polygon)|(Line)/)) {

                let geojson_layer = L.geoJson(
                    this.parse_and_normalize_geojson_string(result.geojson),
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
                // let layer = L.rectangle(bounds, {color: "#ff7800", weight: 1} );
                // layerGroup.addLayer(layer);
            }
        }
        else {
            let result_coord = L.latLng(result.lat, result.lon);
            if (result_coord) {
                this.map.panTo(result_coord, result.zoom || nominatim_map_init.zoom);

            }
        }

        if (bool_focus) {
            $('#mapElement').focus();
        }
    }

    static get_result_element(position) {
        return $('.result').eq(position);
    }

    static marker_for_result(result) {
        return L.marker([result.lat, result.lon], {riseOnHover: true, title: result.name});
    }

    static circle_for_result(result) {
        return L.circleMarker([result.lat, result.lon], {
            radius: 10,
            weight: 2,
            fillColor: '#ff7800',
            color: 'blue',
            opacity: 0.75
        });
    }

    static parse_and_normalize_geojson_string(raw_string) {
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

    static apiUrl(object) {
        let url = "/api/" + MAP.API_VERSION + "/" + object.type + "/" + object.id;

        if (object.type === "way" || object.type === "relation") {
            url += "/full";
        } else if (object.version) {
            url += "/" + object.version;
        }

        return url;
    }

    static params(search) {
        let params = {};

        search = (search || window.location.search).replace('?', '').split(/&|;/);

        for (let i = 0; i < search.length; ++i) {
            let pair = search[i],
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
    }

    static mapParams(search) {
        let params = Map.params(search), mapParams = {}, loc, match;

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

        let hash = Map.parseHash(location.hash);

        // Decide on a map starting position. Various ways of doing this.
        if (hash.center) {
            mapParams.lon = hash.center.lng;
            mapParams.lat = hash.center.lat;
            mapParams.zoom = hash.zoom;
        } else if (params.bbox) {
            let bbox = params.bbox.split(',');
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

        let scale = parseFloat(params.scale);
        if (scale > 0) {
            mapParams.zoom = Math.log(360.0 / (scale * 512.0)) / Math.log(2.0);
        }

        return mapParams;
    }

    static parseHash(hash) {
        let args = {};

        let i = hash.indexOf('#');
        if (i < 0) {
            return args;
        }

        hash = querystring.parse(hash.substr(i + 1));

        let map = (hash.map || '').split('/'),
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
    }

    static formatHash(args) {
        let center, zoom, layers;

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

        let precision = OSM.zoomPrecision(zoom),
            hash = '#map=' + zoom +
                '/' + center.lat.toFixed(precision) +
                '/' + center.lng.toFixed(precision);

        if (layers) {
            hash += '&layers=' + layers;
        }

        return hash;
    }

    static zoomPrecision(zoom) {
        return Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
    }

    static locationCookie(map) {
        let center = map.getCenter().wrap(),
            zoom = map.getZoom(),
            precision = OSM.zoomPrecision(zoom);

        return [center.lng.toFixed(precision), center.lat.toFixed(precision), zoom, map.getLayersCode()].join('|');
    }

    static distance(latlng1, latlng2) {
        let lat1 = latlng1.lat * Math.PI / 180,
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

    static getUserIcon(url) {
        return L.icon({
            iconUrl: url || MAP.MARKER_RED,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: MAP.MARKER_SHADOW,
            shadowSize: [41, 41]
        });
    };
}
