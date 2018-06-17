import './searchInput.less'
import {first} from "lodash";

class SearchInput {
    constructor() {
        this.$el = $("#search-input");
        this.$suggestions = $("#suggestions");

        this.$el.on('input', (event) => {
            let inputText = event.target.value;
            inputText = _.trim(_.replace(inputText, /[^a-zA-Zа-яА-Я0-9]+/g, ' '));

            fetch(`https://nominatim.openstreetmap.org/search.php?q=${inputText}&format=jsonv2&limit=5`)
                .then((result) => result.json())
                .then((result) => {
                    let suggestions = result.map((element) => element['display_name']);
                    this.$suggestions.empty();
                    this.addSuggestions(suggestions);
                });
        });

        this.$el.on('change', (event) => {
            let inputText = event.target.value;
            fetch(`https://nominatim.openstreetmap.org/search.php?q=${inputText}&polygon_geojson=1&format=jsonv2&limit=1&&addressdetails=1`)
                .then((result) => result.json())
                .then((result) => {
                    let layer = _.first(L.geoJson(_.first(result)['geojson'], {
                            contextmenu: true,
                            bubblingMouseEvents: false,
                            contextmenuInheritItems: false,
                            osm: _.first(result),
                            contextmenuItems: [{
                                text: 'Показать пространственную информацию',
                                callback: window.components.map.eventShowLayerInfo.bind(this)
                            }]
                        }).getLayers());

                    let map = window.components.map;
                    map.addLayer(layer, {search: true});
                    map.el.fitBounds(layer.getBounds());

                    layer.on('click', map.eventLayerSelect.bind(map));
                });
        })
    }

    addSuggestions(suggests) {
        suggests.forEach((suggest) => {
            let $option = $(`<option value="${suggest}">`);

            this.$suggestions.append($option);
        });
    }
}

export default SearchInput
