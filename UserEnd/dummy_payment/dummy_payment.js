"use strict";
import * as commonDB from "../../commonDB.js";

const btnCheckOut = document.getElementById("btn-checkout");
const orderedArrID = [];

btnCheckOut.addEventListener("click", (e) => {
  e.preventDefault();
  commonDB.orderSubmitFunction(commonDB.snapShot);
});
