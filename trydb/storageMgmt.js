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
  if (doc.data().storedDate !== "saved") {
    const item = doc.data();
    itemList.insertAdjacentHTML(
      "beforeend",
      `<li  class='item-list-li'><input id=check_${doc.id} class="checkbox" type="checkbox" />
    <p class="item-name">Box #${item.boxNumber} : ${item.itemName} </p> <span class='icon-span'><i class="fa-regular fa-image icon pic-item${item.boxNumber}"></i></span>
      </li>`
    );
  }
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
        { status: "requested" }
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
});
