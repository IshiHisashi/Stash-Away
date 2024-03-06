"use strict";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0Px8PkiCzyTrDcFCWh-mbER-YcWd9d-E",
  authDomain: "fir-jan24.firebaseapp.com",
  projectId: "fir-jan24",
  storageBucket: "fir-jan24.appspot.com",
  messagingSenderId: "831417179844",
  appId: "1:831417179844:web:c3eb03b7fc9c6ef7b03391",
  measurementId: "G-DSYKEF99M1",
};

// import from common.js
import * as common from "../../common.js";
// Initialize Firebase---------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Define variables----------------
const userId = "qhH4gTkcc3Z1Q1bKdN0x6cGLoyB3";
const search = document.getElementById("search");
const btnSearch = document.getElementById("btn-search");
const btnSerachDelete = document.getElementById("btn-search-delete");
const itemList = document.querySelector(".item-list");
const filter = document.getElementById("filter");
const numReturnItems = document.getElementById("num-return-items");
const btnRequestReturn = document.getElementById("btn-request-return");
const btnRetrieve = document.getElementById("btnRetrieve");

const renderList = function (snapShot) {
  snapShot.forEach((doc) => {
    const item = doc.data();
    const itemID = doc.id;
    // Show the list except for before being stored
    if (
      doc.data().status !== "saved" &&
      doc.data().status !== "add requested"
    ) {
      itemList.insertAdjacentHTML(
        "beforeend",
        `<li  class='item-list-li'><img src='${
          item.picture ? item.picture : ""
        }' class=placeholder-pic alt=${itemID}>
      <p class="item-name">${item.itemName}</p><p class='item-status'> ${
          item.status === "retrieved"
            ? "retrieved"
            : item.status === "retrieval requested"
            ? "on request"
            : item.status === "stored"
            ? "In storage"
            : ""
        }</p> <input id=check_${itemID} class="checkbox" type="checkbox" ${
          common.getcheckedItem
            ? common.getcheckedItem.includes(itemID)
              ? "checked"
              : ""
            : ""
        }/>
      <span class='icon-span'><i class="fa-regular fa-image icon pic"  id="pic-item${itemID}"></i></span>
        </li>`
      );
    }
    // Disable checkbox if the item is on retrieval request.
    if (item.status === "retrieval requested" || item.status === "retrieved") {
      document.getElementById(`check_${itemID}`).disabled = true;
    }
  });
};

// Firebase handling---------------
// Name
// get data
const docSnap = await getDoc(doc(db, "users", `${userId}`));
const hp = docSnap.data();
const id = docSnap.id;

// Item
// get data
renderList(common.snapShot);

// Checkbox
const checkboxes = document.getElementsByClassName("checkbox");
const cArr = [];
// Arr to register checked input id.
const a = document.querySelectorAll("input[type='checkbox']");
a.forEach((e) => {
  if (e.checked) {
    cArr.push(e.id);
  }
});
// Then render it
if (cArr.length < 2) {
  numReturnItems.textContent = `(${cArr.length} item)`;
} else {
  numReturnItems.textContent = `(${cArr.length} items)`;
}
// Function1 : Check contorol
const checkControl = function () {
  Array.from(checkboxes).forEach((el) => {
    el.addEventListener("change", (e) => {
      e.preventDefault();
      if (cArr.includes(el.id)) {
        cArr.pop(el.id);
      } else {
        cArr.push(el.id);
      }
      console.log(cArr);
      // update button
      if (cArr.length < 2) {
        numReturnItems.textContent = `(${cArr.length} item)`;
      } else {
        numReturnItems.textContent = `(${cArr.length} items)`;
      }
    });
  });
};
// Execute it on global scope
checkControl();
// Function2 : To retrieve checked status under filtering event
const recallCheckbox = function () {
  Array.from(checkboxes).forEach((el) => {
    if (cArr.includes(el.id)) {
      el.setAttribute("checked", "");
    }
  });
};
// Function3 : Cleanup list
const cleanupList = function () {
  while (itemList.firstChild) {
    itemList.removeChild(itemList.firstChild);
  }
};

// Search_revision
// Create arr
const itemsIDArr = [];
common.snapShot.forEach((el) => {
  const itemArr = [el.id, el.data()];
  itemsIDArr.push(itemArr);
});
// Event
btnSearch.addEventListener("click", (e) => {
  e.preventDefault();
  // Filter based on search
  const searchItemsIDArr = itemsIDArr.filter((el) => {
    return el[1].itemName.toLowerCase().includes(search.value.toLowerCase());
  });
  // Rendering (hard-code for now, as rendering funcition cannot be used)
  cleanupList();
  searchItemsIDArr.forEach((el) => {
    const item = el[1];
    const itemID = el[0];
    if (item.status !== "saved" && item.status !== "add requested") {
      itemList.insertAdjacentHTML(
        "beforeend",
        `<li  class='item-list-li'><img src='${
          item.picture ? item.picture : ""
        }' class=placeholder-pic alt=${itemID}>
      <p class="item-name">${item.itemName}</p><p class='item-status'> ${
          item.status === "retrieved"
            ? "retrieved"
            : item.status === "retrieval requested"
            ? "on request"
            : item.status === "stored"
            ? "In storage"
            : ""
        }</p> <input id=check_${itemID} class="checkbox" type="checkbox"/>
      <span class='icon-span'><i class="fa-regular fa-image icon pic"  id="pic-item${itemID}"></i></span>
        </li>`
      );
    }
    // Disable checkbox if the item is on retrieval request.
    if (item.status === "requested" || item.status === "retrieval retrieved") {
      document.getElementById(`check_${itemID}`).disabled = true;
    }
  });
  // checkbox contorol
  recallCheckbox();
  checkControl();
});

// Delete search
btnSerachDelete.addEventListener("click", (e) => {
  e.preventDefault();
  // Render
  cleanupList();
  renderList(common.snapShot);
  // checkbox contorol
  recallCheckbox();
  checkControl();
});

// Filtering
filter.addEventListener("change", async (e) => {
  e.preventDefault();
  cleanupList();
  const conditionValue = filter.value;
  if (conditionValue === "all") {
    // Render all
    renderList(common.snapShot);
    // checkbox contorol
    recallCheckbox();
    checkControl();
  } else {
    // retrieve data under a certain filter condition
    const querySnapshot = await common.queryFunction(conditionValue);
    // Then, render it
    renderList(querySnapshot);
    // checkbox contorol
    recallCheckbox();
    checkControl();
  }
});

// Checkbox
const checkedArr = [];
const checkedDocs = [];

// Save the checked items into arr
btnRequestReturn.addEventListener("click", async (e) => {
  e.preventDefault();

  Array.from(checkboxes).forEach(async (el) => {
    if (el.checked) {
      // Extract option#1 : Simple Arr with IDs
      const checkedID = el.id.split("_")[1];
      console.log(checkedID);
      checkedArr.push(checkedID);
      // May transfer to the other page
      // Extract option#2 : Whole document
      const getItem = await getDoc(
        doc(db, "users", `${userId}`, "inStorage", `${checkedID}`)
      );
      const itemObj = { [checkedID]: getItem.data() };
      checkedDocs.push(itemObj);
      console.log(checkedArr, checkedDocs);
    } else {
    }
  });
  // record it on database tentatively
  await common.recordCheckedFunction(checkedArr);
  // move page
  window.location.href = "../order-confirmation/order-confirmation.html";
});