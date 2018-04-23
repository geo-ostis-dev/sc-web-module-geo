// import natureMonuments from './json/natureMonuments'
// import component from './common/decorators/component'
//
// @component()
class Map {
    constructor() {
        debugger;
        this.map = L.map('map', {
            contextmenu: true,
            contextmenuWidth: 200
        }).setView([51.505, -0.09], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        this.map.on("mousedown", (e) => {
            if (e.originalEvent.shiftKey) {
                this.map.contextmenu.disable();
            } else {
                this.map.contextmenu.enable();
            }
        });

        // Sidebar
        this.sidebar = L.control.sidebar('sidebar', {position: 'right'});
        this.map.addControl(this.sidebar);

        //define toolbar options
        let options = {
            position: 'topleft', // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
            drawMarker: true, // adds button to draw markers
            drawPolyline: true, // adds button to draw a polyline
            drawRectangle: true, // adds button to draw a rectangle
            drawPolygon: true, // adds button to draw a polygon
            drawCircle: true, // adds button to draw a cricle
            editMode: true, // adds button to toggle edit mode for all layers
            removalMode: true, // adds a button to remove layers
        };

        // add leaflet.pm controls to the map
        this.map.pm.addControls(options);

        this.map.on('pm:create', (event) => {
            let layer = event.layer;

            layer.options.shape = event.shape;

            layer.bindContextMenu({
                contextmenu: true,
                contextmenuItems: [{
                    text: 'Найти санатории'
                },
                    {
                        text: 'Найти достопримечательности'
                    }]
            });

            layer.on('click', (layer) => {
                let targetOptions = layer.target.options,
                    target = layer.target;

                targetOptions.active = !targetOptions.active;

                if (targetOptions.active) {
                    target.setStyle({fillColor: 'red'});
                    target.addContextMenuItem({
                        text: 'Включение',
                        index: 100,
                        callback: this.shapeInclusion.bind(this)
                    });
                    target.addContextMenuItem({
                        text: 'Пересечение',
                        index: 200,
                        callback: this.shapeIntersection.bind(this)
                    });
                } else {
                    target.setStyle({fillColor: 'blue'});
                    target.removeContextMenuItemWithIndex(100);
                    target.removeContextMenuItemWithIndex(200);
                }
            });
        });

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

    shapeInclusion() {
        let activeLayers = _.filter(_.toArray(this.map._renderer._layers), 'options.active');

        let results = [];

        for (let i = 0; i < activeLayers.length; i++) {
            for (let j = 0; j < activeLayers.length; j++) {
                if (i === j) continue;
                let layer1 = activeLayers[i]._latlngs[0].map((a) => [a['lat'], a['lng']]);
                layer1.push(layer1[0]);
                let layer2 = activeLayers[j]._latlngs[0].map((a) => [a['lat'], a['lng']]);
                layer2.push(layer2[0]);

                let poligon1 = turf.polygon([layer1]);
                let poligon2 = turf.polygon([layer2]);

                let solution1 = turf.booleanContains(poligon1, poligon2) ? 'включает' : 'не включает';
                let solution2 = turf.booleanContains(poligon2, poligon1) ? 'включает' : 'не включает';

                results.push(`${activeLayers[i].options.shape} ${solution1} ${activeLayers[j].options.shape}`);
                results.push(`${activeLayers[j].options.shape} ${solution2} ${activeLayers[i].options.shape}`);
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
                let layer1 = activeLayers[i]._latlngs[0].map((a) => [a['lat'], a['lng']]);
                layer1.push(layer1[0]);
                let layer2 = activeLayers[j]._latlngs[0].map((a) => [a['lat'], a['lng']]);
                layer2.push(layer2[0]);

                let poligon1 = turf.polygon([layer1]);
                let poligon2 = turf.polygon([layer2]);

                let solution1 = turf.booleanCrosses(poligon1, poligon2) ? 'пересекает' : 'не пересекает';
                let solution2 = turf.booleanCrosses(poligon2, poligon1) ? 'пересекает' : 'не пересекает';

                results.push(`${activeLayers[i].options.shape} ${solution1} ${activeLayers[j].options.shape}`);
                results.push(`${activeLayers[j].options.shape} ${solution2} ${activeLayers[i].options.shape}`);
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

}

export default Map;
