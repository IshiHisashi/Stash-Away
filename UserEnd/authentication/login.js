"use strict";

import * as common from "../../common.js";

// load header and footer
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
    // await loadComponent("../homepage/body/body.html", "body-placeholder");
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

// enable log in button
const enableLoginButton = () => {
  // condition: all the required inputs are filled
  const inputArray = Array.from(document.querySelectorAll("input[required]"));
  const condition = inputArray.every((el) => el.value);
  btnLogin.disabled = !condition;
};

enableLoginButton();

document.querySelectorAll("input[required]").forEach((el) => {
  el.oninput = (e) => {
    enableLoginButton();
  };
});

btnLogin.onclick = (e) => {
  e.preventDefault();
  const inputEmail = document.querySelector("#loginemail");
  const inputPassword = document.querySelector("#loginpassword");

  const email = inputEmail.value;
  const password = inputPassword.value;

  if (checkbox.querySelector("input").checked) {
    // remember the user forever unless they log out intentionally - this is defaul behaviour from Firebase auth.
    common
      .signInWithEmailAndPassword(common.auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);
        const user = userCredential.user;
        onLoginSuccess();
      })
      .catch((error) => {
        alert(
          `Log in error! Please check the email or the password. ${error.message}`
        );
      });
  } else {
    // remember the user unless they close the session.
    common
      .setPersistence(common.auth, common.browserSessionPersistence)
      .then(() => {
        common
          .signInWithEmailAndPassword(common.auth, email, password)
          .then((userCredential) => {
            console.log(userCredential);
            const user = userCredential.user;
            onLoginSuccess();
          })
          .catch((error) => {
            alert(
              `Log in error! Please check the email or the password. ${error.message}`
            );
          });
      });
  }

  // log in the user with Firebase auth
};

function getReturnUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("returnUrl");
}

// Simulate the login success logic
function onLoginSuccess() {
  // debugger;
  const returnUrl = getReturnUrl();
  if (returnUrl) {
    window.location.href = decodeURIComponent(returnUrl);
  } else {
    window.location.href = "../homepage/main.html";
  }
}

//
// Reset password ////////////////////////////////////////
const resetLink = document.querySelector("#loginForm > div:last-of-type a");

resetLink.onclick = (e) => {
  e.preventDefault();
  const email = prompt(
    "enter your email here - we will send you a password reset email!"
  );

  common
    .sendPasswordResetEmail(common.auth, email)
    .then(() => {
      alert("password reset email sent!");
    })
    .catch((error) => {
      alert(`Error: ${error.message}`);
    });
};
