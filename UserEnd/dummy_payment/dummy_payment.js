"use strict";
import * as common from "../../common.js";

const btnCheckOut = document.getElementById("btn-checkout");

btnCheckOut.addEventListener("click", (e) => {
  e.preventDefault();
  common.addOrderSubmitFunction(common.snapShot);
});
