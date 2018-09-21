/*jshint browser:true,curly: false */
/* global L */

import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';

window.onload = () => {
    window.vue = new Vue({
        el: '#app',
        components: {
            Multiselect: window.VueMultiselect.default
        },
        data: {
            credentials: {
                production: {
                    url: 'https://api.mapbox.com/geocoding/v5',
                    key: 'pk.eyJ1IjoibWF0dGZpY2tlIiwiYSI6ImNqNnM2YmFoNzAwcTMzM214NTB1NHdwbnoifQ.Or19S7KmYPHW8YjRz82v6g'
                },
                staging: {
                    url: 'https://api-geocoder-staging.tilestream.net/geocoding/v5',
                    key: false
                },
                map: {
                    key: 'pk.eyJ1Ijoic2JtYTQ0IiwiYSI6ImNpcXNycTNqaTAwMDdmcG5seDBoYjVkZGcifQ.ZVIe6sjh0QGeMsHpBvlsEA'
                },
                debug: {
                    url: 'https://api.mapbox.com/geocoding/v5/tiles',
                    key: '',
                    authed: false
                },
                heyProxy: {
                    url: 'https://hey.mapbox.com/search-playground/geocoding-debug'
                },
            },
            bbox: { type: 'FeatureCollection', features: [] },
            query: '',
            url: '',
            saved: [],
            reverseMarker: false, //Store the GL Click marker for a reverse Geocode
            // Results from forward or reverse geocoding queries
            geocoderResults: { type: 'FeatureCollection', features: [] },
            // Results from querying vector tiles
            vtQueryResults: { type: 'FeatureCollection', features: [] },
            countries: [],
            languages: [
                { code: 'ar', name: 'Arabic' },
                { code: 'az', name: 'Azerbaijani' },
                { code: 'bg', name: 'Bulgarian' },
                { code: 'bn', name: 'Bengali' },
                { code: 'bs', name: 'Bosnian' },
                { code: 'ca', name: 'Catalan' },
                { code: 'cs', name: 'Czech' },
                { code: 'da', name: 'Danish' },
                { code: 'de', name: 'German' },
                { code: 'el', name: 'Greek' },
                { code: 'en', name: 'English' },
                { code: 'es', name: 'Spanish' },
                { code: 'et', name: 'Estonian' },
                { code: 'fa', name: 'Persian' },
                { code: 'fi', name: 'Finnish' },
                { code: 'fr', name: 'French' },
                { code: 'gu', name: 'Gujarati' },
                { code: 'he', name: 'Hebrew' },
                { code: 'hi', name: 'Hindi' },
                { code: 'hr', name: 'Croatian' },
                { code: 'hu', name: 'Hungarian' },
                { code: 'id', name: 'Indonesian' },
                { code: 'is', name: 'Icelandic' },
                { code: 'it', name: 'Italian' },
                { code: 'ja', name: 'Japanese' },
                { code: 'ka', name: 'Georgian' },
                { code: 'kk', name: 'Kazakh' },
                { code: 'kn', name: 'Kannada' },
                { code: 'ko', name: 'Korean' },
                { code: 'lt', name: 'Lithuanian' },
                { code: 'lv', name: 'Latvian' },
                { code: 'mk', name: 'Macedonian' },
                { code: 'mn', name: 'Mongolian' },
                { code: 'ms', name: 'Malay' },
                { code: 'mt', name: 'Maltese' },
                { code: 'nb', name: 'Norwegian Bokmål' },
                { code: 'nl', name: 'Dutch' },
                { code: 'no', name: 'Norwegian' },
                { code: 'pl', name: 'Polish' },
                { code: 'pt', name: 'Portuguese' },
                { code: 'ro', name: 'Romanian' },
                { code: 'ru', name: 'Russian' },
                { code: 'si', name: 'Sinhala' },
                { code: 'sk', name: 'Slovak' },
                { code: 'sl', name: 'Slovenian' },
                { code: 'sq', name: 'Albanian' },
                { code: 'sr', name: 'Serbian' },
                { code: 'sv', name: 'Swedish' },
                { code: 'ta', name: 'Tamil' },
                { code: 'te', name: 'Telugu' },
                { code: 'tg', name: 'Tajik' },
                { code: 'th', name: 'Thai' },
                { code: 'tk', name: 'Turkmen' },
                { code: 'tl', name: 'Tagalog' },
                { code: 'tr', name: 'Turkish' },
                { code: 'uk', name: 'Ukrainian' },
                { code: 'ur', name: 'Urdu' },
                { code: 'uz', name: 'Uzbek' },
                { code: 'vi', name: 'Vietnamese' },
                { code: 'zh', name: 'Chinese' }
            ],
            layers: [],
            defaultCnf: '', //Stores a stringified version of below for resetting to default state
            cnf: {
                url: '',
                index: 'mapbox.places',
                staging: false,
                onCountry: true,
                onType: true,
                onProximity: true,
                onBBOX: true,
                onLimit: true,
                onLanguage: true,
                countries: [],
                proximity: '',
                typeToggle: {
                    'country': false,
                    'region': false,
                    'district': false,
                    'postcode': false,
                    'locality': false,
                    'place': false,
                    'neighborhood': false,
                    'address': false,
                    'poi': false,
                },
                types: [],
                bbox: '',
                limit: '',
                autocomplete: true,
                languages: [],
                languageStrict: false,
                onDebug: false,
                selectedLayer: '',
                debugClick: {}
            },
            buildingBBox: false,
            hostname: location.hostname,
            getlocation: false,
            settingsPanel: true,
            jsonPanel: false,
            searchTime: new Date()
        },
        // Called synchronously after the Vue instance is created https://vuejs.org/v2/api/#created
        created: function() {
            this.defaultCnf = JSON.stringify(this.cnf);

            let saved = localStorage.getItem('saved');
            if (saved) this.saved = JSON.parse(saved);

            // Set state to hashed value
            if (window.location.hash) {
                let cnf = JSON.parse(decodeURIComponent(window.location.hash.substring(1, window.location.hash.length)));
                // Populate the query form separately from other cnf properties
                // query is part of the Vue's data property, not the cnf
                this.query = cnf.query;
                delete cnf.query;

                for (let c in cnf) {
                    this.cnf[c] = cnf[c];
                }
            }
        },
        // Called after the instance has been mounted-- now ready to add map
        mounted: function() {
            this.retrieveToken();

            if (!this.credentials.staging.key && this.hostname === 'hey.mapbox.com') {
                this.retrieveStaging();
            }

            this.$nextTick(function() {
                mapboxgl.accessToken = this.credentials.map.key;
                this.map = new mapboxgl.Map({
                    container: 'map',
                    style: 'mapbox://styles/mapbox/streets-v8',
                    center: [-96, 37.8],
                    zoom: 3
                });
                const bboxDrawModes = MapboxDraw.modes;
                bboxDrawModes.draw_rectangle = DrawRectangle;

                this.draw = new MapboxDraw({
                    modes: bboxDrawModes,
                    defaultMode: 'draw_rectangle',
                    displayControlsDefault: false
                });
                this.map.on('style.load', () => {
                    this.map.addSource('markers', { type: 'geojson', data: this.geocoderResults });
                    this.map.addSource('bbox', { type: 'geojson', data: this.bbox });

                    for (let src of ['selected', 'hovered', 'hovered-bbox', 'debug']) {
                        this.map.addSource(src, { 'type': 'geojson', 'data': { 'type': 'FeatureCollection', 'features': [] } });
                    }

                    this.map.addLayer({ 'id': 'point', 'source': 'markers', 'type': 'circle', 'paint': { 'circle-radius': 10, 'circle-color': '#007cbf' } });
                    this.map.addLayer({ 'id': 'selected', 'source': 'selected', 'type': 'circle', 'paint': { 'circle-radius': 10, 'circle-color': '#990000' } });
                    this.map.addLayer({ 'id': 'hovered', 'source': 'hovered', 'type': 'circle', 'paint': { 'circle-radius': 10, 'circle-color': '#0f9900' } });
                    this.map.addLayer({ 'id': 'hovered-bbox', 'source': 'hovered-bbox', 'type': 'line', 'paint': { 'line-width': 2, 'line-color': '#0f9900' } });
                    this.map.addLayer({ 'id': 'debug', 'source': 'debug', 'type': 'circle', 'paint': { 'circle-radius': 10, 'circle-color': '#000000' } });
                    this.map.addLayer({ 'id': 'bbox', 'source': 'bbox', 'type': 'fill', 'paint': { 'fill-color': '#273d56', 'fill-opacity': 0.5 } });
                });

                this.map.on('load', () => {
                    // Add watch functions that trigger map events
                    // after map has been loaded to avoid GL JS errors
                    // Trigger the watch functions immediately

                    const scale = new mapboxgl.ScaleControl({
                        maxWidth: 58,
                        unit: 'metric'
                    });
                    this.map.addControl(scale);

                    this.$watch('cnf.onDebug', function(val) {
                        this.updateHash();
                        this.toggleTiles();
                        if (val) {
                            if (this.cnf.debugClick.coords && this.cnf.debugClick.coords.length === 2) {
                                this.setMarkers('debug', turf.featureCollection([turf.point(this.cnf.debugClick.coords)]));
                            }
                            for (let src of ['markers', 'selected', 'hovered', 'hovered-bbox']) {
                                this.clearMarkers(src);
                            }
                        } else {
                            this.clearMarkers('debug');
                            this.setMarkers('markers', this.geocoderResults);
                        }
                    }, { immediate: true });

                    this.$watch('cnf.selectedLayer', function() {
                        this.updateHash();
                        this.toggleTiles();
                    }, { immediate: true });

                    this.$watch('cnf.debugClick', function() {
                        this.updateHash();
                        if (this.cnf.debugClick.coords && this.cnf.debugClick.coords.length === 2) {
                            this.setMarkers('debug', turf.featureCollection([turf.point(this.cnf.debugClick.coords)]));
                        }
                        if (this.checkTiles()) {
                            this.queryTiles(this.cnf.debugClick.pixels);
                        }
                    }, { deep: true, immediate: true });

                    this.$watch('geocoderResults.features', function() {
                        this.setMarkers('markers', this.geocoderResults);
                    }, { immediate: true });

                    this.$watch('bbox', function() {
                        this.setMarkers('bbox', this.bbox);
                    }, { immediate: true });

                });

                this.map.on('click', (e) => {
                    if (!this.buildingBBox) {
                        let pt = e.lngLat.wrap();
                        if (this.cnf.onDebug) {
                            this.cnf.debugClick = {
                                coords: [pt.lng, pt.lat],
                                pixels: [e.point.x, e.point.y]
                            }
                        } else if (this.getlocation) {
                            this.cnf.proximity = `${pt.lng},${pt.lat}`;
                            this.getlocation = false;
                        } else {
                            this.query = `${pt.lng},${pt.lat}`;
                        }
                    }
                });
            });
        },
        // watch functions are triggered by user interactions which change values in the `data` property
        watch: {
            saved: function() {
                localStorage.setItem('saved', JSON.stringify(this.saved));
            },
            query: function() { return this.search(); },
            'cnf.staging': function() { return this.search(); },
            'cnf.onCountry': function() { return this.search(); },
            'cnf.countries': function() { return this.search(); },
            'cnf.onType': function() { return this.search(); },
            'cnf.types': function() { return this.search(); },
            'cnf.onProximity': function() { return this.search(); },
            'cnf.proximity': function() { return this.search(); },
            'cnf.onBBOX': function() { return this.search(); },
            'cnf.bbox': function() { return this.search(); },
            'cnf.onLimit': function() { return this.search(); },
            'cnf.limit': function() { return this.search(); },
            'cnf.autocomplete': function() { return this.search(); },
            'cnf.onLanguage': function() { return this.search(); },
            'cnf.languages': function() { return this.search(); },
            'cnf.languageStrict': function() { return this.search(); },
            'cnf.routing': function() { return this.search(); }
        },
        // methods functions perform CRUD operations on the `data` property
        methods: {
            help: function(url = 'https://www.mapbox.com/api-documentation/#search-for-places') {
                window.open(url, '_blank');
            },
            //Parse Settings from a Mapbox API URL
            parseURL: function() {
                const url = new URL(this.cnf.url);

                this.resetCnf();

                const query = decodeURIComponent(url.pathname.replace(/.*\//, '').replace('.json', ''));

                //TODO: This could be simplified by making the cnf props be identical in name
                for (let entry of url.searchParams.entries()) {
                    if (entry[0] === 'proximity') {
                        this.cnf.proximity = entry[1];
                    } else if (entry[0] === 'types') {
                        const types = entry[1].split(',');

                        this.typeClearAll();
                        this.cnf.types = types;
                        for (let type of types) {
                            this.cnf.typeToggle[type] = true;
                        }
                    } else if (entry[0] === 'country') {
                        entry[1].split(',').forEach((country) => {
                            this.cnf.countries.push({
                                name: country.toUpperCase(),
                                code: country
                            });
                        });
                    } else if (entry[0] === 'bbox') {
                        this.cnf.bbox = entry[1];
                    } else if (entry[0] === 'limit') {
                        this.cnf.limit = parseInt(entry[1]);
                    } else if (entry[0] === 'autocomplete') {
                        this.cnf.autocomplete = entry[1] === 'false' ? false : 'true';
                    } else if (entry[0] === 'language') {
                        entry[1].split(',').map((lang) => {
                            return lang.toLowerCase();
                        }).forEach((lang) => {
                            let found_lang;
                            for (let l of this.languages) {
                                if (l.code === lang) found_lang = l;
                            }

                            if (found_lang) {
                                this.cnf.languages.push(found_lang);
                            } else {
                                this.cnf.languages.push({ name: lang, code: lang });
                            }
                        });
                    } else if (entry[0] === 'languageMode' && entry[1] === 'strict') {
                        this.cnf.languageStrict = true;
                    }
                }

                this.query = query;
            },
            //Reset settings to their defalt values
            resetCnf: function() {
                const cnf = JSON.parse(this.defaultCnf);
                for (let key of Object.keys(cnf)) {
                    this.cnf[key] = cnf[key];
                }
            },
            // retrieve temporary token from hey-proxy
            retrieveToken: function() {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', this.credentials.heyProxy.url);
                xhr.onload = () => {
                    if (Math.floor(xhr.status / 100) * 100 !== 200) return console.error(xhr.status, xhr.responseText);
                    this.credentials.debug.key = JSON.parse(xhr.responseText).token;
                    this.credentials.debug.authed = true;
                    // load tile layers
                    this.listTiles();
                }
                xhr.send();
            },
            retrieveStaging: function() {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://hey.mapbox.com/search-playground/credentials');
                xhr.onload = () => {
                    if (Math.floor(xhr.status / 100) * 100 !== 200) return console.error(xhr.status, xhr.responseText);

                    this.credentials.staging = JSON.parse(xhr.responseText).staging;
                }
                xhr.send();
            },
            // List layers for the debug multiselect form
            listTiles: function() {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', `${this.credentials.debug.url}?access_token=${this.credentials.debug.key}`);
                xhr.onload = () => {
                    if (xhr.status !== 200) return console.error(xhr.status, xhr.responseText);
                    this.layers = JSON.parse(xhr.responseText);
                }
                xhr.send();
            },
            setStyle: function(style) {
                this.map.setStyle(style);
            },
            addTiles: function() {
                // have to add the source every time because the vt layer changes
                this.map.addSource('geocoderFeatures', {
                    type: 'vector',
                    tiles: [`${this.credentials.debug.url}/${this.cnf.selectedLayer}/{z}/{x}/{y}.vector.pbf?access_token=${this.credentials.debug.key}`]
                });
                this.map.addLayer({
                    'id': 'pointFeatures',
                    'type': 'circle',
                    'source-layer': 'data',
                    'source': 'geocoderFeatures',
                    "filter": ["==", "$type", "Point"],
                    'metadata': {},
                    'paint': { 'circle-radius': 5, 'circle-color': '#8658C4' }

                }, 'point'); // point vt layers should be underneath other custom map layers
                this.map.addLayer({
                    'id': 'polygonFeatures',
                    'type': 'fill', // circle
                    'source-layer': 'data',
                    'source': 'geocoderFeatures',
                    "filter": ["==", "$type", "Polygon"],
                    'metadata': {},
                    'paint': { 'fill-opacity': 0.35, 'fill-color': '#8658C4', }
                }, 'pointFeatures'); // polygon vt layers should be underneath point vt layers
            },
            removeTiles: function() {
                this.map.removeLayer('pointFeatures');
                this.map.removeLayer('polygonFeatures');
                this.map.removeSource('geocoderFeatures');
            },
            checkTiles: function() {
                return (!!(this.map.getLayer('pointFeatures') && this.map.getLayer('polygonFeatures')));
            },
            toggleTiles: function() {
                this.updateHash();
                if (this.cnf.onDebug) {
                    if (this.cnf.selectedLayer) {
                        if (this.checkTiles()) {
                            this.removeTiles();
                            this.addTiles();
                        } else this.addTiles();
                    } else if (this.checkTiles()) this.removeTiles();
                } else if (this.checkTiles()) this.removeTiles();
            },
            queryTiles: function(pixArr) {
                let features = this.map.queryRenderedFeatures(pixArr, { layers: ['pointFeatures', 'polygonFeatures'] });
                this.vtQueryResults.features.splice(0, this.vtQueryResults.features.length);

                for (let feat of features) {
                    this.vtQueryResults.features.push(feat);
                }
            },
            setMarkers: function(src, data) {
                this.map.getSource(src).setData(data);
            },
            clearMarkers: function(src) {
                this.map.getSource(src).setData({ "type": "FeatureCollection", "features": [] });
            },
            panelManage: function(panel) {
                if (panel == 'settings') {
                    this.settingsPanel = !this.settingsPanel;
                    this.jsonPanel = false;
                    this.updateHash();
                } else {
                    this.jsonPanel = !this.jsonPanel;
                    this.settingsPanel = false;
                    this.updateHash();
                }
            },
            countryFind: function(query) {
                if (!query.length) return;
                let xhr = new XMLHttpRequest(query);
                xhr.open('GET', `${this.credentials.production.url}/mapbox.places/${encodeURIComponent(query)}.json?types=country&access_token=${this.credentials.production.key}`);
                xhr.onload = () => {
                    this.countries.splice(0, this.countries.length);
                    for (let feat of JSON.parse(xhr.responseText).features) {
                        this.countries.push({
                            name: feat.place_name,
                            code: feat.properties.short_code
                        });
                    }
                }
                xhr.send();
            },
            updateHash: function() {
                //Update URL hash
                let cnf = JSON.parse(JSON.stringify(this.cnf));
                cnf.query = this.query;
                cnf.jsonPanel = this.jsonPanel;

                window.location.hash = JSON.stringify(cnf);
            },
            updateBBOX: function() {
                if (!this.cnf.onBBOX || !this.cnf.bbox) {
                    this.bbox = { type: 'FeatureCollection', features: [] };
                    return;
                }

                const bbox = this.cnf.bbox.split(',');

                this.bbox = {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [-180.0, -90.0],
                                    [180.0, -90.0],
                                    [180.0, 90.0],
                                    [-180.0, 90.0],
                                    [-180.0, -90.0]
                                ],
                                turf.bboxPolygon(bbox).geometry.coordinates[0]
                            ]
                        }
                    }]
                }
            },
            search: function() {
                let searchTime = new Date();
                this.updateHash();
                this.updateBBOX();

                if (this.query.length === 0) return;

                if (this.reverseMarker) this.reverseMarker.remove();

                //Check if it is a reverse query and drop a point on the map if it is
                if (this.map && this.query.split(',').length === 2 && !isNaN(Number(this.query.split(',')[0])) && !isNaN(Number(this.query.split(',')[1]))) {
                    const el = document.createElement('div');
                    el.className = 'marker';
                    el.style.backgroundImage = 'url(' + require('./img/dot.png') +')';
                    this.reverseMarker = new mapboxgl.Marker(el).setLngLat([Number(this.query.split(',')[0]), Number(this.query.split(',')[1])]);
                    this.reverseMarker.addTo(this.map);
                }

                let env = this.cnf.staging ? 'staging' : 'production';

                let url = `${this.credentials[env].url}/${this.cnf.index}/${encodeURIComponent(this.query)}.json?access_token=${this.credentials[env].key}&cachebuster=${(+new Date())}`;
                url = `${url}&autocomplete=${this.cnf.autocomplete ? 'true' : 'false'}`;

                if (this.cnf.onCountry && this.cnf.countries.length) url = `${url}&country=${encodeURIComponent(this.cnf.countries.map((country) => { return country.code }).join(','))}`;
                if (this.cnf.onType && this.cnf.types.length) url = `${url}&types=${encodeURIComponent(this.cnf.types)}`;
                if (this.cnf.onProximity && this.cnf.proximity) url = `${url}&proximity=${encodeURIComponent(this.cnf.proximity)}`;
                if (this.cnf.onBBOX && this.cnf.bbox) url = `${url}&bbox=${encodeURIComponent(this.cnf.bbox)}`;
                if (this.cnf.onLimit && this.cnf.limit !== '') url = `${url}&limit=${encodeURIComponent(this.cnf.limit)}`;
                if (this.cnf.onLanguage && this.cnf.languages.length) url = `${url}&language=${encodeURIComponent(this.cnf.languages.map((lang) => { return lang.code }).join(','))}`;
                if (this.cnf.languageStrict) url = `${url}&languageMode=strict`;
                if (this.cnf.routing) url = `${url}&routing=true`;

                this.url = url;

                let xhr = new XMLHttpRequest();
                xhr.open('GET', this.url);
                xhr.onload = () => {
                    // compare the time the request was made to that of the previous receieved response
                    // to make sure a slow query doesn't overwrite the automcomplete display
                    if (this.searchTime <= searchTime) {
                        this.searchTime = searchTime;
                        this.geocoderResults.features.splice(0, this.geocoderResults.features.length); //Clear Results

                        if (xhr.status !== 200) {
                            //TODO ERROR HANDLING
                        } else {
                            for (let feat of JSON.parse(xhr.responseText).features) {
                                this.geocoderResults.features.push(feat);
                            }
                        }
                    }
                }
                xhr.send();
            },
            searchClear: function(e) {
                this.query = '';
                this.geocoderResults.features.splice(0, this.geocoderResults.features.length); //Clear Results
            },
            searchFocus: function(e) {
                if (this.query.length === 0) {
                    this.geocoderResults.features = this.saved.map((save, it) => {
                        return {
                            id: 'saved',
                            place_name: save,
                            properties: {
                                maki: 'rocket'
                            }
                        }
                    }).reverse();
                }
            },
            shareClick: function(e) {
                window.open(this.url, '_newtab');
            },
            typeClick: function(e) {
                let type = e.target.getAttribute('type');
                this.cnf.typeToggle[type] = !this.cnf.typeToggle[type];
                if (this.cnf.types.indexOf(type) === -1) this.cnf.types.push(type);
                else this.cnf.types.splice(this.cnf.types.indexOf(type), 1);
            },
            typeClearAll: function(e) {
                for (let typeName in this.cnf.typeToggle) {
                    this.cnf.typeToggle[typeName] = false;
                }
                this.cnf.types = [];
            },
            typeAddAll: function(e) {
                for (let typeName in this.cnf.typeToggle) {
                    this.cnf.typeToggle[typeName] = true;
                    if (this.cnf.types.indexOf(typeName) === -1) this.cnf.types.push(typeName);
                }
            },
            proximityClick: function(e) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    let coords = `${pos.coords.longitude},${pos.coords.latitude}`;

                    this.cnf.proximity = coords;
                });
            },
            proximityManualClick: function(e) {
                if (this.buildingBBox) {
                    this.buildingBBox = false;
                    this.map.removeControl(this.draw);
                }
                this.getlocation = true;
            },
            bboxDraw: function(e) {
                if (this.getlocation) this.getlocation = false;
                if (this.buildingBBox) return;
                this.buildingBBox = true;
                this.map.addControl(this.draw);
                this.map.on('draw.create', (e) => {
                    this.cnf.bbox = turf.bbox(e.features[0]).join(',');
                    this.buildingBBox = false;
                    this.map.removeControl(this.draw);
                });
            },
            resultEnter: function(e) {
                if (!this.cnf.onDebug) {
                    let res = parseInt(e.target.getAttribute('result'));

                    //Saved results are special as they are just text - don't perform any action on hover
                    if (this.geocoderResults.features[res].id === 'saved') return;
                    this.setMarkers('hovered', this.toFeatureCollection(this.geocoderResults.features[res]));

                    if (this.geocoderResults.features[res].bbox) {
                        this.setMarkers('hovered-bbox', turf.featureCollection([turf.bboxPolygon(this.geocoderResults.features[res].bbox)]));
                    }
                }
            },
            resultLeave: function(e) {
                if (!this.cnf.onDebug) {
                    this.clearMarkers('hovered-bbox');
                    this.clearMarkers('hovered');
                }
            },
            resultClick: function(e) {
                if (!this.cnf.onDebug) {
                    let res = parseInt(e.target.getAttribute('result'));

                    //Set query to saved result
                    if (this.geocoderResults.features[res].id === 'saved') {
                        this.query = this.geocoderResults.features[res].place_name;
                    } else {
                        this.setMarkers('selected', this.toFeatureCollection(this.geocoderResults.features[res]));

                        if (this.geocoderResults.features[res].bbox) {
                            this.map.fitBounds(this.geocoderResults.features[res].bbox, {
                                animate: false,
                                padding: 20
                            });
                        } else {
                            let type = this.geocoderResults.features[res].id.split('.')[0];

                            let max = 16;
                            if (type === "street") max = 15;
                            else if (type === "locality") max = 14;
                            else if (type === "place" || type === "city") max = 13;
                            else if (type === "district") max = 9;
                            else if (type === "region") max = 6;
                            else if (type === "country") max = 4;

                            this.map.jumpTo({
                                center: this.geocoderResults.features[res].geometry.coordinates,
                                zoom: max
                            });
                        }

                        //Add to saved queries list (max 5)
                        this.saved.push(this.geocoderResults.features[res].place_name);
                        if (this.saved.length > 5) this.saved.shift();
                    }
                }
            },
            hecate: function(e) {
                const win = window.open(`https://hecate-internal-prod-us.private.tilestream.net/admin/index.html#${this.map.getZoom()}/${this.map.getCenter().lat}/${this.map.getCenter().lng}`, '_blank').focus();
            },
            josm: function(e) {
                let ne = this.map.getBounds().getNorthEast().wrap().toArray();
                let sw = this.map.getBounds().getSouthWest().wrap().toArray();

                let xhr = new XMLHttpRequest();
                xhr.open('GET', `http://127.0.0.1:8111/load_and_zoom?left=${sw[0]}&right=${ne[0]}&top=${ne[1]}&bottom=${sw[1]}`);
                xhr.send();
            },
            bugReport: (e) => {
                window.open('https://github.com/mapbox/search-playground/issues/new');
            },
            toFeatureCollection: function(feature) {
                let routablePoint;
                if (feature.routable_points && feature.routable_points.points) {
                    routablePoint = turf.point(feature.routable_points.points[0].coordinates);
                    return turf.featureCollection([feature, routablePoint]);
                } else {
                    return turf.featureCollection([feature]);
                }
            }
        }
    });
}
