"use strict";
import * as common from "../../common.js";

const btnAdd = document.getElementById("btn-add");
const btnRetrieval = document.getElementById("btn-retrieval");

// add action
btnAdd.addEventListener("click", async (e) => {
  e.preventDefault();
  await common.addOrderSubmitFunction(common.snapShot);
  window.location.href = "../updates/pickup-and-delivery-updates.html";
});

// retrieve action
btnRetrieval.addEventListener("click", async (e) => {
  e.preventDefault();
  await common.retrievalOrderSubmitFunction();
  window.location.href = "../updates/pickup-and-delivery-updates.html";
});
