"use strict";

import { tomtomMapsApiKey } from "../../api.js";

import * as geo from "./geo.js";
import * as common from "./../../common.js";

import { initHeader } from "../homepage/header/header.js";
import { initFooter } from "../homepage/footer/footer.js";

async function loadComponent(componentPath, placeholderId) {
  try {
    const response = await fetch(componentPath);
    const componentHTML = await response.text();
    document.getElementById(placeholderId).innerHTML = componentHTML;
  } catch (error) {
    console.error("An error occurred while loading the component:", error);
  }
}

async function init() {
  try {
    await loadComponent("../homepage/header/header.html", "header-placeholder");
    initHeader();
    // await loadComponent('../homepage/body/body.html', 'body-placeholder');
    await loadComponent("../homepage/footer/footer.html", "footer-placeholder");
    initFooter();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}

// Initialize Firebase---------------
const db = common.db;
const uid = await common.getCurrentUid();
// Get userDoc
const userSnap = await common.getDoc(common.doc(db, "users", `${uid}`));
const userDoc = userSnap.data();
// ----------------------------

// const app = initializeApp(firebaseConfig);
// const db = common.getFirestore(app);
console.log("User id downloaded");
console.log(uid);
const profileInfo = userDoc;
console.log("Profile data downloaded");
console.log(profileInfo);

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
      let userLgt = uid ? profileInfo?.address.geoCode[0] : -123.0965;
      let userLat = uid ? profileInfo?.address.geoCode[1] : 49.2203;
      const currentLoc = [];
      currentLoc.push(userLgt);
      currentLoc.push(userLat);
      console.log(currentLoc);

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
                key: tomtomMapsApiKey,
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
        await sortAndShow();
        await initializeMap();
        changeIconForLabel();
        clickMarker();
        const load = document.getElementById("loading-screen");
        const body = document.querySelector("body");
        setTimeout(() => {
          window.scrollTo(0, 0);
          load.style.display = "none";
          body.style.overflowY = "auto";
        }, 1000);
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
          ).innerHTML = `<div class="location-name">
            <span class="city-name-in-list">${cityArray[i].name}</span>
            <img class="location-open" src="./../icons/chevron-down.png" alt="check details of the location">
          </div>
          <div class="hidden-area">
            <div class="address">
              <img class="loc-icon" src="./../icons/location-marker.png" alt="location logo">
              <p>${cityArray[i].address}</p>
            </div>
            <div class="distance">
              <img class="distance-icon" src="./../icons/track.png" alt="distance logo">
              <p>${
                Math.round(cityArray[i].distance / 100) / 10
              } kilo mtrs from your address</p>
            </div>
          </div>
          `;
        }
      }

      // FUNCTION FOR SORTING =========================================
      function compare(a, b) {
        return a.distance - b.distance;
      }

      // ICON CHANGE ============================================

      function changeIconForLabel() {
        const labels = document.querySelectorAll("fieldset div label");
        const inputRadioBtns = document.querySelectorAll(
          'input[name="location"]'
        );
        for (let i = 0; i < inputRadioBtns.length; i++) {
          labels[i].addEventListener("click", (e) => {
            e.preventDefault();
            body.id = `${inputRadioBtns[i].value}`;
            for (let p = 0; p < inputRadioBtns.length; p++) {
              inputRadioBtns[p].removeAttribute("checked");
            }
            let cityOption = document.querySelector(
              `input[value="${inputRadioBtns[i].value}"]`
            );
            cityOption.setAttribute("checked", "");
            const hiddenArea = document.querySelector(
              `label[for="location-${i}"] div[class="hidden-area"]`
            );
            const labelArrow = document.querySelector(
              `label[for="location-${i}"] div[class="location-name"] img`
            );
            if (hiddenArea.style.maxHeight) {
              hiddenArea.style.maxHeight = null;
              labelArrow.style.transform = "rotate(0)";
            } else {
              hiddenArea.style.maxHeight = hiddenArea.scrollHeight + "px";
              labelArrow.style.transform = "rotate(180deg)";
            }
          });
        }
      }

      function clickMarker() {
        const markers = document.querySelectorAll(".loc-marker");
        const inputRadioBtns = document.querySelectorAll(
          'input[name="location"]'
        );
        for (let i = 0; i < markers.length; i++) {
          markers[i].addEventListener("click", () => {
            let bodyId = markers[i].id.slice(7);
            body.id = bodyId;
            for (let j = 0; j < inputRadioBtns.length; j++) {
              inputRadioBtns[j].removeAttribute("checked");
            }
            let cityOption = document.querySelector(`input[value="${bodyId}"]`);
            cityOption.setAttribute("checked", "");
            const hiddenArea = document.querySelector(
              `input[value="${bodyId}"]`
            ).nextElementSibling.firstElementChild.nextElementSibling;
            const labelArrow = document.querySelector(
              `label[for="location-${i}"] div[class="location-name"] img`
            );
            if (hiddenArea.style.maxHeight) {
              hiddenArea.style.maxHeight = null;
              labelArrow.style.transform = "rotate(0)";
            } else {
              hiddenArea.style.maxHeight = hiddenArea.scrollHeight + "px";
              labelArrow.style.transform = "rotate(180deg)";
            }
          });
        }
      }

      // SELECTED CITY'S VALUE IS STORED HERE=======================

      const submitBtn = document.getElementById("submit");
      submitBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (!uid) {
          window.location.href = `../authentication/login.html?returnUrl=${encodeURIComponent(
            `../home-page-map/index.html`
          )}`;
        } else {
          if (document.querySelector(`input[checked]`) == null) {
            alert(
              "You can select your own storage location by clicking a location icon on the map!"
            );
          } else {
            fireNewLocation();
          }
        }

        // ----Ishi revised & added----
        // Specify specific obj as a data pacaked to be sent
      });

      const fireNewLocation = async function () {
        const selectedCity = await document.querySelector(`input[checked]`);
        const selectedCityID = await selectedCity.id.split("-")[1];
        const selectedCityObj = await cityArray[selectedCityID];

        await geo.updateStorageLocation(selectedCityObj);

        await alert(
          `You chose the storage in ${selectedCityObj.name}. You can also change location in booking process later.`
        );

        document.getElementById("proceedLink").click();
      };

      const initializeMap = function () {
        // SET MAP =================================================
        const map = tt.map({
          key: tomtomMapsApiKey,
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
            `<b>${cityArray[i].name}</b>`
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
      };
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
