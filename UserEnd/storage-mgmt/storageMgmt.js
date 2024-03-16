"use strict";

// import from common.js
import * as common from "../../common.js";
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
const btnSerachDelete = document.getElementById("btn-search-delete");
const itemList = document.querySelector(".item-list");
const filter = document.getElementById("filter");
const numReturnItems = document.getElementById("num-return-items");
const btnRequestReturn = document.getElementById("btn-request-return");

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
        }</p></div> <input id=check_${itemID} class="checkbox" type="checkbox" ${
          getcheckedItem
            ? getcheckedItem.includes(itemID)
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
numStored.textContent = numItemStoredArr.length;
numOnRequest.textContent = numItemOnRequestArr.length;
numRetrieved.textContent = numItemRetrievedArr.length;

// Render the main list
renderList(snapShot);

// Checkbox
const checkboxes = document.getElementsByClassName("checkbox");
let cArr = [];
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
        `<li  class='item-list-li'><img src='${
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
        }</p></div><input id=check_${itemID} class="checkbox" type="checkbox"/>
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

// Delete search
btnSerachDelete.addEventListener("click", (e) => {
  e.preventDefault();
  // Render
  cleanupList();
  renderList(snapShot);
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
    renderList(snapShot);
    // checkbox contorol
    recallCheckbox();
    checkControl();
  } else {
    // retrieve data under a certain filter condition
    const querySnapshot = await common.queryFunction(conditionValue, uid);
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
