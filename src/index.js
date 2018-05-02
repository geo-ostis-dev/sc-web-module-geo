import "leaflet/dist/leaflet.css";
import "leaflet.pm/dist/leaflet.pm.css";
import "leaflet-sidebar/src/L.Control.Sidebar.css";
import "leaflet-contextmenu/dist/leaflet.contextmenu.css";
import 'leaflet-contextmenu'
import 'leaflet.pm'
import 'leaflet-sidebar'

import prepareScWeb from 'middleware/prepareScWeb'

import Base from "components/base";
import Map from "components/map";
import SearchButton from "components/searchButton";
import SearchInput from "components/searchInput";
import "components/searchPanel";

$(document).ready(function () {
    prepareScWeb();
    new Base;
    new Map;
    new SearchButton;
    new SearchInput;
});
