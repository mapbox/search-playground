#!/bin/bash

# Before running this script, make sure you set up your environmental variables
# by copying and pasting the following commands in your terminal:
#   export USERNAME={your mapbox username}
#   export SECRETTOKEN={your mapbox secret access token}
# Your secret access token must have `tokens:write` and `staff` scopes
# You can learn more about temporary tokens here: https://www.mapbox.com/api-documentation/#create-temporary-token

# Set the expiration date using node to avoid dealing with GNU vs BSD date differences
DATE=$(node -e "console.log(new Date(Date.now() + 36e5).toISOString())");

echo "TEMPORARY TOKEN:"
curl -s -X POST --header "Content-Type:application/json" -d "{ \"scopes\": [\"debug\"], \"expires\": \"$DATE\" }" "https://api.mapbox.com/tokens/v2/$USERNAME?access_token=$SECRETTOKEN" | jq '.token'
