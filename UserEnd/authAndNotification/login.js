"use strict";

import {
  getCurrentUid,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  auth,
  sendEmailVerification,
  RecaptchaVerifier,
  linkWithPhoneNumber,
  applyActionCode,
} from "../../common.js";

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
const loginStatusSpan = document.querySelector(".loginStatus");
const uid = await getCurrentUid();
if (uid) {
  loginStatusSpan.textContent = `Logged in (user ID: ${uid})`;
} else {
  loginStatusSpan.textContent = `Logged out`;
}

//
// Sign-up new users //////////////////////////////////////

const btnSignup = document.querySelector("#signup");

// SUGGEST USER'S ADDRESS BASED ON CURRENT LOCATION ==========

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      let currentLgt = position.coords.longitude;
      let currentLat = position.coords.latitude;
      const currentLoc = [];
      currentLoc.push(currentLgt);
      currentLoc.push(currentLat);
      console.log(currentLoc);

      async function getAddress(url) {
        let response = await fetch(url);
        let data = await response.json();
        console.log(data);
        if (data.addresses[0].address.streetNameAndNumber) {
          document.getElementById("signupaddressdetail").value =
            data.addresses[0].address.streetNameAndNumber;
        } else if (data.addresses[0].address.streetName) {
          document.getElementById("signupaddressdetail").value =
            data.addresses[0].address.streetName;
        } else if (data.addresses[0].address.street) {
          document.getElementById("signupaddressdetail").value =
            data.addresses[0].address.street;
        }
        if (data.addresses[0].address.municipality) {
          document.getElementById("signupcity").value =
            data.addresses[0].address.municipality;
        }
        if (data.addresses[0].address.extendedPostalCode) {
          document.getElementById("signuppostalcode").value =
            data.addresses[0].address.extendedPostalCode;
        } else if (data.addresses[0].address.postalCode) {
          document.getElementById("signuppostalcode").value =
            data.addresses[0].address.postalCode;
        }
        return data;
      }

      let addressUrl = `https://api.tomtom.com/search/2/reverseGeocode/${currentLat},${currentLgt}.json?key=bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY&radius=100&returnMatchType=AddressPoint`;

      getAddress(addressUrl);

      // const map = tt.map({
      //   key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
      //   container: "map",
      //   center: currentLoc,
      //   zoom: 9,
      // });

      // map.on("load", () => {
      //   var curLocEl = document.createElement("div");
      //   curLocEl.id = "current-location-marker";
      //   var currentLocation = new tt.Marker({ element: curLocEl })
      //     .setLngLat(currentLoc)
      //     .addTo(map);
      // });
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

// FIX LATER - password validation has to be implemented here (onchange).

btnSignup.onclick = (e) => {
  e.preventDefault();
  const fname = document.querySelector("#signupfname").value;
  const lname = document.querySelector("#signuplname").value;
  const phone = document.querySelector("#signupphone").value;
  const email = document.querySelector("#signupemail").value;
  const roomNumEtc = document.querySelector("#signuproomnumberetc").value;
  const addressdetail = document.querySelector("#signupaddressdetail").value;
  const city = document.querySelector("#signupcity").value;
  const postalcode = document.querySelector("#signuppostalcode").value;
  const password = document.querySelector("#signuppassword").value;

  // GEOCODING ADDRESS AND STORE
  const geoCodeArray = [];
  let wholeAddress = `${addressdetail}, ${city}, Britich Columbia`;
  tt.services
    .geocode({
      key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
      query: wholeAddress,
    })
    .then((response) => {
      console.log(response);
      let userLat = response.results[0].position.lat;
      let userLon = response.results[0].position.lng;
      geoCodeArray.push(userLon);
      geoCodeArray.push(userLat);
      console.log(geoCodeArray);
    });

  // create an account with Firebase auth
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log(userCredential);
      const user = userCredential.user;

      (async () => {
        try {
          // email verification ///////////////
          const actionCodeSettings = null;
          await sendEmailVerification(user, actionCodeSettings);

          // phone number verification ///////////////
          // !!!! SMS daily quota for a free account is 10/day !!!!
          // You can use fictional phone numbers for testing: https://firebase.google.com/docs/auth/web/phone-auth?hl=en&authuser=1&_gl=1*9gny7c*_up*MQ..*_ga*MjA1ODE1NjUyNy4xNzA4MzU4MzYy*_ga_CW55HF8NVT*MTcwODM1ODM2MS4xLjAuMTcwODM1ODM2MS4wLjAuMA..#test-with-fictional-phone-numbers

          // SMS sending issue fixed - be aware of authorized domains!

          auth.useDeviceLanguage();
          window.recaptchaVerifier = new RecaptchaVerifier(auth, "signup", {
            size: "invisible",
            callback: (response) => {
              onSignInSubmit();
            },
          });

          const appVerifier = window.recaptchaVerifier;
          linkWithPhoneNumber(user, phone, appVerifier)
            .then((confirmationResult) => {
              // SMS sent.
              console.log(confirmationResult);
              window.confirmationResult = confirmationResult;

              document.querySelector("#signupForm").style.display = "none";
              // document.querySelector(".map-container").style.display = "none";
              document.querySelector("#loginForm").style.display = "none";
              document
                .querySelector("#phoneVerificationForm")
                .classList.add("show");

              const btnVerify = document.querySelector("#phoneVerification");

              btnVerify.onclick = async (e) => {
                e.preventDefault();
                const code = document.querySelector("#code").value;

                const confirmation = await confirmationResult.confirm(code);

                // store user data on Firestore ////////////////
                const usersRef = collection(db, "users");
                await setDoc(doc(usersRef, user.uid), {
                  address: {
                    city: city,
                    country: "Canada",
                    detail: addressdetail,
                    roomNumEtc: roomNumEtc,
                    province: "British Columbia",
                    zipCode: postalcode,
                    geoCode: geoCodeArray,
                  },
                  contact: {
                    email: user.email,
                    phone: user.phoneNumber,
                  },
                  userName: {
                    firstName: fname,
                    lastName: lname,
                  },
                  firstVisit: true,
                });

                window.location.href = "after-login.html";

                return confirmation;
              };
            })
            .catch((error) => {
              // SMS not sent.
              console.log(error);
              window.recaptchaVerifier.render().then(function (widgetId) {
                grecaptcha.reset(widgetId);
              });
            });

          // window.location.href = "after-login.html";
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
