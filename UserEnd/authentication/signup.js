"use strict";

import * as common from "../../common.js";

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

// checkbox behaviour
const checkboxStyled = document.querySelector(
  "form > div:nth-of-type(11) span"
);
const checkboxActual = document.querySelector(
  "form > div:nth-of-type(11) input"
);
const checkboxContainer = document.querySelector("form > div:nth-of-type(11)");
checkboxContainer.onclick = (e) => {
  checkboxActual.checked = !checkboxActual.checked;
  checkboxStyled.querySelector("img").src = checkboxActual.checked
    ? "icons/check_red.svg"
    : "";
};

// reset forms on load ////////////////////////////////////////////
// not working... FIX LATER
window.onload = () => {
  document.querySelectorAll("form").forEach((form) => {
    form.reset();
  });
};

//
// check current log in status /////////////////////////////////
const uid = await common.getCurrentUid();
if (uid) {
  console.log(`Logged in (user ID: ${uid})`);
} else {
  console.log(`Logged out`);
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
      // console.log(currentLoc);

      async function getAddress(url) {
        let response = await fetch(url);
        let data = await response.json();
        // console.log(data);
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

// password validation: must be more than six character
const password = document.querySelector("#signuppassword");
password.onchange = (e) => {
  if (e.target.value.length < 6) {
    document.querySelector("form > div:nth-of-type(9) p").classList.add("show");
    document.querySelector("form > div:nth-of-type(9) input").style.border =
      "1px solid var(--alert)";
  } else {
    document
      .querySelector("form > div:nth-of-type(9) p")
      .classList.remove("show");
    document.querySelector("form > div:nth-of-type(9) input").style.border =
      "1px solid var(--grey-2)";
  }
};

// password confirmation
const passwordRe = document.querySelector("#signuppassword-re");
passwordRe.onchange = (e) => {
  if (e.target.value !== password.value) {
    document
      .querySelector("form > div:nth-of-type(10) p")
      .classList.add("show");
    document.querySelector("form > div:nth-of-type(10) input").style.border =
      "1px solid var(--alert)";
  } else {
    document
      .querySelector("form > div:nth-of-type(10) p")
      .classList.remove("show");
    document.querySelector("form > div:nth-of-type(10) input").style.border =
      "1px solid var(--grey-2)";
  }
};

// enable create account button
document
  .querySelector("#signupForm")
  .querySelectorAll("[required]")
  .forEach((el) => {
    el.oninput = (e) => {
      console.log(e);
      // condition 1: all the required inputs are filled
      const inputArray = Array.from(
        document.querySelector("#signupForm").querySelectorAll("[required]")
      );
      const condition1 = inputArray.every((el) => el.value);

      // condition 2: password validation and confirmation are ok
      const condition2 = !document.querySelector(".show");

      // condition 3: agree checkbox value is true
      const condition3 = document.querySelector("#agree").checked;

      btnSignup.disabled = !(condition1 & condition2 & condition3);
    };
  });

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
  common
    .createUserWithEmailAndPassword(common.auth, email, password)
    .then((userCredential) => {
      console.log(userCredential);
      const user = userCredential.user;

      (async () => {
        try {
          // email verification ///////////////
          const actionCodeSettings = null;
          await common.sendEmailVerification(user, actionCodeSettings);

          // phone number verification ///////////////
          // !!!! SMS daily quota for a free account is 10/day !!!!
          // You can use fictional phone numbers for testing: https://firebase.google.com/docs/auth/web/phone-auth?hl=en&authuser=1&_gl=1*9gny7c*_up*MQ..*_ga*MjA1ODE1NjUyNy4xNzA4MzU4MzYy*_ga_CW55HF8NVT*MTcwODM1ODM2MS4xLjAuMTcwODM1ODM2MS4wLjAuMA..#test-with-fictional-phone-numbers

          // SMS sending issue fixed - be aware of authorized domains!

          common.auth.useDeviceLanguage();
          window.recaptchaVerifier = new common.RecaptchaVerifier(
            common.auth,
            "signup",
            {
              size: "invisible",
              callback: (response) => {
                onSignInSubmit();
              },
            }
          );

          const appVerifier = window.recaptchaVerifier;
          common
            .linkWithPhoneNumber(user, phone, appVerifier)
            .then((confirmationResult) => {
              // SMS sent.
              console.log(confirmationResult);
              window.confirmationResult = confirmationResult;

              document.querySelector("#signupForm").style.display = "none";
              document
                .querySelector("#phoneVerificationForm")
                .classList.add("show");

              // enable submit code button
              const code = document.querySelector("#code");
              const btnVerify = document.querySelector("#phoneVerification");
              code.oninput = (e) => {
                console.log(e);
                btnVerify.disabled = !e.target.value;
              };

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

                window.location.href = "../home-page-map/index.html";

                return confirmation;
              };
            })
            .catch((error) => {
              // SMS not sent.
              window.recaptchaVerifier.render().then(function (widgetId) {
                grecaptcha.reset(widgetId);
              });
              alert(`Failed to send SMS. Please try again. ${error.message}`);
            });

          // window.location.href = "after-login.html";
        } catch (error) {
          console.log(error);
          alert(
            `Failed to send a verification email. Please try again. ${error.message}`
          );
        }
      })();
    })
    .catch((error) => {
      alert(`Failed to create an account. Please try again. ${error.message}`);
    });
};
