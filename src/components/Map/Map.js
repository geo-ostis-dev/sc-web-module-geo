import {MAP} from '../../common/Constants';
import L from '../../external/leaflet/leaflet-src';
import '../../external/leaflet.pm/leaflet.pm.min';
import Base from '../Base/Base.js';
import '../../external/leaflet.sidebar/leaflet.sidebar';
import '../../external/leaflet.contextmenu/leaflet.contextmenu';

export default class Map extends Base {
    constructor() {
        super({
            el: ".map-wrapper"
        });

        L.Icon.Default.imagePath = '../assets/images/';

        this.map = L.map('map', {
            contextmenu: true,
            contextmenuWidth: 140,
            contextmenuItems: [{
                text: 'Show coordinates',
                callback: showCoordinates
            }, {
                text: 'Center map here',
                callback: centerMap
            }, '-', {
                text: 'Zoom in',
                icon: 'images/zoom-in.png',
                callback: zoomIn
            }, {
                text: 'Zoom out',
                icon: 'images/zoom-out.png',
                callback: zoomOut
            }]
        }).setView([51.505, -0.09], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        // define toolbar options
        let options = {
            position: 'topleft', // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
            drawMarker: true, // adds button to draw markers
            drawPolyline: true, // adds button to draw a polyline
            drawRectangle: true, // adds button to draw a rectangle
            drawPolygon: true, // adds button to draw a polygon
            drawCircle: true, // adds button to draw a cricle
            cutPolygon: true, // adds button to cut a hole in a polygon
            editMode: true, // adds button to toggle edit mode for all layers
            removalMode: true, // adds a button to remove layers
        };

        // add leaflet.pm controls to the map
        this.map.pm.addControls(options);

        // make markers not snappable during marker draw
        this.map.pm.enableDraw('Marker', {snappable: false});
        this.map.pm.disableDraw('Marker');

        // let polygons finish their shape on double click
        this.map.pm.enableDraw('Poly', {finishOn: 'dblclick'});
        this.map.pm.disableDraw('Poly');

        this.sidebar = L.control.sidebar('sidebar', {
            position: 'right'
        });

        this.map.addControl(this.sidebar);

        this.map.on('click', () => {
            this.sidebar.toggle();
        })
    }
}