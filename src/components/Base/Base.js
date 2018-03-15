function Base() {

    this._initialize = function () {
        // Define config
        if (!this.config) {
            this.config = {};
        }

        // Create 
        if (!this.config.el) {
            throw new Error("Need to define config.el in: " + this);
        } else {
            this.el = $(this.config.el);
        }

        //
        if (this.config.include) {
            this.config.include.forEach(function (component) {

            });
        }


        this._registerComponent();
        this._registerEvents();
    };

    this.render = function (parameters) {
        return fetch('./' + +'.mustache')
            .then(function (response) {
                return response.text();
            })
            .then(function (template) {
                return Mustache.render(template, parameters);
            })
            .then(function (page) {
                this.el.html(page);
            });
    };

    // Private methods
    this._registerEvents = function () {
        if (this.config.events) {
            for (var key in this.config.events) {
                this.el.on(key, this[this.config.events[key]])
            }
        }
    };

    this._registerComponent = function () {

    };

    this._initialize();
    if (this.initialize) {
        this.initialize();
    }
}