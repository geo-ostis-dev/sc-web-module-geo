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
}

export default Api;