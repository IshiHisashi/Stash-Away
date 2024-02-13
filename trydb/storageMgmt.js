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
const userName = document.getElementById("userName");
const itemList = document.querySelector(".item-list");
const itemName = document.querySelector(".item-name");
const detailAddress = document.getElementById("detail");
const city = document.getElementById("city");
const province = document.getElementById("province");
const zip = document.getElementById("zip");
const btnRetrieve = document.getElementById("btnRetrieve");
const btnDriver = document.getElementById("btnDriver");

// Firebase handling---------------
// Name
// get data
const docSnap = await getDoc(doc(db, "users", `${userId}`));
const hp = docSnap.data();
const id = docSnap.id;
// Render name
userName.textContent = `${hp.userName.firstName}`;

// Item
// get data
const queryStorage = collection(db, "users", `${userId}`, "inStorage");
const snapShot = await getDocs(queryStorage);
snapShot.forEach((doc) => {
  // Show the list except for saved
  if (doc.data().status !== "saved") {
    const item = doc.data();
    const itemID = doc.id;
    itemList.insertAdjacentHTML(
      "beforeend",
      `<li  class='item-list-li'><input id=check_${itemID} class="checkbox" type="checkbox" />
    <p class="item-name">Box #${item.boxNumber} : ${item.itemName} ${
        doc.data().status === "retrieved"
          ? "| retrieved"
          : doc.data().status === "requested"
          ? "| on request"
          : ""
      }</p> 
    <span class='icon-span'><i class="fa-regular fa-image icon pic"  id="pic-item${itemID}"></i></span>
      </li>`
    );
  }
  // Disable checkbox if the item is on retrieval request.
  if (doc.data().status === "requested" || doc.data().status === "retrieved") {
    document.getElementById(`check_${doc.id}`).disabled = true;
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

// Address
detailAddress.value = hp.address.detail;
city.value = hp.address.city;
province.value = hp.address.province;
zip.value = hp.address.zipCode;

// Checkbox
const checkedArr = [];
const checkedDocs = [];
btnRetrieve.addEventListener("click", async (e) => {
  const checkboxes = document.querySelectorAll("li input");
  e.preventDefault();
  // Process1 : extract checked items and compress them into arr.
  checkboxes.forEach(async (el) => {
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
  });
  // Process4 : Reload the display to reflect change in item status and update list accordingly
  window.location.reload();
});
