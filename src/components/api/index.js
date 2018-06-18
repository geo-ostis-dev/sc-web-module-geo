import {get} from "lodash";
import md5 from 'md5';

class Api {
    nominatimHost = 'https://nominatim.openstreetmap.org';
    wikidataHost = 'https://www.wikidata.org';
    nominatimQueryCount = 0;
    wikidataQueryCount = 0;

    nominatim(params = {}) {
        this.nominatimQueryCount += 1;

        let path = params['path'] || 'search',
            lat = params['lat'] || '53.911634807198',
            lon = params['long'] || '27.595837043533',
            zoom = params['zoom'] || '',
            query = params['query'] || 'Минск',
            limit = params['limit'] || 1,
            geojson = params['geojson'] || 0,
            address = params['address'] || 0,
            extra = params['extra'] || 0;

        let general_params = `polygon_geojson=${geojson}&addressdetails=${address}&extratags=${extra}&limit=${limit}&format=jsonv2`;

        switch (path) {
            case 'reverse':
                return `${this.nominatimHost}/reverse?zoom=${zoom}&lat=${lat}&lon=${lon}&${general_params}`;
            case 'search':
                return `${this.nominatimHost}/search.php?q=${query}&${general_params}`
        }
    }

    wikidata(params = {}) {
        this.wikidataQueryCount += 1;

        let path = params['path'] || 'api',
            ids = params['ids'] || '';

        switch (path) {
            case 'api':
                return `${this.wikidataHost}/wiki/Special:EntityData/${ids}.json`;
        }
    }

    getWikiImages(wikiInfo) {
        return get(wikiInfo, 'claims.P18', []).map((imageObject) => {
            let image = get(imageObject, 'mainsnak.datavalue.value').split(' ').join('_'),
                md5Hash = md5(image);

            return {
                src: `https://upload.wikimedia.org/wikipedia/commons/${md5Hash[0]}/${md5Hash[0]}${md5Hash[1]}/${image}`,
                href: `https://commons.wikimedia.org/wiki/File:${image}`
            }
        });
    }

    getWikiWebsite(wikiInfo) {
        return get(wikiInfo, 'claims.P856[0].mainsnak.datavalue.value');
    }

    getWikiFlagImage(wikiInfo) {
        let imageValue = get(wikiInfo, 'claims.P41[0].mainsnak.datavalue.value');
        if (!imageValue) return null;

        let image = imageValue.split(' ').join('_'),
            md5Hash = md5(image);

        return {
            src: `https://upload.wikimedia.org/wikipedia/commons/${md5Hash[0]}/${md5Hash[0]}${md5Hash[1]}/${image}`,
            href: `https://commons.wikimedia.org/wiki/File:${image}`
        }
    }

    getWikiPostalCode(wikiInfo) {
        return get(wikiInfo, 'claims.P281[0].mainsnak.datavalue.value');
    }

    getWikiCoord(wikiInfo) {
        let lat = +get(wikiInfo, 'claims.P625[0].mainsnak.datavalue.value.latitude'),
            long = +get(wikiInfo, 'claims.P625[0].mainsnak.datavalue.value.longitude');

        return {
            lat: Math.round(lat * 1000) / 1000,
            long: Math.round(long * 1000) / 1000
        }
    }

    getWikiRuLink(wikiInfo) {
        return get(wikiInfo,'sitelinks.ruwiki.url');
    }

}

export default Api;