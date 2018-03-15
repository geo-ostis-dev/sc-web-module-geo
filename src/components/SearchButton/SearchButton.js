function SearchButton() {

    this.config = {
        include: [
            SearchButton
        ],
        el: '.search-panel .search-button',
        events: {
            click: 'addResultsToSidebar'
        }
    };

    this.addResultsToSidebar = function () {
        fetch('https://nominatim.openstreetmap.org/search.php?q=' + dom.searchInput.val + '&polygon_geojson=1&format=json')
            .then(function (result) {
                return result.json();
            })
            .then(function (json) {
                mapElement.highlight_result(json, 0, true);
                return json;
            })
            .then(function (json) {
                return template('search', json);
            })
            .then(function (page) {
                $(".sidebar").html(page);
            });
    };

    Base.apply(this, arguments);
}
