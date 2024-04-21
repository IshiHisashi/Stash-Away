// References
// Marker page: https://developer.tomtom.com/maps-sdk-web-js/tutorials/use-cases/how-add-and-customize-location-marker
// Search bar and map display: https://developer.tomtom.com/maps-sdk-web-js/tutorials/basic/searchbox-integration
// Calculate distance and eat: https://github.com/joserojas-tomtom/optimize-routes/commit/51a18b433141b4a08c695868b5d8f05a7da362e3
// Calculate distance and eat: https://developer.tomtom.com/blog/build-different/understanding-how-tomtom-routing-api-provides-accurate-etas/
// Geocoding: https://developer.tomtom.com/geocoding-api/documentation/geocode
// Reverse geocoding: https://developer.tomtom.com/reverse-geocoding-api/documentation/reverse-geocode

import { tomtomMapsApiKey } from "../../api.js";

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      let currentLgt = position.coords.longitude;
      let currentLat = position.coords.latitude;
      const currentLoc = [];
      currentLoc.push(currentLgt);
      currentLoc.push(currentLat);
      // console.log("Longitude: " + position.coords.longitude);
      // console.log("Latitude: " + position.coords.latitude);
      // console.log("Time: " + new Date(position.timestamp));
      console.log(currentLoc);

      async function getAddress(url) {
        let response = await fetch(url);
        let data = await response.json();
        console.log(data);
        document.getElementById("street").value =
          data.addresses[0].address.streetNameAndNumber;
        document.getElementById("city").value =
          data.addresses[0].address.municipality;
        document.getElementById("province").value =
          data.addresses[0].address.countrySubdivisionName;
        document.getElementById("zip-code").value =
          data.addresses[0].address.extendedPostalCode;
        return data;
      }

      // 🚨🚨🚨 Store the data into the DB!!!

      let addressUrl = `https://api.tomtom.com/search/2/reverseGeocode/${currentLat},${currentLgt}.json?key=${tomtomMapsApiKey}&radius=100&returnMatchType=AddressPoint`;

      getAddress(addressUrl);

      const map = tt.map({
        key: tomtomMapsApiKey,
        container: "map",
        center: currentLoc,
        zoom: 9,
      });

      map.on("load", () => {
        var curLocEl = document.createElement("div");
        curLocEl.id = "current-location-marker";
        var currentLocation = new tt.Marker({ element: curLocEl })
          .setLngLat(currentLoc)
          .addTo(map);
      });
    },
    (error) => {
      console.log(error);
      if (error.code == error.PERMISSION_DENIED) {
        window.alert("geolocation permission denied");
      }
    }
  );
} else {
  console.log("Geolocation is not supported by this browser.");
}
