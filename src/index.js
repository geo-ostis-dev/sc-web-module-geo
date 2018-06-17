import "leaflet/dist/leaflet.css";
import "leaflet.pm/dist/leaflet.pm.css";
import "leaflet-sidebar/src/L.Control.Sidebar.css";
import "leaflet-contextmenu/dist/leaflet.contextmenu.css";
import 'leaflet-contextmenu'
import 'leaflet.pm'
import 'leaflet-sidebar'

import {Spinner} from 'spin.js'
window.Spinner = Spinner;

import 'leaflet-spin'

import prepareScWeb from 'middleware/prepareScWeb'

import Api from 'components/api';
import Base from "components/base";
import Map from "components/map";
import SearchButton from "components/searchButton";
import SearchInput from "components/searchInput";
import SearchPanel from "components/searchPanel";

$(document).ready(function () {
    prepareScWeb();

    window.components = {};
    window.components.api = new Api;
    window.components.base = new Base;
    window.components.map = new Map;
    window.components.searchButton = new SearchButton;
    window.components.searchInput = new SearchInput;
    window.components.searchPanel = new SearchPanel;

});
