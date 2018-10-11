# Mapbox Geocoder Playground Tool

Check it out at [https://mapbox.com/search-playground/](https://mapbox.com/search-playground/)
_Internal debugging? Use [this link](https://hey.mapbox.com/search-playground/) instead._

The Mapbox Geocoder Playground Tool is used to check out the `geocoder results` for forward/ reverse geocoding. This tool also allows you to see how the `geocoder results` are affected by applying geocoding parameters.

### How does to use internal

- Use the **text input** area for querying.
- Use ![image](https://user-images.githubusercontent.com/10425629/45964520-09138600-bff4-11e8-8a89-f368f496fa98.png) to see the `geocoder results` in a `json` format.
- Use ![image](https://user-images.githubusercontent.com/10425629/45964431-c487ea80-bff3-11e8-8705-598adc931a7f.png) to share the response.
- Use ![image](https://user-images.githubusercontent.com/10425629/45964577-32341680-bff4-11e8-93cf-306aeef9baa7.png) to `open/close` the `Settings panel`, where you can try out geocoding parameters.
- Use ![image](https://user-images.githubusercontent.com/10425629/45964380-a15d3b00-bff3-11e8-9f6d-f8f7d2efa0fe.png) to report any issue related to this tool.
- The ![image](https://user-images.githubusercontent.com/10425629/45965191-dbc7d780-bff5-11e8-87c0-94210f98765c.png) will open our [geocoder documentation](https://www.mapbox.com/api-documentation/#geocoding) site.

### What you can do...
By using our debbuging tool you can try out:

:heavy_check_mark: Forward Geocoding
:heavy_check_mark: Reverse Geocoding (by using right click on the map)
:heavy_check_mark: Toggle [parameters](https://www.mapbox.com/api-documentation/#request-format)

	- Autocomplete
	- Country filtering
	- Type filtering
	- Proximity biasing
	- Results limit
	- Language selection
	- Strict mode for language

:warning: Internal use only
- Toggle between staging and production server.
- Test geocoding layers.

### What you cannot do...

:x: Use it as a permanent endpoint


## Run it locally with parcel

```sh
yarn install
```

```sh
yarn start
```

## Deploying

Deploys are managed by updating the `hey-pages` & `mb-pages` branches.

To deploy run the following:

```
git checkout mb-pages

git merge master

git push
```

_[Internal only]_ Follow the `#publisher` channel in slack to watch for a successful build/publish.
