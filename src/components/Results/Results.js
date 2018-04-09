import Base from '../Base/Base';

export default class Results extends Base {

    constructor() {
        super({
            el: '.sidebar'
        });
    }

    static get_result_element(position) {
        return $('.result').eq(position);
    }
}
