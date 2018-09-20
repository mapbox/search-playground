# Mapbox Geocoder Debug Tool

Internal tool for testing v5 of the Mapbox geocoder, located at [https://mapbox.com/search-playground/](https://mapbox.com/search-playground/).

Currently supports:

- forward
- reverse (right click)
- autocomplete (toggleable)
- country filtering
- type filtering
- proximity biasing
- results limit
- language selection
- strict mode for language
- use of staging server or production

Not yet implemented:

- use of permanent endpoint

Click the gear icon to change settings, or the bracket icon to see the json response.


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
git checkout hey-pages

git merge master

git push
```

Then follow the `#publisher` channel in slack to watch for a successful build/publish.
