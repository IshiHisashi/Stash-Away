"use strict";

// Import files
import * as common from "../../common.js";
import { initHeader } from "../homepage/header/header.js";
import { initFooter } from "../homepage/footer/footer.js";
// Initialize Firebase---------------
const db = common.db;
// Define variables----------------
const uid = await common.getCurrentUid();
console.log(uid);
/// General : Get users in 'usersID'
const userSnap = await common.getDoc(common.doc(db, "users", `${uid}`));
const userDoc = userSnap.data();
let getcheckedItem = userDoc.ongoingRetrievalItems;

console.log(getcheckedItem);

// General : Get item (document) in 'inStorage' (subcollection):
const queryStorage = common.collection(db, "users", `${uid}`, "inStorage");
const snapShot = await common.getDocs(queryStorage);

// ---------------------------------
// Related with HTML
const numTotal = document.getElementById("total-num");
const numStored = document.getElementById("stored-num");
const numOnRequest = document.getElementById("on-request-num");
const numRetrieved = document.getElementById("retrieved-num");
const search = document.getElementById("search");
const btnSearch = document.getElementById("btn-search");
const itemList = document.querySelector(".item-list");
const filterBox = document.getElementById("filter-box");
const filterList = document.getElementById("filter-list");
const all = document.getElementById("all");
const stored = document.getElementById("stored");
const retrievalRequested = document.getElementById("retrieval requested");
const retrieved = document.getElementById("retrieved");
const numReturnItems = document.getElementById("num-return-items");
let cArr = null;
const btnRequestReturn = document.getElementById("btn-request-return");

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

const renderList = function (snapShot) {
  snapShot.forEach((doc) => {
    const item = doc.data();
    const itemID = doc.id;
    // Show the list except for before being stored
    if (
      doc.data().status !== "saved" &&
      doc.data().status !== "add requested"
    ) {
      // define date
      const tsStored = item.storedDate.seconds;
      const tsRetrieved = item.retrievedDate?.seconds;
      const storedFullDate = new Date(tsStored * 1000);
      const retrievedFullDate = new Date(tsRetrieved * 1000);
      const storedDate = `${storedFullDate.getFullYear()}/${
        storedFullDate.getMonth() + 1
      }/${storedFullDate.getDate()}`;
      const retrievedDate = `${retrievedFullDate.getFullYear()}/${
        retrievedFullDate.getMonth() + 1
      }/${retrievedFullDate.getDate()}`;

      // Render
      itemList.insertAdjacentHTML(
        "beforeend",
        `<li  class='item-list-li ${
          item.status === "retrieved" ? "retrieved" : ""
        }'><img src='${
          item.picture ? item.picture : ""
        }' class=placeholder-pic alt=${itemID}>
      <p class="item-name">${
        item.itemName
      }</p><div class='desc-wrapper'><p class='date'>Date ${
          item.status === "retrieved" ? "retrieved" : "stored"
        } : ${
          item.status === "retrieved" ? retrievedDate : storedDate
        }</p><p class='item-status ${
          item.status === "stored"
            ? "green"
            : item.status === "retrieval requested"
            ? "red"
            : item.status === "retrieved"
            ? "gray"
            : ""
        }'>  ${
          item.status === "retrieved"
            ? "retrieved"
            : item.status === "retrieval requested"
            ? "on request"
            : item.status === "stored"
            ? "In storage"
            : ""
        }</p></div> <label><input id=check_${itemID} class="checkbox" type="checkbox" ${
          !cArr
            ? getcheckedItem
              ? getcheckedItem.includes(itemID)
                ? "checked"
                : ""
              : ""
            : ""
        }/><span class='checkbox-icon'></span></label>
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
// Item
// Render the number
// count # of items
const numItemTotalArr = [];
const numItemStoredArr = [];
const numItemOnRequestArr = [];
const numItemRetrievedArr = [];
snapShot.forEach((el) => {
  if (el.data().status !== "saved" && el.data().status !== "add requested") {
    numItemTotalArr.push(el.data());
  }
  if (el.data().status === "stored") {
    numItemStoredArr.push(el.data());
  }
  if (el.data().status === "retrieval requested") {
    numItemOnRequestArr.push(el.data());
  }
  if (el.data().status === "retrieved") {
    numItemRetrievedArr.push(el.data());
  }
});

// Then, render it
numTotal.textContent = numItemTotalArr.length;
numStored.textContent = `Stored (${numItemStoredArr.length})`;
numOnRequest.textContent = `On request (${numItemOnRequestArr.length})`;
numRetrieved.textContent = `Retrieved (${numItemRetrievedArr.length})`;

// Render the main list
renderList(snapShot);

// Checkbox
const checkboxes = document.getElementsByClassName("checkbox");
const checkAll = document.getElementById("check-all");
const checkAllIcon = document.getElementById("check-all-icon");
cArr = [];
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
        const i = cArr.indexOf(el.id);
        cArr.splice(i, 1);
      } else {
        cArr.push(el.id);
      }
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

// Check-all
const checkall = function () {
  checkAllIcon.addEventListener("click", (e) => {
    checkAll.checked ? (checkAll.checked = false) : (checkAll.checked = true);
    cArr = [];
    if (checkAll.checked) {
      Array.from(checkboxes).forEach((ch) => {
        if (!ch.disabled) {
          ch.checked = true;
          cArr.push(ch.id);
        }
      });
    } else {
      Array.from(checkboxes).forEach((ch) => {
        if (!ch.disabled) {
          ch.checked = false;
        }
      });
    }
    // update button
    if (cArr.length < 2) {
      numReturnItems.textContent = `(${cArr.length} item)`;
    } else {
      numReturnItems.textContent = `(${cArr.length} items)`;
    }
  });
};
// Execute it
checkall();

// Search
// Create arr
const itemsIDArr = [];
snapShot.forEach((el) => {
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
  // cleanup the html
  cleanupList();
  const numCheckedInSearch = [];
  // Loop over for rendering
  searchItemsIDArr.forEach((el) => {
    const item = el[1];
    const itemID = el[0];
    // Count # of items that fulfill 'searched' and 'checked'.
    cArr.includes(`check_${itemID}`) &&
      numCheckedInSearch.push(`check_${itemID}`);
    // define date
    const tsStored = item.storedDate.seconds;
    const tsRetrieved = item.retrievedDate?.seconds;
    const storedFullDate = new Date(tsStored * 1000);
    const retrievedFullDate = new Date(tsRetrieved * 1000);
    const storedDate = `${storedFullDate.getFullYear()}/${
      storedFullDate.getMonth() + 1
    }/${storedFullDate.getDate()}`;
    const retrievedDate = `${retrievedFullDate.getFullYear()}/${
      retrievedFullDate.getMonth() + 1
    }/${retrievedFullDate.getDate()}`;
    // Rendering
    if (item.status !== "saved" && item.status !== "add requested") {
      itemList.insertAdjacentHTML(
        "beforeend",
        `<li  class='item-list-li ${
          item.status === "retrieved" ? "retrieved" : ""
        }'><img src='${
          item.picture ? item.picture : ""
        }' class=placeholder-pic alt=${itemID}>
      <p class="item-name">${
        item.itemName
      }</p><div class='desc-wrapper'><p class='date'>Date ${
          item.status === "retrieved" ? "retrieved" : "stored"
        } : ${
          item.status === "retrieved" ? retrievedDate : storedDate
        }</p><p class='item-status ${
          item.status === "stored"
            ? "green"
            : item.status === "retrieval requested"
            ? "red"
            : item.status === "retrieved"
            ? "gray"
            : ""
        }'> ${
          item.status === "retrieved"
            ? "retrieved"
            : item.status === "retrieval requested"
            ? "on request"
            : item.status === "stored"
            ? "In storage"
            : ""
        }</p></div><label><input id=check_${itemID} class="checkbox" type="checkbox"/><span class='checkbox-icon'></span></label>
      <span class='icon-span'><i class="fa-regular fa-image icon pic"  id="pic-item${itemID}"></i></span>
        </li>`
      );
    }
    // Disable checkbox if the item is on retrieval request.
    if (
      item.status === "requested" ||
      item.status === "retrieval retrieved" ||
      item.status === "retrieved"
    ) {
      document.getElementById(`check_${itemID}`).disabled = true;
    }
  }); // Update UI for # of checked items as per search results
  if (numCheckedInSearch.length < 2) {
    numReturnItems.textContent = `(${numCheckedInSearch.length} item)`;
  } else {
    numReturnItems.textContent = `(${numCheckedInSearch.length} items)`;
  }
  // checkbox contorol
  recallCheckbox();
  Array.from(checkboxes).forEach((el) => {
    el.addEventListener("change", (e) => {
      e.preventDefault();
      if (cArr.includes(el.id)) {
        const i = cArr.indexOf(el.id);
        const ii = numCheckedInSearch.indexOf(el.id);
        cArr.splice(i, 1);
        numCheckedInSearch.splice(ii, 1);
      } else {
        cArr.push(el.id);
        numCheckedInSearch.push(el.id);
      }
      // update button
      if (numCheckedInSearch.length < 2) {
        numReturnItems.textContent = `(${numCheckedInSearch.length} item)`;
      } else {
        numReturnItems.textContent = `(${numCheckedInSearch.length} items)`;
      }
    });
  });
});

// Filter
// define filtering function
const filtering = function (option) {
  option.addEventListener("click", async (e) => {
    console.log(cArr);
    e.preventDefault();
    cleanupList();
    // update filter box
    filterBox.textContent = option.textContent;
    // hide filter list
    filterList.classList.add("hidden");
    if (option.id === "all") {
      // Render all
      renderList(snapShot);
      // checkbox contorol
      recallCheckbox();
      checkControl();
      // filter reset
      stored.classList.remove("hidden");
      retrievalRequested.classList.remove("hidden");
      retrieved.classList.remove("hidden");
      all.classList.add("hidden");
    } else {
      // retrieve data under a certain filter condition
      const querySnapshot = await common.queryFunction(option.id, uid);
      // Then, render it
      renderList(querySnapshot);
      // checkbox contorol
      recallCheckbox();
      checkControl();
      // filter reset
      all.classList.remove("hidden");
      stored.classList.remove("hidden");
      retrievalRequested.classList.remove("hidden");
      retrieved.classList.remove("hidden");
      option.classList.add("hidden");
    }
  });
};

// Open filter-list
filterBox.addEventListener("click", (e) => {
  e.preventDefault();
  filterList.classList.toggle("hidden");
});

// Execute filtering
filtering(all);
filtering(stored);
filtering(retrievalRequested);
filtering(retrieved);

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
      checkedArr.push(checkedID);
      // May transfer to the other page
      // Extract option#2 : Whole document
      const getItem = await common.getDoc(
        common.doc(db, "users", `${uid}`, "inStorage", `${checkedID}`)
      );
      const itemObj = { [checkedID]: getItem.data() };
      checkedDocs.push(itemObj);
    } else {
    }
  });
  // record it on database tentatively
  await common.recordCheckedFunction(checkedArr, uid);
  // move page
  if (cArr.length === 0) {
    alert("You have not choosen any of stored item");
  }
  if (cArr.length > 0) {
    window.location.href = "../order-confirmation/order-confirmation.html";
  }
});

//
