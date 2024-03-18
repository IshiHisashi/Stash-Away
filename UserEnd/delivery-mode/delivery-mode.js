"use strict";

import * as common from "../../common.js";
// Initialize Firebase---------------
const db = common.db;
// Define variables----------------
// const uid = await common.getCurrentUid();
const uid = "3ZGNxHC1avOoTevnctvkhBMwH962";
/// General : Get users in 'usersID'
const userSnap = await common.getDoc(common.doc(db, "users", `${uid}`));
const userDoc = userSnap.data();

const address = document.getElementById("address-p");
const phone = document.getElementById("phone-p");
const date = document.getElementById("date-p");
const time = document.getElementById("time-p");

// Render info
address.textContent = `${userDoc.address.detail} ${userDoc.address.city}, ${userDoc.address.province} ${userDoc.address.zipCode}`;
phone.textContent = `${userDoc.contact.phone}`;
date.textContent = common.nextDay;
time.textContent = "5:00 PM";

// Offline exp

// self.addEventListener("fetch", (event) => {
//   console.log(`Fetching ${event.request.url}`);
//   event.respondWith(NetworkOrOfflinePage(event));
// });

// async function NetworkOrOfflinePage(event) {
//   try {
//     return await fetch(event.request); // returns server fetch
//   } catch (error) {
//     // in case of error return a static page
//     console.log(error);
//     return caches.match("offline.html"); // returns default offline page
//   }
// }
console.log("x");
console.log(navigator);

if ("serviceWorker" in navigator) {
  //   navigator.serviceWorker.register("delivery-mode.js");
  console.log("register");
}

// const cacheName = "cache-v1";
// const offlineURL = "../offline.html";

// self.addEventListener("install", (e) => {
//   console.log("SW installed");

//   self.skpWaiting();

//   e.waitUntil(
//     caches.open(cacheName).then((cache) => {
//       console.log("SW:caching files");
//       cache.add(offlineURL);
//     })
//   );
// });

// self.addEventListener("active", (e) => {
//   console.log("sw activated");
//   e.waitUntil(
//     caches.keys().then((cacheName) => {
//       return Promise.all(
//         cacheName.map((cache) => {
//           if (cache != cacheName) {
//             console.log("SW : deleting old caches.");
//             caches.deliete(cache);
//           }
//         })
//       );
//     })
//   );
// });

// self.addEventListener("fetch", (event) => {
//   console.log(`Fetching ${event.request.url}`);
//   event.respondWith(NetworkOrOfflinePage(event));
// });

// async function NetworkOrOfflinePage(event) {
//   try {
//     return await fetch(event.request); // returns server fetch
//   } catch (error) {
//     // in case of error return a static page
//     console.log(error);
//     return caches.match(offlineURL); // returns default offline page
//   }
// }
