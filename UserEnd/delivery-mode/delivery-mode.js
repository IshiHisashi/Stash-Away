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
