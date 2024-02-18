"use strict";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  auth,
} from "./firebase_auth.js";

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  db,
} from "./firebase_firestore.js";

// reset forms on load ////////////////////////////////////////////
// not working... FIX LATER
window.onload = () => {
  document.querySelectorAll("form").forEach((form) => {
    form.reset();
  });
};

//
// check current log in status /////////////////////////////////
// observe any change on authentication status - this is to get currently logged in user.
onAuthStateChanged(auth, (user) => {
  const loginStatusSpan = document.querySelector(".loginStatus");

  if (user) {
    // when any user is logged in
    const uid = user.uid;
    console.log(user);
    loginStatusSpan.textContent = `Logged in (user ID: ${uid})`;
  } else {
    // when no user is logged in
    console.log("no user logged in");
    loginStatusSpan.textContent = `Logged out`;
  }
});

//
// Sign-up new users //////////////////////////////////////

const btnSignup = document.querySelector("#signup");

// SUGGEST USER'S ADDRESS BASED ON CURRENT LOCATION ==========

if ( navigator.geolocation ) {
  navigator.geolocation.getCurrentPosition(
      (position) => {
          let currentLgt = position.coords.longitude;
          let currentLat = position.coords.latitude;
          const currentLoc = [];
          currentLoc.push(currentLgt);
          currentLoc.push(currentLat);
          console.log(currentLoc);

          async function getAddress (url) {
            let response = await fetch(url);
            let data = await response.json();
            console.log(data);
            document.getElementById("signupaddressdetail").value = data.addresses[0].address.streetNameAndNumber;
            document.getElementById("signupcity").value = data.addresses[0].address.municipality;
            document.getElementById("signuppostalcode").value = data.addresses[0].address.extendedPostalCode;
            var myA = data.addresses[0].address.streetNameAndNumber.split(/(\d+)/g);
            console.log(myA[1]);
            return data;
          }

          // 🚨🚨🚨 Store the data into the DB!!!

          let addressUrl = `https://api.tomtom.com/search/2/reverseGeocode/${currentLat},${currentLgt}.json?key=bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY&radius=100&returnMatchType=AddressPoint`

          getAddress(addressUrl);

          const map = tt.map({
            key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
            container: "map",
            center: currentLoc,
            zoom: 9
          })

          map.on('load', () => {
            var curLocEl = document.createElement("div");
            curLocEl.id = "current-location-marker";
            var currentLocation = new tt.Marker({ element:curLocEl }).setLngLat(currentLoc).addTo(map);
          })
          
      },
      (error) => {
          console.log(error);
          if (error.code == error.PERMISSION_DENIED) {
              window.alert("geolocation permission denied")
          }
      }
  );
} else {
  console.log("Geolocation is not supported by this browser.")
}


// FIX LATER - password validation has to be implemented here (onchange).

btnSignup.onclick = (e) => {
  e.preventDefault();
  const fname = document.querySelector("#signupfname").value;
  const lname = document.querySelector("#signuplname").value;
  const phone = document.querySelector("#signupphone").value;
  const email = document.querySelector("#signupemail").value;
  const addressdetail = document.querySelector("#signupaddressdetail").value;
  const city = document.querySelector("#signupcity").value;
  const postalcode = document.querySelector("#signuppostalcode").value;
  const password = document.querySelector("#signuppassword").value;

  // GEOCODING ADDRESS AND STORE
  let cutAddress = addressdetail.split(" ");
  let houseNum = cutAddress[0];
  let streetName = cutAddress[1];
  for (var i = 2; i < cutAddress.length - 1; i++) {
    streetName += " " + cutAddress[i];
  };
  const geoCodeArray = [];

  async function getGeoCode (url) {
    let response = await fetch(url);
    let data = await response.json();
    console.log(data);
    geoCodeArray.push(data.results[0].position.lon);
    geoCodeArray.push(data.results[0].position.lat);
    console.log(geoCodeArray);
    return data;
  }

  let geocodeUrl = `https://api.tomtom.com/search/2/structuredGeocode.json?key=bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY&countryCode=CA&streetNumber=${houseNum}&streetName=${streetName}&municipality=${city}
  &countrySubdivision=BC`;

  getGeoCode(geocodeUrl);

  // create an account with Firebase auth
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log(userCredential);
      const user = userCredential.user;

      // store user data on Firestore
      const usersRef = collection(db, "users");
      (async () => {
        try {
          await setDoc(doc(usersRef, userCredential.user.uid), {
            address: {
              city: city,
              country: "Canada",
              detail: addressdetail,
              province: "British Columbia",
              zipCode: postalcode,
              geoCode: geoCodeArray,
            },
            contact: {
              email: userCredential.user.email,
              phone: phone,
            },
            userName: {
              firstName: fname,
              lastName: lname,
            },
          });

          window.location.href = "after-login.html";
        } catch (err) {
          console.log(err);
        }
      })();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);
      console.log(errorCode);
      console.log(errorMessage);
    });
};

//
// Log-in users ////////////////////////////////////////////////

const btnLogin = document.querySelector("#login");

btnLogin.onclick = (e) => {
  e.preventDefault();
  const inputEmail = document.querySelector("#loginemail");
  const inputPassword = document.querySelector("#loginpassword");

  const email = inputEmail.value;
  const password = inputPassword.value;

  // log in the user with Firebase auth
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log(userCredential);
      const user = userCredential.user;

      // window.open("after-login.html", "_self");
      window.location.href = "after-login.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);
      console.log(errorCode);
      console.log(errorMessage);
    });
};
