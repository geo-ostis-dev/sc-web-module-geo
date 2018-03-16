function Base() {
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

    this._initialize = function () {
        // Define config
        if (!this.config) {
            this.config = {};
        }

        //Define components
        // if (!window.components) {
        //     window.components = {};
        // }

        // Create element
        if (!this.config.el) {
            throw new Error("Need to define config.el in: " + this);
        } else {
            this.el = $(this.config.el);
        }

        // if (this.config.include) {
        //     this.config.include.forEach(function (component) {
        //
        //     });
        // }
    };

    this._registerEvents = function () {
        if (this.config.events) {
            for (var key in this.config.events) {
                this.el.on(key, this[this.config.events[key]])
            }
        }
    };

    this._registerComponent = function () {
        debugger;
        if (!window.components[this.getName()]) {
            window.components[this.getName()] = this;
        }
    };

    this._includeComponents = function () {
        if (this.config.include) {
            for (var localComponentName in this.config.include) {
                debugger;
                var componentName = this.config.include[localComponentName];

                if (!window.components[componentName]) {
                    window.components[componentName] = null;
                }

                this[localComponentName] = window.components[componentName];
            }
        }
    };

    // Initialize component
    this._initialize();
    // this._registerComponent();
    //this._includeComponents();
    // this._registerEvents();

    if (this.initialize) {
        this.initialize();
    }
}
