"use strict";
// import from common.js
import * as common from "../../common.js";
// Initialize Firebase---------------
const db = common.db;
// Define variables----------------
// const uid = await common.getCurrentUid();
const uid = "3ZGNxHC1avOoTevnctvkhBMwH962";

console.log(uid);
/// General : Get users in 'usersID'
const userSnap = await common.getDoc(common.doc(db, "users", `${uid}`));
const userDoc = userSnap.data();
let getcheckedItem = userDoc.ongoingRetrievalItems;
// General : Get item (document) in 'inStorage' (subcollection):
const queryStorage = common.collection(db, "users", `${uid}`, "inStorage");
const snapShot = await common.getDocs(queryStorage);

const btnAdd = document.getElementById("btn-add");
const btnRetrieval = document.getElementById("btn-retrieval");

// add action --DISABLED--
// btnAdd.addEventListener("click", async (e) => {
//   e.preventDefault();
//   await common.addOrderSubmitFunction(common.snapShot);
//   window.location.href = "../updates/pickup-and-delivery-updates.html";
// });

// retrieve action
btnRetrieval.addEventListener("click", async (e) => {
  e.preventDefault();
  await common.retrievalOrderSubmitFunction(uid, getcheckedItem, userDoc);

  // Move to the next page
  window.location.href = "../updates/pickup-and-delivery-updates.html";
});
