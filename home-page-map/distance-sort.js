class City {
  constructor(name, geoLoc) {
    this.name = name;
    this.geoLoc = geoLoc;
    this.distance = "";
  }
}
const cityArray = [];
const northVanObj = new City("North Vancouver", [-123.12582, 49.351542]);
const richmondObj = new City("Richmond", [-123.108487, 49.173966]);
const surreyObj = new City("Surrey", [-122.841305, 49.15978]);
const abbotsfordObj = new City("Abbotsford", [-122.323466, 49.065087]);
const coquitlamObj = new City("Coquitlam", [-122.776836, 49.283485]);
// const chilliwackObj= new City("Chilliwack", [-121.954941, 49.150314]);
// const victoriaObj = new City("Victoria", [-123.422233, 48.523145]);
// const kelownaObj = new City("Kelowna", [-119.455072, 49.869284]);

// 🚨 DUE TO QPS (QUOTA PER SECOND, WHICH IS 5 QUOTAS PER SECOND) OF ROUTING API FOR FREE ACOUNT, I LIMITED THE NUMBER OF LOCATIONS ONLY 5. AFTER ASKING AMANDEEP, WE MAY BE ABLE TO ADD THE LAST THREE CITIES AGAIN　🚨

cityArray.push(northVanObj);
cityArray.push(richmondObj);
cityArray.push(surreyObj);
cityArray.push(abbotsfordObj);
cityArray.push(coquitlamObj);
// cityArray.push(chilliwackObj);
// cityArray.push(victoriaObj);
// cityArray.push(kelownaObj);

console.log(cityArray);

// References
// Marker page: https://developer.tomtom.com/maps-sdk-web-js/tutorials/use-cases/how-add-and-customize-location-marker
// Search bar and map display: https://developer.tomtom.com/maps-sdk-web-js/tutorials/basic/searchbox-integration
// Calculate distance and eat: https://github.com/joserojas-tomtom/optimize-routes/commit/51a18b433141b4a08c695868b5d8f05a7da362e3
// Calculate distance and eat: https://developer.tomtom.com/blog/build-different/understanding-how-tomtom-routing-api-provides-accurate-etas/

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // GET LOCATION =================================
      let currentLgt = position.coords.longitude;
      let currentLat = position.coords.latitude;
      const currentLoc = [];
      currentLoc.push(currentLgt);
      currentLoc.push(currentLat);
      console.log(currentLoc);

      // CALCULATE DINTANCE FOR EACH LOCATION =============

      // 🚨 WHY IS NOT THIS WORKING PROPERLY??????? 🚨

      for (let i in cityArray) {
        let twoLocs = [currentLoc, cityArray[i].geoLoc];
        console.log(twoLocs);
        tt.services
          .calculateRoute({
            key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
            routeType: "shortest",
            locations: twoLocs,
          })
          .then((result) => {
            cityArray[i].distance = result.routes[0].summary.lengthInMeters;
            console.log(cityArray[i]);
            if (i == 4) {
              // SORT LOCATIONS ====================================
              cityArray.sort(compare);
              console.log(cityArray);

              // SHOW ON THE SIDE MENU ================================
              // for (let i in cityArray) {
              //   let locNum = i+1
              //   let idName = `"location-${locNum}"`
              //   document.getElementById(idName).innerHTML = `Location: ${cityArray[i].name}<br>Distance: ${cityArray[i].distance} mtrs`
              // }
              document.getElementById("location-1").innerHTML = `Location: ${
                cityArray[0].name
              }<br>Distance: ${
                Math.round(cityArray[0].distance / 10) / 100
              } kilo mtrs`;
              document.getElementById("location-2").innerHTML = `Location: ${
                cityArray[1].name
              }<br>Distance: ${
                Math.round(cityArray[1].distance / 10) / 100
              } kilo mtrs`;
              document.getElementById("location-3").innerHTML = `Location: ${
                cityArray[2].name
              }<br>Distance: ${
                Math.round(cityArray[2].distance / 10) / 100
              } kilo mtrs`;
              document.getElementById("location-4").innerHTML = `Location: ${
                cityArray[3].name
              }<br>Distance: ${
                Math.round(cityArray[3].distance / 10) / 100
              } kilo mtrs`;
              document.getElementById("location-5").innerHTML = `Location: ${
                cityArray[4].name
              }<br>Distance: ${
                Math.round(cityArray[4].distance / 10) / 100
              } kilo mtrs`;
            }
          });
      }

      // FUNCTION FOR SORTING =========================================
      function compare(a, b) {
        return a.distance - b.distance;
      }

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

      var nvEl = document.createElement("div");
      nvEl.className = "loc-marker";
      var northVan = new tt.Marker({ element: nvEl })
        .setLngLat(northVanObj.geoLoc)
        .addTo(map);
      var nvPop = new tt.Popup({ offset: popupOffsets }).setHTML(
        "<b>North Vancouver</b><br>420 Southborough Dr, West Vancouver, BC V7S 1M2"
      );
      northVan.setPopup(nvPop).togglePopup();

      var rchEl = document.createElement("div");
      rchEl.className = "loc-marker";
      var richmond = new tt.Marker({ element: rchEl })
        .setLngLat(richmondObj.geoLoc)
        .addTo(map);
      var richPop = new tt.Popup({ offset: popupOffsets }).setHTML(
        "<b>Richmond</b><br>420 Southborough Dr, West Vancouver, BC V7S 1M2"
      );
      richmond.setPopup(richPop).togglePopup();

      var surrEl = document.createElement("div");
      surrEl.className = "loc-marker";
      var surrey = new tt.Marker({ element: surrEl })
        .setLngLat(surreyObj.geoLoc)
        .addTo(map);
      var surPop = new tt.Popup({ offset: popupOffsets }).setHTML(
        "<b>Surrey</b><br>address here"
      );
      surrey.setPopup(surPop).togglePopup();

      var abtfEl = document.createElement("div");
      abtfEl.className = "loc-marker";
      var abbotsford = new tt.Marker({ element: abtfEl })
        .setLngLat(abbotsfordObj.geoLoc)
        .addTo(map);
      var abtfPop = new tt.Popup({ offset: popupOffsets }).setHTML(
        "<b>Abbotsford</b><br>address here"
      );
      abbotsford.setPopup(abtfPop).togglePopup();

      var coqEl = document.createElement("div");
      coqEl.className = "loc-marker";
      var coquitlam = new tt.Marker({ element: coqEl })
        .setLngLat(coquitlamObj.geoLoc)
        .addTo(map);
      var coqPop = new tt.Popup({ offset: popupOffsets }).setHTML(
        "<b>Coquitlam</b><br>address here"
      );
      coquitlam.setPopup(coqPop).togglePopup();

      // var chilEl = document.createElement("div");
      // chilEl.className = "loc-marker"
      // var chilliwack = new tt.Marker({ element: chilEl }).setLngLat(chilliwackObj.geoLoc).addTo(map);
      // var chilPop = new tt.Popup({ offset: popupOffsets }).setHTML(
      //   "<b>Chilliwack</b><br>address here"
      // )
      // chilliwack.setPopup(chilPop).togglePopup()

      // var vicEl = document.createElement("div");
      // vicEl.className = "loc-marker"
      // var victoria = new tt.Marker({ element: vicEl }).setLngLat(victoriaObj.geoLoc).addTo(map);
      // var vicPop = new tt.Popup({ offset: popupOffsets }).setHTML(
      //   "<b>Victoria</b><br>address here"
      // )
      // victoria.setPopup(vicPop).togglePopup()

      // var keloEl = document.createElement("div");
      // keloEl.className = "loc-marker"
      // var kelowna = new tt.Marker({ element: keloEl }).setLngLat(kelownaObj.geoLoc).addTo(map);
      // var keloPop = new tt.Popup({ offset: popupOffsets }).setHTML(
      //   "<b>Kelowna</b><br>address here"
      // )
      // kelowna.setPopup(keloPop).togglePopup()

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

// From Ishi---------------
import * as geo from "./geo.js";

// To read Company's location
console.log(geo.storageLocationObj);
console.log(geo.storageLocationArr);

// To read user's data
console.log(geo.userAddress);
