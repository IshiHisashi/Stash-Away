"use strict";

import * as common from "../../common.js";
// Initialize Firebase---------------
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
const db = common.db;
// Define variables----------------
const uid = await common.getCurrentUid();

// Firebase handling---------------
// Get storage data from company collection
const storageQuery = await common.getDoc(
  common.doc(db, "Company", "storageLocation")
);
export const storageLocationObj = storageQuery.data();
export const storageLocationArr = Object.entries(storageQuery.data());

// Get address info from user's collection
const userQuery = await common.getDoc(common.doc(db, "users", uid));
export const userAddress = userQuery.data().address;

// Send selected geolocation
export const updateStorageLocation = async function (obj) {
  await common.updateDoc(common.doc(db, "users", uid), {
    "storageLocation.name": obj.name,
    "storageLocation.longitude": obj.geoLoc[0],
    "storageLocation.latitude": obj.geoLoc[1],
  });
};
