"use strict";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getFirestore,
  collection,
  collectionGroup,
  query,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
import * as common from "../../common.js";

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
const userId = await common.getCurrentUid();

// Firebase handling---------------
// Get storage data from company collection
const storageQuery = await getDoc(doc(db, "Company", "storageLocation"));
export const storageLocationObj = storageQuery.data();
export const storageLocationArr = Object.entries(storageQuery.data());

// Get address info from user's collection
const userQuery = await getDoc(doc(db, "users", `${userId}`));
export const userAddress = userQuery.data().address;

// Send selected geolocation
export const updateStorageLocation = async function (obj) {
  await updateDoc(doc(db, "users", `${userId}`), {
    "storageLocation.name": obj.name,
    "storageLocation.longitude": obj.geoLoc[0],
    "storageLocation.latitude": obj.geoLoc[1],
  });
};
