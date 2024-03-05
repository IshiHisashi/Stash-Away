"use strict";
import * as common from "../../common.js";

const btnAdd = document.getElementById("btn-add");
const btnRetrieval = document.getElementById("btn-retrieval");

// add action
btnAdd.addEventListener("click", (e) => {
  e.preventDefault();
  common.addOrderSubmitFunction(common.snapShot);
});

// retrieve action
btnRetrieval.addEventListener("click", (e) => {
  e.preventDefault();
  common.retrievalOrderSubmitFunction();
});
