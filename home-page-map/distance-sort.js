import * as geo from "./geo.js";

// Company's location
console.log(geo.storageLocationObj);
console.log(geo.storageLocationArr);

// user's data
console.log(geo.userAddress);

class City {
  constructor(name, geoLoc, address) {
    this.name = name;
    this.geoLoc = geoLoc;
    this.address = address;
    this.distance = "";
  }
}
const cityArray = [];

// Get data from database as an array and use loop to make city objects and store them right away

for (let i in geo.storageLocationArr) {
  let stName = geo.storageLocationArr[i][1].name;
  let stGeoLoc = [
    geo.storageLocationArr[i][1].geoInfo._long,
    geo.storageLocationArr[i][1].geoInfo._lat,
  ];
  let stAddress = `${geo.storageLocationArr[i][1].address.street}, ${geo.storageLocationArr[i][1].address.city}, ${geo.storageLocationArr[i][1].address.zipCode}`;
  let cityObj = new City(stName, stGeoLoc, stAddress);
  cityArray.push(cityObj);
}

// DUE TO QPS (QUOTA PER SECOND, WHICH IS 5 QUOTAS PER SECOND) OF ROUTING API FOR FREE ACOUNT, I LIMITED THE NUMBER OF LOCATIONS ONLY 5.

console.log("👇 A list of cities in an array");
console.log(cityArray);

const body = document.querySelector("body");

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // GET LOCATION ============================================
      // 🚨 Will change this to user's location 🚨
      let currentLgt = position.coords.longitude;
      let currentLat = position.coords.latitude;
      const currentLoc = [];
      currentLoc.push(currentLgt);
      currentLoc.push(currentLat);

      // CALCULATE DINTANCE FOR EACH LOCATION ==================

      //  Array container to contain all the promises for calculating distance
      let promises = [];

      //  Calculata distance in a promise here and return distance.
      for (let i in cityArray) {
        let twoLocs = [currentLoc, cityArray[i].geoLoc];

        promises.push(
          new Promise((resolve, reject) => {
            tt.services
              .calculateRoute({
                key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
                routeType: "shortest",
                locations: twoLocs,
              })
              .then((result) => {
                cityArray[i].distance = result.routes[0].summary.lengthInMeters;
                console.log("Calc distance Resolved", i);
                resolve();
              });
          })
        );
      }

      waitforpromises();

      // This function waits until all the calculation promises are done. And once all of them are done, it fires sort
      async function waitforpromises() {
        await Promise.all(promises);
        console.log("All calc distance Resolved");
        sortAndShow();
        changeIcon();
        clickMarker();
      }

      // SORT AND SHOW IN THE BAR ================================
      async function sortAndShow() {
        // SORT
        cityArray.sort(compare);
        console.log("👇 The array sorted by distance");
        console.log(cityArray);

        // SHOW ON THE SIDE MENU
        for (let i in cityArray) {
          let idName = `location-${i}`;
          document.getElementById(idName).value = cityArray[i].name;
          document.querySelector(
            `[for="${idName}"]`
          ).innerHTML = `Location: ${cityArray[i].name}<br>Distance: ${Math.round(cityArray[i].distance / 100) / 10} kilo mtrs`;
        }
      }

      // FUNCTION FOR SORTING =========================================
      function compare(a, b) {
        return a.distance - b.distance;
      }

      // ICON CHANGE ============================================
      function changeIcon() {
        const inputDiv = document.querySelectorAll('fieldset div');
        const inputRadioBtns = document.querySelectorAll('input[name="location"]');
        for (let i = 0; i < inputRadioBtns.length; i++) {
          inputDiv[i].addEventListener("click", () => {
            body.id = `${inputRadioBtns[i].value}`;
            for (let p = 0; p < inputRadioBtns.length; p++) {
                inputRadioBtns[p].removeAttribute("checked");
              console.log(inputRadioBtns[p]);
            }
            let cityOption = document.querySelector(`input[value="${inputRadioBtns[i].value}"]`)
            cityOption.setAttribute("checked", "")
            console.log(cityOption);
          });
        }
      }

      function clickMarker() {
        const markers = document.querySelectorAll(".loc-marker");
        const inputRadioBtns = document.querySelectorAll('input[name="location"]');
        for (let i = 0; i < markers.length; i++) {
          markers[i].addEventListener("click", () => {
            let bodyId = markers[i].id.slice(7);
            body.id = bodyId;
            for (let j = 0; j < inputRadioBtns.length; j++) {
                inputRadioBtns[j].removeAttribute("checked");
              console.log(inputRadioBtns[j]);
            }
            let cityOption = document.querySelector(`input[value="${bodyId}"]`)
            console.log(cityOption);
            cityOption.setAttribute("checked", "")
          });
        }
      }


      // SELECTED CITY'S VALUE IS STORED HERE=======================

      var selectedCity = "";
      const submitBtn = document.getElementById("submit");
      submitBtn.addEventListener("click", function (event) {
        event.preventDefault();
        // ----Ishi revised & added----
        // Specify specific obj as a data pacaked to be sent
        selectedCity = document.querySelector(
          `input[name="location"]:checked`
        ).id;
        const selectedCityID = selectedCity.split("-")[1];
        const selectedCityObj = cityArray[selectedCityID];

        // send data to DB
        geo.updateStorageLocation(selectedCityObj);

        alert(
          `Location: ${selectedCityObj.name} was saved. If you want to change your storage location preference, you can choose a defferent location and press submit putton.`
        );
      });

      // SET MAP =======================================================
      const map = tt.map({
        key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
        container: "map",
        center: currentLoc,
        zoom: 9,
      });

      // MARKER & POPUP SETTINGS =================================
      var popupOffsets = {
        top: [0, 0],
        bottom: [0, -50],
        "bottom-right": [0, -70],
        "bottom-left": [0, -70],
        left: [25, -35],
        right: [-25, -35],
      };

      for (let i in cityArray) {
        var element = document.createElement("div");
        element.className = "loc-marker";
        element.id = `marker-${cityArray[i].name}`;
        var newMarker = new tt.Marker({ element: element })
          .setLngLat(cityArray[i].geoLoc)
          .addTo(map);
        var newPopUp = new tt.Popup({ offset: popupOffsets }).setHTML(
          `<b>${cityArray[i].name}</b><br>${cityArray[i].address}`
        );
        newMarker.setPopup(newPopUp).togglePopup();
      }

      // MAP ON LOAD WITH ICON ==============================

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
