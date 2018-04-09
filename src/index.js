import $ from 'jquery';
window.$ = $;
import prepareScWeb from './common/prepareScWeb';
import Map from './components/Map/Map';
import SearchButton from './components/SearchButton/SearchButton'
import SearchInput from './components/SearchInput/SearchInput';
import Results from './components/Results/Results';

//TODO: Посчитать объем площадного объекта в рамках какой-то территории. Например: беловежский заповедник, площадь в минском районе столько-то гекторов, а в другом районе столько-то
//TODO: Отобрать по териториальной принадлежности.

$(document).ready(function () {
    prepareScWeb();
    new Map();
    new SearchButton();
    new SearchInput();
    new Results();
});
