function Base() {

    this._initialize = function () {
        // Define config
        if (!this.config) {
            this.config = {};
        }

        // Define components
        if (!window.components) {
            window.components = {};
        }

        // Create element
        if (!this.config.el) {
            throw new Error("Need to define config.el in: " + this);
        } else {
            this.el = $(this.config.el);
        }
    };

    this.getName = function () {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec((this).constructor.toString());

        return (results && results.length > 1) ? results[1] : "";
    };

    this.render = function (parameters) {
        var self = this;

        return fetch('./components/' + self.getName() + '/' + self.getName() +'.mustache')
            .then(function (response) {
                return response.text();
            })
            .then(function (template) {
                return Mustache.render(template, parameters);
            })
            .then(function (page) {
                self.el.html(page);
            });
    };

    this._registerEvents = function () {
        if (this.config.events) {
            for (var key in this.config.events) {
                this.el.on(key, this[this.config.events[key]].bind(this))
            }
        }
    };

    this._registerComponent = function () {
        if (!window.components[this.getName()]) {
            window.components[this.getName()] = this;
        }
    };

    this._includeComponents = function () {
        var self = this;

        if (this.config.include) {
            for (var componentNameLocal in self.config.include) {
                function componentNameStore() {
                    var componentName = self.config.include[componentNameLocal];

                    return function () {
                        return window.components[componentName];
                    };
                }

                Object.defineProperty(self, componentNameLocal, {
                    get: componentNameStore()
                });
            }
        }
    };

    // Initialize component
    this._initialize();
    this._registerComponent();
    this._includeComponents();
    this._registerEvents();

    if (this.initialize) {
        this.initialize();
    }
}
