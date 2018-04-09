import Mustache from 'mustache';

export default class Base {

    // this.config need to define in child class
    constructor(config) {
        this.config = config || {};

        // Define components
        if (!window.components) {
            window.components = {};
        }

        if (!this.config.el) throw new Error("Need to define config.el in: " + this);
        this.el = $(this.config.el);

        if (this.config.events) this._registerEvents();
        this._registerComponent();
        if (this.config.include) this._includeComponents();
        this._registerEvents();
    }

    getName() {
        let funcNameRegex = /function (.{1,})\(/;
        let results = (funcNameRegex).exec((this).constructor.toString());

        return (results && results.length > 1) ? results[1] : "";
    }

    render(parameters) {
        let self = this;

        return fetch('./components/' + self.getName() + '/' + self.getName() + '.mustache')
            .then(function (response) {
                return response.text();
            })
            .then(function (template) {
                return Mustache.render(template, parameters);
            })
            .then(function (page) {
                self.el.html(page);
            });
    }

    _registerEvents() {
        for (let key in this.config.events) {
            this.el.on(key, this[this.config.events[key]].bind(this))
        }
    }

    _registerComponent() {
        if (!window.components[this.getName()]) {
            window.components[this.getName()] = this;
        }
    };

    _includeComponents() {
        let self = this;

        for (let componentNameLocal in self.config.include) {
            function componentNameStore() {
                let componentName = self.config.include[componentNameLocal];

                return () => window.components[componentName];
            }

            Object.defineProperty(self, componentNameLocal, {
                get: componentNameStore()
            });
        }
    }
}
