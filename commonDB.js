"use strice";

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
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  applyActionCode,
  RecaptchaVerifier,
  linkWithPhoneNumber,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const auth = getAuth(app);

let user;
let uid;

const uidPromise = new Promise((resolve, reject) => {
  onAuthStateChanged(auth, (authUser) => {
    if (authUser) {
      uid = authUser.uid;
    } else {
      uid = null;
    }
    resolve(uid);
  });
});

const userObjPromise = new Promise((resolve, reject) => {
  onAuthStateChanged(auth, (authUser) => {
    if (authUser) {
      user = authUser;
    } else {
      user = null;
    }
    resolve(user);
  });
});

const getCurrentUid = () => {
  return uidPromise;
};

const getCurrentUserObj = () => {
  return userObjPromise;
};

export {
  getCurrentUid,
  getCurrentUserObj,
  signOut,
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  linkWithPhoneNumber,
  applyActionCode,
};

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
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
const db = getFirestore(app);
const userId = "qhH4gTkcc3Z1Q1bKdN0x6cGLoyB3";

// -----READ-----
// General : Get users in 'usersID'
const userSnap = await getDoc(doc(db, "users", `${userId}`));
export const userDoc = userSnap.data();

// General : Get item (document) in 'inStorage' (subcollection):
const queryStorage = collection(db, "users", `${userId}`, "inStorage");
export const snapShot = await getDocs(queryStorage);
//

// Booking : Order submitted
export const orderSubmitFunction = async function (snapShot) {
  const batch = writeBatch(db);
  const orderedArrID = [];
  snapShot.forEach((doc) => {
    if (doc.data().status === "saved") {
      let docid = doc.id;
      // Update status
      batch.update(doc.ref, {
        status: "add requested",
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
  console.log(orderedArrItem);

  // Generate new ORDER
  await addDoc(collection(db, "users", `${userId}`, "order"), {
    userId: `${userId}`,
    userName: {
      firstName: `${userDoc.userName.firstName}`,
      lastName: `${userDoc.userName.lastName}`,
    },
    driverId: "",
    itemKey: orderedArrID,
    orderDate: "2024-01-31",
    orderType: "add",
    status: "requested",
    address: {
      detail: `${detailAddress.value}`,
      city: `${city.value}`,
      province: `${province.value}`,
      zipCode: `${zip.value}`,
    },
    storageLocation: {
      latitude: `${userDoc.storageLocation.latitude}`,
      longitude: `${userDoc.storageLocation.longitude}`,
      name: `${userDoc.storageLocation.name}`,
    },
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
