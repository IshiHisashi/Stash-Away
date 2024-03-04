"use strict";
// import from common.js
import * as common from "../../common.js";

const itemList = document.getElementById("item-list");

// render List
common.renderCheckedItem(itemList);

// delete item
const elementsDelete = document.getElementsByClassName("delete");
console.log(elementsDelete);
