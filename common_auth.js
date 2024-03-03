"use strict";

// Import the functions you need from the SDKs you need
// from "firebase/app"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// from "firebase/firestore"
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
// for project
const firebaseConfig = {
  apiKey: "AIzaSyA0Px8PkiCzyTrDcFCWh-mbER-YcWd9d-E",
  authDomain: "fir-jan24.firebaseapp.com",
  projectId: "fir-jan24",
  storageBucket: "fir-jan24.appspot.com",
  messagingSenderId: "831417179844",
  appId: "1:831417179844:web:c3eb03b7fc9c6ef7b03391",
  measurementId: "G-DSYKEF99M1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

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

export { getCurrentUid, getCurrentUserObj, signOut, auth };
