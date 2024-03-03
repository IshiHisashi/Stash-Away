"use strict";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
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
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0Px8PkiCzyTrDcFCWh-mbER-YcWd9d-E",
  authDomain: "fir-jan24.firebaseapp.com",
  projectId: "fir-jan24",
  storageBucket: "fir-jan24.appspot.com",
  messagingSenderId: "831417179844",
  appId: "1:831417179844:web:c3eb03b7fc9c6ef7b03391",
  measurementId: "G-DSYKEF99M1",
};

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
        }</p> <input id=check_${itemID} class="checkbox" type="checkbox"/>
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
const queryStorage = collection(db, "users", `${userId}`, "inStorage");
const snapShot = await getDocs(queryStorage);
renderList(snapShot);

// Checkbox
const checkboxes = document.getElementsByClassName("checkbox");
// Arr to register checked input id.
const cArr = [];
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
    const q = query(
      collection(db, "users", `${userId}`, "inStorage"),
      where("status", "==", conditionValue)
    );
    const querySnapshot = await getDocs(q);
    renderList(querySnapshot);
    // checkbox contorol
    recallCheckbox();
    checkControl();
  }
});

// Get camera id (on click the camera icon)
const elementsCamera = document.querySelectorAll(".pic");
elementsCamera.forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    console.log(e.target.id);
  });
});

// Checkbox
const checkedArr = [];
const checkedDocs = [];
btnRetrieve.addEventListener("click", async (e) => {
  e.preventDefault();
  // Process1 : extract checked items and compress them into arr.
  Array.from(checkboxes).forEach(async (el) => {
    if (el.checked) {
      // Extract option#1 : Simple Arr with IDs
      const checkedID = el.id.split("_")[1];
      console.log(checkedID);
      checkedArr.push(checkedID);
      // Extract option#2 : Whole document
      const getItem = await getDoc(
        doc(db, "users", `${userId}`, "inStorage", `${checkedID}`)
      );
      const itemObj = { [checkedID]: getItem.data() };
      checkedDocs.push(itemObj);
      // PROCESS2 : Update status
      await updateDoc(
        doc(db, "users", `${userId}`, "inStorage", `${checkedID}`),
        { status: "retrieval requested" }
      );
    } else {
    }
  });
  // Extract#1 : Simple Arr with IDs
  console.log(checkedArr);
  // Extract#2 : Whole document
  console.log(checkedDocs);

  // Process3 : Generate Order subcollection and its document
  await addDoc(collection(db, "users", `${userId}`, "order"), {
    userId: `${docSnap.id}`,
    userName: {
      firstName: `${hp.userName.firstName}`,
      lastName: `${hp.userName.lastName}`,
    },
    driverId: "",
    itemKey: checkedArr,
    orderDate: "2024-01-31",
    orderType: "retrieval",
    status: "requested",
    address: {
      detail: `${detailAddress.value}`,
      city: `${city.value}`,
      province: `${province.value}`,
      zipCode: `${zip.value}`,
    },
    storageLocation: {
      latitude: `${hp.storageLocation.latitude}`,
      longitude: `${hp.storageLocation.longitude}`,
      name: `${hp.storageLocation.name}`,
    },
  });
  // Process4 : Reload the display to reflect change in item status and update list accordingly
  window.location.reload();
});
