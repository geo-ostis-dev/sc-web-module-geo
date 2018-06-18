import './searchInput.less'
import {first, values, trim, replace} from 'lodash';

class SearchInput {
    $el = $("#search-input");
    $suggestions = $("#suggestions");
    map = window.components.map;
    api = window.components.api;

    constructor() {
        this.$el.on('input', (event) => {
            let inputText = trim(replace(event.target.value, /[^a-zA-Zа-яА-Я0-9]+/g, ' '));

            fetch(this.api.nominatim({query: inputText, limit: 5}))
                .then((result) => result.json())
                .then((result) => {
                    let suggestions = result.map((element) => element['display_name']);
                    this.$suggestions.empty();
                    this.addSuggestions(suggestions);
                });
        });

        this.$el.on('change', (event) => {
            let inputText = event.target.value,
                nominatimQuery = this.api.nominatim({query: inputText, geojson: 1, address: 1, extra: 1});

            fetch(nominatimQuery)
                .then((nominatimResult) => nominatimResult.json())
                .then((nominatimJSON) => {
                    this._nominatimInfo = first(nominatimJSON);
                    let wiki_id = this._nominatimInfo['extratags']['wikidata'];

                    return wiki_id ? fetch(this.api.wikidata({ids: wiki_id})) : false;
                })
                .then((wikiResult) => wikiResult ? wikiResult.json() : false)
                .then((wikiJSON) => {
                    let geoJson = this._nominatimInfo['geojson'],
                        layerGroup = L.geoJson(geoJson, {
                            contextmenu: true,
                            bubblingMouseEvents: false,
                            contextmenuInheritItems: false,
                            nominatimInfo: this._nominatimInfo,
                            wikiInfo: wikiJSON ? first(values(wikiJSON.entities)) : null,
                            contextmenuItems: [{
                                text: 'Показать пространственную информацию',
                                callback: this.map.eventShowLayerInfo.bind(this.map)
                            }]
                        }),
                        layer = first(layerGroup.getLayers());

                    this.map.addLayer(layer, {search: true});
                    this.map.el.fitBounds(layer.getBounds());

                    layer.on('click', this.map.eventLayerSelect.bind(this.map));
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
