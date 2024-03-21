"use strict";

// Import files
import * as common from "../../common.js";
import { initHeader } from "../homepage/header/header.js";
import { initFooter } from "../homepage/footer/footer.js";
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

// Rendering
// Header & Footer
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

// Delivery-Info
address.textContent = `${userDoc.address.detail} ${userDoc.address.city}, ${userDoc.address.province} ${userDoc.address.zipCode}`;
phone.textContent = `${userDoc.contact.phone}`;
date.textContent = common.nextDay;
time.textContent = "5:00 PM";
