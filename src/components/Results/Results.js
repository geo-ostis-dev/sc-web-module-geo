function Results() {

    this.config = {
        el: '.sidebar'
    };

    function get_result_element(position) {
        return $('.result').eq(position);
    }

    Base.apply(this, arguments);
}