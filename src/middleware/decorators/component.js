function component(value) {
    return function decorator(target) {
        target.isTestable = value;
    }
}

export default component;
