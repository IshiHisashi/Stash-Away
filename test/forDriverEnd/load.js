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

// Firebase handling---------------
// For getting data on driver's end
const objArr = [];
const queryOrder = query(collectionGroup(db, "order"));
const order = await getDocs(queryOrder);
order.forEach((el) => {
  const obj = { [el.id]: el.data() };
  objArr.push(obj);
});

// Update driver's id and its status. Also, update each item's status inStorage when order status is "done".
const update = async (uid, oid, driver = null) => {
  if (driver) {
    await updateDoc(query(doc(db, "users", `${uid}`, "order", `${oid}`)), {
      driverId: `${driver.value}`,
      status: "on going",
    });
  } else {
    await updateDoc(query(doc(db, "users", `${uid}`, "order", `${oid}`)), {
      status: "done",
    });

    const get = await getDoc(doc(db, "users", `${uid}`, "order", `${oid}`));
    get.data().itemKey.forEach((el) => {
      (async () => {
        await updateDoc(
          query(doc(db, "users", `${uid}`, "inStorage", `${el}`)),
          {
            status:
              get.data().orderType === "retrieval" ? "retrieved" : "stored",
          }
        );
      })();
    });
  }
};

// getdata for specific id
const getOrder = async (uid, oid) => {
  // const arr = [];
  const get = await getDoc(doc(db, "users", `${uid}`, "order", `${oid}`));
  return get;
};

export { objArr, update, db, getOrder };
