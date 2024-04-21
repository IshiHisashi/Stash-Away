"use strice";
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

import { firebaseConfig } from "../../api.js";

// Initialize Firebase---------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Define variables----------------
const userId = "qhH4gTkcc3Z1Q1bKdN0x6cGLoyB3";

// Firebase handling---------------
// Get storage data from company collection
const storageQuery = await getDoc(doc(db, "Company", "storageLocation"));
export const storageLocationObj = storageQuery.data();
export const storageLocationArr = Object.entries(storageQuery.data());

// Get address info from user's collection
const userQuery = await getDoc(doc(db, "users", `${userId}`));
export const userAddress = userQuery.data().address;
