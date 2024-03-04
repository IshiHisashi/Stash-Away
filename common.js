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
// import {
//   getFirestore,
//   collection,
//   collectionGroup,
//   doc,
//   getDoc,
//   getDocs,
//   setDoc,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   writeBatch,
//   query,
//   where,
// } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// const db = getFirestore(app);
// const userId = "qhH4gTkcc3Z1Q1bKdN0x6cGLoyB3";

// // -----READ-----
// // General : Get item (document) in 'inStorage' (subcollection):
// const queryStorage = collection(db, "users", `${userId}`, "inStorage");
// const snapShot = await getDocs(queryStorage);
// //
// // StorageMgmt : Filtering
// const queryFunction = async function (conditionValue) {
//   const q = query(
//     collection(db, "users", `${userId}`, "inStorage"),
//     where("status", "==", conditionValue)
//   );
//   const querySnapshot = await getDocs(q);
//   return querySnapshot;
// };

// // Exporring
// export { snapShot, queryFunction };
