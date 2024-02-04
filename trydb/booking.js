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

// define variable / fnc ------------
// var_DoM
const userId = "qhH4gTkcc3Z1Q1bKdN0x6cGLoyB3";
const firstname = document.getElementById("firstname");
const lastname = document.getElementById("lastname");
const selectedPlan = document.getElementById("storagePlan");
const price = document.getElementById("price");
const item = document.getElementById("item");
const itemList = document.getElementById("item-list");
const detailAddress = document.getElementById("detail");
const city = document.getElementById("city");
const province = document.getElementById("province");
const zip = document.getElementById("zip");
// console.log(item.value);

const btnSubmit = document.getElementById("btnSubmit");
const btnSave = document.getElementById("btnSave");
const btnLoad = document.getElementById("btnLoad");

// Firebase handling---------------
// Get User document
const docSnap = await getDoc(doc(db, "users", `${userId}`));
const userDoc = docSnap.data();

// Render name
firstname.value = userDoc.userName.firstName;
lastname.value = userDoc.userName.lastName;

// Plan : rendered once it's selected. => NOT WORKING NOW
// selectedPlan.addEventListener("change", async (e) => {
//   currentPlan = e.target.value;
//   // Get info. from corporate DB
//   if (currentPlan === "plan1" || currentPlan === "plan2") {
//     const docPlan = await getDoc(doc(db, "plans", currentPlan));
//     const plan = docPlan.data();
//     price.innerText = `$${plan.price}`;
//   } else {
//     price.innerText = "";
//   }
// });

// Save data
btnSave.addEventListener("click", async function (e) {
  e.preventDefault();
  const inputItemName = item.value;
  const queryStorage = query(collection(db, "users", `${userId}`, "inStorage"));
  const storage = await getDocs(queryStorage);
  // store data
  await addDoc(collection(db, "users", `${userId}`, "inStorage"), {
    boxNumber: storage.docs.length + 1,
    itemName: inputItemName,
    picture: "picture url",
    storedDate: "2024-01-31",
    status: "saved",
  });
});

// Load data
btnLoad.addEventListener("click", async function (e) {
  e.preventDefault();
  itemList.innerHTML = "";
  const queryStorage = collection(db, "users", `${userId}`, "inStorage");
  const snapShot = await getDocs(queryStorage);
  snapShot.forEach((doc) => {
    if (doc.data().status === "saved") {
      const item = doc.data();
      const itemID = doc.id;
      itemList.insertAdjacentHTML(
        "beforeend",
        `<li class='item-list-li'><p>${item.itemName}</p> <span class='icon-span'><i class="fa-regular fa-image icon pic" id="picitem_${itemID}"></i><i class="fa-solid fa-trash icon delete" id="deleteitem_${itemID}"></i></span></li>`
      );
    }
  });
  // Camera access ---coming sonn...----
  const elementsCamera = document.querySelectorAll(".pic");
  elementsCamera.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      console.log(e.target.id);
    });
  });

  // Delete function
  const elementsDelete = document.querySelectorAll(".delete");
  elementsDelete.forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      // delete
      const deleteID = e.target.id.split("_")[1];
      await deleteDoc(
        doc(db, "users", `${userId}`, "inStorage", `${deleteID}`)
      );
      console.log(`${e.target.id} is deleted`);

      // re-render => coming soon...
      const blank = async function () {
        console.log(elementsDelete);
      };
      const blankExe = await blank();
    });
  });
});

// Delivery info.
detailAddress.value = userDoc.address.detail;
city.value = userDoc.address.city;
province.value = userDoc.address.province;
zip.value = userDoc.address.zipCode;

// Submit data
btnSubmit.addEventListener("click", async (e) => {
  e.preventDefault();
  const batch = writeBatch(db);
  const queryStorage = collection(db, "users", `${userId}`, "inStorage");
  const snapShot = await getDocs(queryStorage);
  const orderedArrID = [];

  snapShot.forEach((doc) => {
    if (doc.data().status === "saved") {
      let docid = doc.id;
      // update status
      batch.update(doc.ref, {
        status: "stored",
      });
      // push to arr
      const updatedItem = [docid];
      orderedArrID.push(updatedItem);
    }
  });
  await batch.commit();
  // get updated data and create an object array
  const orderedArrItem = [];
  orderedArrID.forEach(async (id) => {
    const queryUpdatedItem = doc(
      db,
      "users",
      `${userId}`,
      "inStorage",
      `${id}`
    );
    const snapShot = await getDoc(queryUpdatedItem);
    const itemData = snapShot.data();
    const idAndData = { [id]: itemData };
    orderedArrItem.push(idAndData);
  });
  console.log(orderedArrItem);
});

// ----------------------------------------

// Another way of getting data from Subcollection --------------------
// const queryStorage = query(collectionGroup(db, "inStorage"));
// const storage = await getDocs(queryStorage);
// // Render list
// await storage.docs.forEach(async (doc) => {
//   const itemInfo = doc._document.data.value.mapValue.fields;
//   console.log(itemInfo);
//   itemList.insertAdjacentHTML(
//     "beforeend",
//     `<li class='item-list-li'><p>Item #${itemInfo.boxNumber.integerValue} | ${itemInfo.itemName.stringValue}</p> <span class='icon-span'><i class="fa-regular fa-image icon"></i><i class="fa-solid fa-xmark icon"></i></span></li>`
//   );
// });
