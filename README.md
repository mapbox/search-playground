# Mapbox Geocoder Playground Tool
We’ve updated our search playground: [https://mapbox.com/search-playground/](https://mapbox.com/search-playground/)
*Internal debugging? Use* [*this link*](https://hey.mapbox.com/search-playground/) *instead.*
The Mapbox Geocoder Playground Tool is used to test geocoder results for forward and reverse geocoding and experiment with query parameters  


## Using the playground
- Use the **text input** area for querying.
- Use ![image](https://user-images.githubusercontent.com/10425629/45964520-09138600-bff4-11e8-8a89-f368f496fa98.png) to see the `geocoder results` in a `json` format.
- Use ![image](https://user-images.githubusercontent.com/10425629/45964431-c487ea80-bff3-11e8-8705-598adc931a7f.png) to share the response.
- Use ![image](https://user-images.githubusercontent.com/10425629/45964577-32341680-bff4-11e8-93cf-306aeef9baa7.png) to `open/close` the `Settings panel`, where you can try out geocoding parameters.
- Use ![image](https://user-images.githubusercontent.com/10425629/45964380-a15d3b00-bff3-11e8-9f6d-f8f7d2efa0fe.png) to report any issue related to this tool.
- The ![image](https://user-images.githubusercontent.com/10425629/45965191-dbc7d780-bff5-11e8-87c0-94210f98765c.png) will open our [geocoder documentation](https://www.mapbox.com/api-documentation/#geocoding) site.

Internal only:

- Use ![image](https://user-images.githubusercontent.com/10425629/46829365-92a0b300-cd6b-11e8-8cac-1ff585a10d12.png) to open hecate
- Use the osm link to open JOSM

The search bar is the equivalent of an API query.  For a forward geocode, enter text or an address. For a reverse geocode, enter coordinates.

**Forward Geocoding** 
Enter a query in the search bar to get the coordinates and data about the feature.

![](https://d2mxuefqeaa7sj.cloudfront.net/s_5027A4BB40E1446B0B8D8F06587A89D4FD4D0AFC4D48F0CCBF27E186ABF22BBC_1537827703932_Screen+Shot+2018-09-24+at+6.21.27+PM.png)


**Reverse Geocoding** 
Click on the map to see the coordinates in the search bar and the features that match those coordinates will be returned in the suggestions list below the search bar.

![](https://d2mxuefqeaa7sj.cloudfront.net/s_5027A4BB40E1446B0B8D8F06587A89D4FD4D0AFC4D48F0CCBF27E186ABF22BBC_1537827353660_Screen+Shot+2018-09-24+at+6.15.40+PM.png)



**Set query parameters**
Click the cog icon to open a GUI of the query parameters available in the geocoding API.

For more information, see the [parameters](https://www.mapbox.com/api-documentation/#request-format) section of the documentation.

Parameters available in the playground:

    - Autocomplete
    - Country filtering
    - Type filtering
    - Proximity biasing
    - Results limit
    - Language selection
    - Strict mode for language


:warning:  Internal use only

- Toggle between staging and production server.
- Test geocoding layers.

**What you cannot do...**

:x: Use it as a permanent endpoint

## Run it locally with parcel
    yarn install
    yarn start
## Deploying

Deploys are managed by updating the `hey-pages` & `publisher-production` branches.
To deploy run the following:

    git checkout publisher-production
    
    git merge master
    
    git push

*[Internal only]* Follow the `#publisher` channel in slack to watch for a successful build/publish.
