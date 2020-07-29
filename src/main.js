/* jshint browser:true,curly: false */
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
                    poiUrl: 'https://api-poi-search-production.mapbox.com',
                    unifiedSuggestUrl: 'https://search-auth-production.mapbox.com/search/v0.0/suggest',
                    unifiedRetrieveUrl: 'https://search-auth-production.mapbox.com/search/v0.0/retrieve',
                    key_federation: 'pk.eyJ1IjoibWF0dGZpY2tlIiwiYSI6ImNqNnM2YmFoNzAwcTMzM214NTB1NHdwbnoifQ.Or19S7KmYPHW8YjRz82v6g'
                },
                map: {
                    key: 'pk.eyJ1Ijoic2JtYTQ0IiwiYSI6ImNpcXNycTNqaTAwMDdmcG5seDBoYjVkZGcifQ.ZVIe6sjh0QGeMsHpBvlsEA'
                },
            },

            // If the page is just loaded and has a query in the hash value,
            // zoom the map to the bbox extent of the results
            fitZoom: false,
            bbox: { type: 'FeatureCollection', features: [] },
            query: '',
            url: '',
            urlview: false, //Show URL in settings panel
            saved: [],
            suggestResults: [],
            // Results from forward or reverse geocoding queries
            geocoderResults: { type: 'FeatureCollection', features: [] },
            // Results from querying vector tiles
            languages: [
                // { code: 'ar', name: 'Arabic' },
                // { code: 'az', name: 'Azerbaijani' },
                // { code: 'bg', name: 'Bulgarian' },
                // { code: 'bn', name: 'Bengali' },
                // { code: 'bs', name: 'Bosnian' },
                // { code: 'ca', name: 'Catalan' },
                // { code: 'cs', name: 'Czech' },
                // { code: 'da', name: 'Danish' },
                { code: 'de', name: 'German' },
                // { code: 'el', name: 'Greek' },
                { code: 'en', name: 'English' },
                { code: 'es', name: 'Spanish' },
                // { code: 'et', name: 'Estonian' },
                // { code: 'fa', name: 'Persian' },
                // { code: 'fi', name: 'Finnish' },
                { code: 'fr', name: 'French' },
                // { code: 'gu', name: 'Gujarati' },
                // { code: 'he', name: 'Hebrew' },
                // { code: 'hi', name: 'Hindi' },
                // { code: 'hr', name: 'Croatian' },
                // { code: 'hu', name: 'Hungarian' },
                // { code: 'id', name: 'Indonesian' },
                // { code: 'is', name: 'Icelandic' },
                { code: 'it', name: 'Italian' },
                // { code: 'ja', name: 'Japanese' },
                // { code: 'ka', name: 'Georgian' },
                // { code: 'kk', name: 'Kazakh' },
                // { code: 'kn', name: 'Kannada' },
                // { code: 'ko', name: 'Korean' },
                // { code: 'lt', name: 'Lithuanian' },
                // { code: 'lv', name: 'Latvian' },
                // { code: 'mk', name: 'Macedonian' },
                // { code: 'mn', name: 'Mongolian' },
                // { code: 'ms', name: 'Malay' },
                // { code: 'mt', name: 'Maltese' },
                // { code: 'nb', name: 'Norwegian Bokmål' },
                { code: 'nl', name: 'Dutch' },
                // { code: 'no', name: 'Norwegian' },
                // { code: 'pl', name: 'Polish' },
                // { code: 'pt', name: 'Portuguese' },
                // { code: 'ro', name: 'Romanian' },
                // { code: 'ru', name: 'Russian' },
                // { code: 'si', name: 'Sinhala' },
                // { code: 'sk', name: 'Slovak' },
                // { code: 'sl', name: 'Slovenian' },
                // { code: 'sq', name: 'Albanian' },
                // { code: 'sr', name: 'Serbian' },
                // { code: 'sv', name: 'Swedish' },
                // { code: 'ta', name: 'Tamil' },
                // { code: 'te', name: 'Telugu' },
                // { code: 'tg', name: 'Tajik' },
                // { code: 'th', name: 'Thai' },
                // { code: 'tk', name: 'Turkmen' },
                // { code: 'tl', name: 'Tagalog' },
                // { code: 'tr', name: 'Turkish' },
                // { code: 'uk', name: 'Ukrainian' },
                // { code: 'ur', name: 'Urdu' },
                // { code: 'uz', name: 'Uzbek' },
                // { code: 'vi', name: 'Vietnamese' },
                // { code: 'zh', name: 'Chinese' }
            ],
            layers: [],
            defaultCnf: '', //Stores a stringified version of below for resetting to default state
            cnf: {
                onType: true,
                onProximity: true,
                onLimit: true,
                onLanguage: true,
                proximity: '4.433592,50.878676',
                type: 'address',
                limit: '5',
                language: {},
            },
            hostname: location.hostname,
            getlocation: false,
            jsonPanel: false,
            settingsPanel: true,
            searchTime: new Date()
        },
        // Called synchronously after the Vue instance is created https://vuejs.org/v2/api/#created
        created: function() {
            this.defaultCnf = Object.keys(this.cnf).map(key => key + '=' + this.cnf[key]).join('&');
            let saved = localStorage.getItem('saved');
            if (saved) this.saved = JSON.parse(saved);
            // Set state to search value
            if (window.location.search) {
                let urlParams = new URLSearchParams(window.location.search)
                if (urlParams.get('query')) this.query = urlParams.get('query');
                urlParams.forEach((v, k) => {
                  v = v ? v : undefined;
                  this.cnf[k] = v;
                })
            }
        },
        // Called after the instance has been mounted-- now ready to add map
        mounted: function() {
            this.$nextTick(function() {
                (typeof this.cnf.language === 'object') ? this.setLanguage(navigator.language.split('-')[0]) : this.setLanguage(this.cnf.language);
                mapboxgl.accessToken = this.credentials.map.key;
                this.map = new mapboxgl.Map({
                    container: 'map',
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [4.433592,50.878676],
                    zoom: 10
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

                this.proximityMarker = new mapboxgl.Marker({
                    draggable: true
                }).setLngLat(this.cnf.proximity.split(',').map(Number)).addTo(this.map);

                this.proximityMarker.on('dragend', this.proximityDrag);

                this.search();

                this.map.on('load', () => {
                    // Add watch functions that trigger map events
                    // after map has been loaded to avoid GL JS errors
                    // Trigger the watch functions immediately

                    const scale = new mapboxgl.ScaleControl({
                        maxWidth: 58,
                        unit: 'metric'
                    });
                    this.map.addControl(scale);

                    this.$watch('geocoderResults.features', function() {
                        this.setMarkers('markers', this.geocoderResults);
                    }, { immediate: true });

                    this.$watch('bbox', function() {
                        this.setMarkers('bbox', this.bbox);
                    }, { immediate: true });

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
            'cnf.approx': function() { return this.search(); },
            'cnf.onCountry': function() { return this.search(); },
            'cnf.countries': function() { return this.search(); },
            'cnf.onType': function() { return this.search(); },
            'cnf.type': function() { return this.search(); },
            'cnf.types': function() { return this.search(); },
            'cnf.onProximity': function() { return this.search(); },
            'cnf.proximity': function() { return this.search(); },
            'cnf.onLimit': function() { return this.search(); },
            'cnf.limit': function() { return this.search(); },
            'cnf.autocomplete': function() { return this.search(); },
            'cnf.onLanguage': function() { return this.search(); },
            'cnf.language': function() { return this.search(); },
            'cnf.languageStrict': function() { return this.search(); },
            'cnf.routing': function() { return this.search(); },
            'cnf.localsearch': function() { return this.search(); }
        },
        // methods functions perform CRUD operations on the `data` property
        methods: {
            help: function(url = 'https://docs.mapbox.com/api/search/#forward-geocoding') {
                window.open(url, '_blank');
            },
            setStyle: function(style) {
                this.map.setStyle(style);
            },
            setMarkers: function(src, data) {
                this.map.getSource(src).setData(data);
            },
            clearMarkers: function(src) {
                this.map.getSource(src).setData({ "type": "FeatureCollection", "features": [] });
            },
            panelManage: function() {
                if (this.jsonPanel) {
                    this.jsonPanel = false;
                    this.settingsPanel = !this.settingsPanel;
                } else {
                    this.jsonPanel = !this.jsonPanel;
                    this.settingsPanel = false;
                }
            },
            setLanguage: function(lang) {
                let langObj = this.languages.find(langObj => langObj.code == lang);
                langObj ? langObj : { code: 'en', name: 'English' };
                this.cnf.language = langObj;
                this.updateQueryString();
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
            updateQueryString: function() {
                // Update URL search
                let cnf = Object.keys(this.cnf).map(key => {
                  return (key === 'language') ? `${key}=${this.cnf[key].code}` : `${key}=${this.cnf[key]}`;
                }).join('&');
                // Add query to string
                if (this.query) {
                  cnf = `${cnf}&query=${this.query}`
                };
                window.history.replaceState( {} , '/?', `?${cnf}` );
            },
            search: function() {
                let searchTime = new Date();
                this.updateQueryString();
                // this.updateBBOX();

                if (this.query.length === 0) return;

                let env = this.cnf.staging ? 'staging' : 'production';
                const tokenKey = this.cnf.localsearch ?  'key_hiero_federation' : 'key_federation';
                const  accessToken = this.credentials[env][tokenKey];
                let url = '';

                if(this.cnf.type === 'address') {
                    url = `${this.credentials[env].unifiedSuggestUrl}/${encodeURIComponent(this.query)}?access_token=${accessToken}&types=address,street`;
                    url = `${url}&limit=5`;
                } else if(this.cnf.type === 'poi-search') {
                    url = `${this.credentials[env].poiUrl}/poi/search/${encodeURIComponent(this.query)}?access_token=${accessToken}`;
                    url = `${url}&limit=10`;
               } else if(this.cnf.type === 'poi-category') {
                    const subType = this.cnf.subType === 'search' ? 'search' : 'suggest';
                    url = `${this.credentials[env].poiUrl}/category/${subType}/${encodeURIComponent(this.query)}?access_token=${accessToken}`;
                    url = `${url}&limit=20`;
                } else if(this.cnf.type === 'unified') {
                    url = `${this.credentials[env].unifiedSuggestUrl}/${encodeURIComponent(this.query)}?access_token=${accessToken}`;
                    if(!this.action) {
                        url = `${url}&limit=20`;
                    }
                }
                if(this.action) {
                    for(let key in this.action.query) {
                        url = `${url}&${key}=${encodeURIComponent(this.action.query[key])}`;
                    }
                    this.action = null;
                }
                else{
                    if (this.cnf.onProximity && this.cnf.proximity) url = `${url}&proximity=${encodeURIComponent(this.cnf.proximity)}`;
                    if (this.cnf.onLanguage && this.cnf.language) url = `${url}&language=${encodeURIComponent(this.cnf.language.code)}`;
                }

                this.url = url;
                let xhr = new XMLHttpRequest();
                xhr.open('GET', this.url);
                xhr.onload = () => {
                    // compare the time the request was made to that of the previous receieved response
                    // to make sure a slow query doesn't overwrite the automcomplete display
                    if (this.searchTime <= searchTime) {
                        this.searchTime = searchTime;
                        this.geocoderResults.features = []; //Clear Results
                        this.suggestResults = []; //Clear Results

                        if (xhr.status < 200 || xhr.status > 299) {
                            //TODO ERROR HANDLING
                        } else {
                            if (this.cnf.type === 'address' || this.cnf.type === 'unified') {
                                for (let sugg of JSON.parse(xhr.responseText).suggestions) {
                                    sugg.name = sugg.matching_name;
                                    this.suggestResults.push(sugg);
                                }
                            } else if(this.cnf.type === 'poi-category' && this.cnf.subType !== 'search') {
                                for (let sugg of JSON.parse(xhr.responseText).categories) {
                                    sugg.id = sugg.category_id;
                                    this.suggestResults.push(sugg);
                                }
                            } else {
                                for (let feat of JSON.parse(xhr.responseText).features) {
                                    this.geocoderResults.features.push(feat);
                                    feat.name = feat.properties.place_name;
                                    feat.id = feat.properties.id;
                                    this.suggestResults.push(feat);
                                }

                                if (this.fitZoom) {
                                    this.map.fitBounds(turf.bbox(this.geocoderResults), {
                                        animate: false,
                                        padding: 250
                                    });
                                    this.fitZoom = false;
                                }
                            }
                        }
                    }
                }
                xhr.send();
            },
            searchClear: function(e) {
                this.query = '';
                this.suggestResults = [];
                this.geocoderResults.features = [];
                this.cnf.subType = null;
            },
            searchFocus: function(e) {
                this.cnf.subType = null;
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
                let searchType = e.target.value;
                // this.cnf.typeToggle[type] = !this.cnf.typeToggle[type];
                this.cnf.type = searchType;
                this.cnf.subType = null;
                this.searchClear();
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
                this.map.jumpTo({
                    center: this.cnf.proximity.split(',').map(Number),
                    zoom: 13
                });
            },
            proximityDrag: function(e) {
                let lngLat = this.proximityMarker.getLngLat();
                this.cnf.proximity = `${lngLat.lng.toFixed(6)},${lngLat.lat.toFixed(6)}`;
            },
            catClick: function(e) {
                this.query = e.target.getAttribute('type');
                this.cnf.subType = 'search';
            },

            resultEnter: function(e) {
                let res = parseInt(e.target.getAttribute('result'));
            },
            resultLeave: function(e) {
                this.clearMarkers('hovered-bbox');
                this.clearMarkers('hovered');
            },
            resultClick: function(e) {
                if(this.cnf.type === 'poi-category' && this.cnf.subType !== 'search') {
                    // on selection of category type, update the query and search for nearby POIs of that type
                    this.cnf.subType = 'search';

                    const res = parseInt(e.target.getAttribute('result'));
                    this.query = this.suggestResults[res].id;
                    this.search();
                }
                else if(this.cnf.type === 'address' || this.cnf.type === 'unified') {
                    let res = parseInt(e.target.getAttribute('result'));
                    let item = this.suggestResults[res];

                    if (!item.action) {
                        let type = item.properties.place_type[0];

                        let max = this.maxZoom(type);

                        this.map.jumpTo({
                            center: item.geometry.coordinates,
                            zoom: max
                        });
                    }
                    else if (item.action.endpoint === 'suggest') {
                        this.action = item.action;
                        if(this.query === this.suggestResults[res].action.path) {
                            this.search();
                        } else {
                            this.query = this.suggestResults[res].action.path
                        }
                    }
                    else if (item.action.endpoint === 'retrieve' ) {

                        let env = this.cnf.staging ? 'staging' : 'production';
                        const tokenKey = this.cnf.localsearch ?  'key_hiero_federation' : 'key_federation';
                        const  accessToken = this.credentials[env][tokenKey];

                        let url = `${this.credentials[env].unifiedRetrieveUrl}/${item.action.path}?access_token=${accessToken}`;
                        let xhr = new XMLHttpRequest();
                        xhr.open('GET', url);
                        xhr.onload = () => {

                            this.geocoderResults.features = []; // clear results
                            this.suggestResults = []; // clear results

                            if (xhr.status < 200 || xhr.status > 299) {
                                //TODO ERROR HANDLING
                            } else {
                                for (let feat of JSON.parse(xhr.responseText).features) {
                                    this.geocoderResults.features.push(feat);
                                    feat.name = feat.properties.place_name;
                                    feat.id = feat.properties.id;
                                    this.suggestResults.push(feat);
                                }

                                this.setMarkers('selected', this.toFeatureCollection(this.geocoderResults.features));

                                // If single result, jump to
                                if (this.geocoderResults.length === 1) {
                                    let type = this.geocoderResults.features[0].properties.place_type[0];

                                    let max = this.maxZoom(type);

                                    this.map.jumpTo({
                                        center: this.geocoderResults.features[0].geometry.coordinates,
                                        zoom: max
                                    });

                                } else {
                                    this.map.fitBounds(turf.bbox(this.geocoderResults), {
                                        animate: false,
                                        padding: 250
                                    });
                                }
                            }
                        }
                        xhr.send();
                    }
                }
                else {
                    let res = parseInt(e.target.getAttribute('result'));

                    //Set query to saved result
                    if (this.geocoderResults && this.geocoderResults.features[res].id === 'saved') {
                        this.query = this.geocoderResults.features[res].place_name;
                    } else {
                        this.setMarkers('selected', this.toFeatureCollection(this.geocoderResults.features[res]));

                        if (this.geocoderResults.features[res].bbox) {
                            this.map.fitBounds(this.geocoderResults.features[res].bbox, {
                                animate: false,
                                padding: 20
                            });
                        } else {
                            this.map.jumpTo({
                                center: this.geocoderResults.features[res].geometry.coordinates,
                                zoom: 15
                            });
                        }

                        //Add to saved queries list (max 5)
                        this.saved.push(this.geocoderResults.features[res].place_name);
                        if (this.saved.length > 5) this.saved.shift();
                    }
                }
            },
            hecate: function(e) {
                const win = window.open(`https://hecate-internal-prod-us.tilestream.net/admin/index.html#${this.map.getZoom()}/${this.map.getCenter().lat}/${this.map.getCenter().lng}`, '_blank').focus();
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
            },
            maxZoom: function(type) {
                let max = 16;
                if (type === "street") max = 15;
                else if (type === "locality") max = 14;
                else if (type === "place" || type === "city") max = 13;
                else if (type === "district") max = 9;
                else if (type === "region") max = 6;
                else if (type === "country") max = 4;

                return max;
            }
        }
    });
}
