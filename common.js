"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0Px8PkiCzyTrDcFCWh-mbER-YcWd9d-E",
  authDomain: "fir-jan24.firebaseapp.com",
  projectId: "fir-jan24",
  storageBucket: "fir-jan24.appspot.com",
  messagingSenderId: "831417179844",
  appId: "1:831417179844:web:c3eb03b7fc9c6ef7b03391",
  measurementId: "G-DSYKEF99M1",
};

const app = initializeApp(firebaseConfig);

// Authentication //////////////////////////////////////////////////////////////////////////

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export const auth = getAuth(app);

export const getCurrentUid = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (authUser) => {
      resolve(authUser ? authUser.uid : null);
    });
  });
};

export const getCurrentUserObj = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (authUser) => {
      resolve(authUser ? authUser : null);
    });
  });
};

export {
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  linkWithPhoneNumber,
  applyActionCode,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Database //////////////////////////////////////////////////////////////////////////
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
  deleteField,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export {
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
  deleteField,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const db = getFirestore(app);
// Fixex user
export const userId = "3ZGNxHC1avOoTevnctvkhBMwH962";
// Authed user
// export const userId = await getCurrentUid();

// -----READ-----
// General : Get company info
const companyPlanSnap = await getDoc(doc(db, "Company", "plan"));
const companyStorageLocationSnap = await getDoc(
  doc(db, "Company", "storageLocation")
);
export const companyPlanDoc = companyPlanSnap.data();
export const companyStorageLocationDoc = companyStorageLocationSnap.data();

// General : Get users in 'usersID'
const userSnap = await getDoc(doc(db, "users", `${userId}`));
export const userDoc = userSnap.data();

// General : Get item (document) in 'inStorage' (subcollection):
export const queryStorage = collection(db, "users", `${userId}`, "inStorage");
export const snapShot = await getDocs(queryStorage);
//

// Update and Create
// Booking : Order submitted
export const addOrderSubmitFunction = async function (snapShot) {
  const batch = writeBatch(db);
  const orderedArrID = [];
  snapShot.forEach((doc) => {
    if (doc.data().status === "saved") {
      let docid = doc.id;
      // Update status
      batch.update(doc.ref, {
        status: "add requested",
        storedDate: nowDate,
      });
      // Push to arr
      const updatedItem = docid;
      orderedArrID.push(updatedItem);
      console.log(orderedArrID);
    }
  });
  await batch.commit();
  // Get updated data and create an object array
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
    const idAndData = {
      [id]: itemData,
    };
    orderedArrItem.push(idAndData);
  });

  // Generate new ORDER
  await addDoc(collection(db, "users", `${userId}`, "order"), {
    userId: `${userId}`,
    userName: {
      firstName: `${userDoc.userName.firstName}`,
      lastName: `${userDoc.userName.lastName}`,
    },
    driverId: "",
    itemKey: orderedArrID,
    orderTimestamp: nowFullDate,
    orderType: "add",
    status: "requested",
    address: {
      detail: `${userDoc.address.detail}`,
      city: `${userDoc.address.city}`,
      province: `${userDoc.address.province}`,
      zipCode: `${userDoc.address.zipCode}`,
    },
    storageLocation: {
      latitude: `${userDoc.storageLocation.latitude}`,
      longitude: `${userDoc.storageLocation.longitude}`,
      name: `${userDoc.storageLocation.name}`,
    },
    requestedDateTime: {
      date: `${new Date(userDoc.ongoing_order.date)}`,
      time: `${userDoc.ongoing_order.time} hrs`,
    },
  });

  // Calc date

  await updateDoc(doc(db, "users", `${userId}`), {
    // Delete 'ongoing-order' from userDoc
    ongoing_order: deleteField(),
    // Give ticket for free trip
    "plan.remainingFreeTrip": Number(
      `${companyPlanDoc.term[userDoc.plan.term].numTrip}`
    ),
    // set Date
    "plan.startDate": nowDate,
    "plan.expiryDate": expiryDate,
  });
};

// StorageMgmt : Filtering
export const queryFunction = async function (conditionValue) {
  const q = query(
    collection(db, "users", `${userId}`, "inStorage"),
    where("status", "==", conditionValue)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot;
};

// StorageMtmt : record chacked item tentatively
export const recordCheckedFunction = async function (arr) {
  await updateDoc(doc(db, "users", `${userId}`), {
    ongoingRetrievalItems: arr,
  });
};

// Retrieval : Order submitted
// export const retrievalOrderSubmitFunction = async function () {
//   getcheckedItem.forEach(async (el) => {
//     const getItem = await getDoc(
//       doc(db, "users", `${userId}`, "inStorage", `${el}`)
//     );
//     const item = getItem.data();
//     const itemID = getItem.id;
//     // update item
//     await updateDoc(doc(db, "users", `${userId}`, "inStorage", `${itemID}`), {
//       status: "retrieval requested",
//     });
//   });
//   // Generate order
//   await addDoc(collection(db, "users", `${userId}`, "order"), {
//     userId: `${userId}`,
//     userName: {
//       firstName: `${userDoc.userName.firstName}`,
//       lastName: `${userDoc.userName.lastName}`,
//     },
//     driverId: "",
//     itemKey: getcheckedItem,
//     orderTimestamp: nowFullDate,
//     orderType: "retrieval",
//     status: "requested",
//     address: {
//       detail: `${userDoc.address.detail}`,
//       city: `${userDoc.address.city}`,
//       province: `${userDoc.address.province}`,
//       zipCode: `${userDoc.address.zipCode}`,
//     },
//     storageLocation: {
//       latitude: `${userDoc.storageLocation.latitude}`,
//       longitude: `${userDoc.storageLocation.longitude}`,
//       name: `${userDoc.storageLocation.name}`,
//     },
//     requestedDateTime: {
//       date: `Mon Mar 18 2024 00:00:00 GMT-0700 (Pacific Daylight Time)`,
//       time: `17:00 hrs`,
//     },
//   });
//   await updateDoc(doc(db, "users", `${userId}`), {
//     // Then, delete 'ongoingRetrievalItems' from userDoc
//     ongoingRetrievalItems: deleteField(),
//     // Deduct number of free trip
//     "plan.remainingFreeTrip": Number(
//       `${
//         userDoc.plan.remainingFreeTrip > 0
//           ? userDoc.plan.remainingFreeTrip - 1
//           : 0
//       }`
//     ),
//   });
// };

// Date handling
// current time
export const ts = Timestamp.fromDate(new Date()).seconds;
export const nowFullDate = new Date(ts * 1000);
export const nowDate = `${nowFullDate.getFullYear()}/${
  nowFullDate.getMonth() + 1
}/${nowFullDate.getDate()}`;
// future time
Date.prototype.addDays = function (days) {
  let date = new Date(ts * 1000);
  date.setDate(date.getDate() + days);
  return date;
};
const date = new Date();
const contractDays =
  userDoc.plan?.term === "short"
    ? 30
    : userDoc.plan?.term === "mid"
    ? 120
    : 360;
const expiryFullDate = date.addDays(contractDays);
const expiryDate = `${expiryFullDate.getFullYear()}/${
  expiryFullDate.getMonth() + 1
}/${expiryFullDate.getDate()}`;

// Archives_NOT in use
// order-confirmation : Read checked items
export let getcheckedItem = userDoc.ongoingRetrievalItems;
export const renderCheckedItem = function (element) {
  getcheckedItem.forEach(async (el) => {
    const getItem = await getDoc(
      doc(db, "users", `${userId}`, "inStorage", `${el}`)
    );
    const item = getItem.data();
    const itemID = getItem.id;

    // render
    await element.insertAdjacentHTML(
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
      }</p> <i class="fa-solid fa-trash icon delete" id="deleteitem_${itemID}"></i></span>
      </li>`
    );
  });
};

export const renderCheckedItem2 = async function (element) {
  console.log(getcheckedItem);
  for (let i = 0; i < getcheckedItem.length; i++) {
    const getItem = await getDoc(
      doc(db, "users", `${userId}`, "inStorage", getcheckedItem[i])
    );
    const item = getItem.data();
    const itemID = getItem.id;
    // render
    await element.insertAdjacentHTML(
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
      }</p> <i class="fa-solid fa-trash icon delete" id="deleteitem_${itemID}"></i></span>
      </li>`
    );
  }
  const elementsDelete = document.querySelectorAll(".delete");
  elementsDelete.forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      console.log("x");
      // delete
      const deleteID = e.target.id.split("_")[1];
      // await deleteDoc(
      //   doc(db, "users", `${userId}`, "inStorage", `${deleteID}`)
      // );
      console.log(`${e.target.id} is deleted`);
    });
  });
};
