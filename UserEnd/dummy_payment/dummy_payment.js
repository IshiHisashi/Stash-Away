"use strict";
import * as common from "../../common.js";

const btnAdd = document.getElementById("btn-add");
const btnRetrieval = document.getElementById("btn-retrieval");

btnAdd.addEventListener("click", (e) => {
  e.preventDefault();
  common.addOrderSubmitFunction(common.snapShot);
});

btnRetrieval.addEventListener("click", (e) => {
  e.preventDefault();
  common.retrievalOrderSubmitFunction();
});
