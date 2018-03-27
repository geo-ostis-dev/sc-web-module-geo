function SearchButton() {

    this.config = {
        include: {
            searchInput: "SearchInput",
            map: "Map",
            results: "Results"
        },
        el: '.search-panel .search-button',
        events: {
            click: 'addResultsToSidebar'
        }
    };

    this.addResultsToSidebar = function () {
        var self = this;

        fetch('https://nominatim.openstreetmap.org/search.php?q=' + self.searchInput.el.val() + '&polygon_geojson=1&format=json')
            .then(function (result) {
                return result.json();
            })
            .then(function (json) {
                self.map.highlight_result(json, 0, true);
                return json;
            })
            .then(function (json) {
                return self.results.render({results: json});
            })
            .then(function (page) {
                $(".sidebar").html(page);
            });
    };

    Base.apply(this, arguments);
}
