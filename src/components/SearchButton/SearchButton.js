function SearchButton() {

    this.config = {
        include: {
            searchInput: "SearchInput",
            map: "Map"
        },
        el: '.search-panel .search-button',
        events: {
            click: 'addResultsToSidebar'
        }
    };

    this.addResultsToSidebar = function () {
        fetch('https://nominatim.openstreetmap.org/search.php?q=' + this.searchInput.val + '&polygon_geojson=1&format=json')
            .then(function (result) {
                return result.json();
            })
            .then(function (json) {
                this.map.highlight_result(json, 0, true);
                return json;
            })
            .then(function (json) {
                return this.map('search', json);
            })
            .then(function (page) {
                $(".sidebar").html(page);
            });
    };

    Base.apply(this, arguments);
}
