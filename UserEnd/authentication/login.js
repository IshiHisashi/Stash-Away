"use strict";

import * as common from "../../common.js";

// checkbox behaviour
const checkbox = document.querySelector("form > div:last-of-type > div");
checkbox.onclick = (e) => {
  e.preventDefault();
  checkbox.querySelector("input").checked = checkbox.querySelector("input")
    .checked
    ? false
    : true;

  checkbox.querySelector("span img").src = checkbox.querySelector("input")
    .checked
    ? "icons/check_red.svg"
    : "";
};

// determine the page to return to after loggin in
const pageToReturn = sessionStorage.getItem("pageToReturn")
  ? sessionStorage.getItem("pageToReturn")
  : "../homepage/main.html";

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
// Log-in users ////////////////////////////////////////////////

const btnLogin = document.querySelector("#login");

btnLogin.onclick = (e) => {
  e.preventDefault();
  const inputEmail = document.querySelector("#loginemail");
  const inputPassword = document.querySelector("#loginpassword");

  const email = inputEmail.value;
  const password = inputPassword.value;

  // log in the user with Firebase auth
  common
    .signInWithEmailAndPassword(common.auth, email, password)
    .then((userCredential) => {
      console.log(userCredential);
      const user = userCredential.user;
      debugger
      // window.location.href = pageToReturn;
      onLoginSuccess();
      // window.open("after-login.html", "_self");
    })
    .catch((error) => {
      alert(
        `Log in error! Please check the email or the password. ${error.message}`
      );
    });
};

function getReturnUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('returnUrl');
}

// Simulate the login success logic
function onLoginSuccess() {
  debugger
    const returnUrl = getReturnUrl();
    if (returnUrl) {
        window.location.href = decodeURIComponent(returnUrl);
    } else {
      window.location.href = "../homepage/main.html";
    }
}
