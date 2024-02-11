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
