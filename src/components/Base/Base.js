function Base() {

    this._initialize = function () {
        if (!this.config) {
            this.config = {};
        }

        if (this.config.require) {
            this.config.require.forEach(function (component) {

            });
        }

        if (!this.config.el) {
            throw new Error("Need to define config.el");
        } else {
            this.el = $(this.config.el);
        }

        this._registerEvents();
    };

    this.render = function (parameters) {
        return fetch('../' + +'.mustache')
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

    // private
    this._registerEvents = function () {
        this.config.events.forEach(function (eventName, handler) {
            this.el.on(eventName, this[handler]);
        });
    };

    this._initialize();
    this.initialize();
}