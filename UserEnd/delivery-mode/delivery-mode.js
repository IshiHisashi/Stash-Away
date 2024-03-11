"use strict";

import * as common from "../../common.js";
const address = document.getElementById("address-p");
const phone = document.getElementById("phone-p");
const date = document.getElementById("date-p");
const time = document.getElementById("time-p");

// DB
const userDoc = common.userDoc;
console.log(userDoc);

// Date handling
Date.prototype.addDays = function (days) {
  let date = new Date(common.ts * 1000);
  date.setDate(date.getDate() + days);
  return date;
};
const nextFullDate = common.nowFullDate.addDays(1);
const nextDay = `${nextFullDate.getFullYear()}/${
  nextFullDate.getMonth() + 1
}/${nextFullDate.getDate()}`;

// Render info
address.textContent = `${userDoc.address.detail} ${userDoc.address.city}, ${userDoc.address.province} ${userDoc.address.zipCode}`;
phone.textContent = `${userDoc.contact.phone}`;
date.textContent = nextDay;
time.textContent = "5:00 PM";
