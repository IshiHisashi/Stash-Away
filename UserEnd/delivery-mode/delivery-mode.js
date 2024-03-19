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

// HEADER

let user = null;
const basePath = "../";

async function init() {
  try {
    user = await common.getCurrentUserObj();
    updateUIBasedOnUser(user);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

function updateUIBasedOnUser(user) {
  const buttonMyAccount = document.getElementById("btnMyAccount");
  const buttonOrderUpdate = document.getElementById("btnOrderUpdate");
  const buttonViewStorage = document.getElementById("btnViewStorage");
  const buttonProfile = document.getElementById("btnProfile");
  const buttonLogout = document.getElementById("btnLogout");
  const buttonLogin = document.getElementById("btnLogin");
  if (user) {
    console.log(user.uid);
    buttonMyAccount.style.display = "block";
    buttonOrderUpdate.style.display = "block";
    buttonViewStorage.style.display = "block";
    buttonProfile.style.display = "block";
    buttonLogout.style.display = "block";
    buttonLogin.style.display = "none";
  } else {
    console.log("No user is logged in.");
    buttonMyAccount.style.display = "none";
    buttonMyAccount.style.display = "none";
    buttonOrderUpdate.style.display = "none";
    buttonViewStorage.style.display = "none";
    buttonProfile.style.display = "none";
    buttonLogout.style.display = "none";
    buttonLogin.style.display = "block";
  }
}
function toggleDropdown(event) {
  document.getElementById("myDropdown").classList.toggle("show");
  event.stopPropagation();
}

window.onclick = function (event) {
  var dropdowns = document.getElementsByClassName("dropdown-content");
  for (var i = 0; i < dropdowns.length; i++) {
    var openDropdown = dropdowns[i];
    if (openDropdown.classList.contains("show")) {
      openDropdown.classList.remove("show");
    }
  }
};

const isAuthenticated = () => {
  return !!user;
};

init();

const btntoggleMenu = document.getElementById("btntoggleMenu");
if (btntoggleMenu) {
  btntoggleMenu.addEventListener("click", async (e) => {
    e.preventDefault();
    const nav = document.querySelector(".main-menu");
    nav.classList.toggle("active");
  });
}

const btnGeoLocation = document.getElementById("btnGeoLocation");
if (btnGeoLocation) {
  btnGeoLocation.addEventListener("click", async (e) => {
    e.preventDefault();
    window.location.href = `${basePath}home-page-map/index.html`;
  });
}

const btnPricing = document.getElementById("btnPricing");
if (btnPricing) {
  btnPricing.addEventListener("click", function () {
    window.location.href = `${basePath}dummy_payment/dummy_payment.html`;
  });
}

const btnHelpCenter = document.getElementById("btnHelpCenter");
if (btnHelpCenter) {
  btnHelpCenter.addEventListener("click", function () {
    alert("Help Center - Not yet developed!");
  });
}

// const buttonMyAccount = document.querySelector('btnMyAccount');
// if (buttonMyAccount) {
//     buttonMyAccount.addEventListener("click", async (e) => {
//         debugger
//         e.preventDefault();
//         if (window.innerWidth > 600) {
//             var subMenu = e.target.nextElementSibling;
//             subMenu.style.display = subMenu.style.display === 'block' ? 'none' : 'block';
//         }
//     });
// }

const btnOrderUpdate = document.getElementById("btnOrderUpdate");
if (btnOrderUpdate) {
  btnOrderUpdate.addEventListener("click", function () {
    window.location.href = `${basePath}order-confirmation/order-confirmation.html`;
  });
}

const btnViewStorage = document.getElementById("btnViewStorage");
if (btnViewStorage) {
  btnViewStorage.addEventListener("click", function () {
    window.location.href = `${basePath}storage-mgmt/storageMgmt.html`;
  });
}

const btnProfile = document.getElementById("btnProfile");
if (btnProfile) {
  btnProfile.addEventListener("click", function () {
    window.location.href = `${basePath}profile/index.html`;
  });
}

const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", function () {
    common
      .signOut(common.auth)
      .then(() => {
        console.log("signed out");
        window.location.href = "main.html";
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

const btnLogin = document.getElementById("btnLogin");
if (btnLogin) {
  btnLogin.addEventListener("click", function () {
    window.location.href = `${basePath}authentication/login.html`;
  });
}

const btnBookNow = document.getElementById("btnBookNow");
if (btnBookNow) {
  btnBookNow.addEventListener("click", async (e) => {
    e.preventDefault();
    if (isAuthenticated()) {
      window.location.href = `${basePath}booking/booking.html`;
    } else {
      window.location.href = `${basePath}authentication/login.html?returnUrl=${encodeURIComponent(
        `${basePath}booking/booking.html`
      )}`;
    }
  });
}

// const bookNowHero = document.getElementById('bookNowHero');
// if (bookNowHero) {
//     bookNowHero.addEventListener('click', function (event) {
//         event.preventDefault();
//         window.location.href = '../authentication/login.html';
//     });
// }
