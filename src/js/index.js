import '../styles/index.less';

import 'leaflet-contextmenu'
import 'leaflet.pm'
import 'leaflet-sidebar'

import prepareScWeb from 'common/prepareScWeb'
import Map from 'components/map'

$(document).ready(function () {
    prepareScWeb();
    new Map();
});
