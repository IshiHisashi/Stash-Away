import { onAuthStateChanged, signOut, auth } from "./firebase_auth.js";

import {
  collection,
  doc,
  onSnapshot,
  query,
  db,
} from "./firebase_firestore.js";

let uid = null;

// observe any change on authentication status - this is to get currently logged in user.
onAuthStateChanged(auth, (user) => {
  const loginStatusSpan = document.querySelector(".loginStatus");

  // when any user is logged in
  if (user) {
    uid = user.uid;
    console.log(user);
    loginStatusSpan.textContent = `Logged in: (user ID: ${uid})`;

    if (!user.emailVerified) {
      document.querySelector(".toast").classList.add("show");
    } else {
      document.querySelector(".toast").classList.remove("show");
    }

    //
    // notification test ////////////////////////////

    // check if the visitor can use notifications.
    // FIX LATER - this introduction notification should happen only when the user first visits this page.
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification.");
    } else if (Notification.permission === "granted") {
      new Notification("StashAway", {
        body: "Hi there! We will utilize notifications to let you know your order status updates!",
      });
    } else {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("StashAway", {
            body: "Hi there! Thank you for granting our notifications! You will get realtime order status updates!",
          });
        }
      });
    }

    // query criteria: all the documents under the user's 'order' collection
    const q = query(collection(doc(collection(db, "users"), uid), "order"));
    // add change listener to the queried place
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // get an array of the documents changes since the last snapshot.
      querySnapshot.docChanges().forEach((changedDoc) => {
        if (
          changedDoc.type === "modified" &&
          changedDoc.doc.data().status === "on going"
        ) {
          new Notification("StashAway", {
            body: `Order ID: ${changedDoc.doc.id} The order status has been changed to on going!`,
          });
        }
      });
    });
  } else {
    // when no user is logged in
    console.log("no user logged in");
    loginStatusSpan.textContent = `Logged out`;
  }
});

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

  signOut(auth)
    .then(() => {
      console.log("signed out");
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.log(error);
    });
};
