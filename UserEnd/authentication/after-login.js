import { doc, db, getDoc, updateDoc } from "./firebase_firestore.js";

import * as common from "../../common.js";

sessionStorage.setItem("pageToReturn", window.location.href);

const loginStatusSpan = document.querySelector(".loginStatus");

const user = await common.getCurrentUserObj();
const uid = user.uid;
console.log(user);

if (uid) {
  loginStatusSpan.textContent = `Logged in: (user ID: ${uid})`;

  if (!user.emailVerified) {
    document.querySelector(".toast").classList.add("show");
  } else {
    document.querySelector(".toast").classList.remove("show");
  }

  // Welcome notification
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification.");
  } else if (Notification.permission === "granted") {
    (async () => {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.data().firstVisit) {
        new Notification("StashAway", {
          body: "Hi there! We will utilize notifications to let you know your order status updates!",
        });
        await updateDoc(docRef, {
          firstVisit: false,
        });
      }
    })();
  } else {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        (async () => {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.data().firstVisit) {
            new Notification("StashAway", {
              body: "Hi there! Thank you for granting our notifications! You will get realtime order status updates!",
            });
            await updateDoc(docRef, {
              firstVisit: false,
            });
          }
        })();
      }
    });
  }
} else {
  loginStatusSpan.textContent = `Logged out`;
}

//
// see pickup and delivery updates page /////////////////////////

const btnUpdates = document.querySelector("#updates");

btnUpdates.onclick = (e) => {
  e.preventDefault();
  window.location.href = "pickup-and-delivery-updates.html";
};

//
// log out behaviour /////////////////////////////////////////

const btnLogout = document.querySelector("#logout");

btnLogout.onclick = (e) => {
  e.preventDefault();

  common
    .signOut(common.auth)
    .then(() => {
      console.log("signed out");
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.log(error);
    });
};
