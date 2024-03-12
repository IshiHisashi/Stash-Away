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
const userSnap = await common.getDoc(common.doc(db, "users", uid));
const userDoc = userSnap.data();
let getcheckedItem = userDoc.ongoingRetrievalItems;

// General : Get item (document) in 'inStorage' (subcollection):
const queryStorage = common.collection(db, "users", uid, "inStorage");
const snapShot = await common.getDocs(queryStorage);

// ----------------------

const itemList = document.getElementById("item-list");
const numRetrievalItems = document.getElementById("num-retrieval-items");
// Rendering

// read checked items in the previous page
for (let i = 0; i < getcheckedItem.length; i++) {
  const getItem = await common.getDoc(
    common.doc(db, "users", `${uid}`, "inStorage", getcheckedItem[i])
  );
  const item = getItem.data();
  const itemID = getItem.id;
  // render
  itemList.insertAdjacentHTML(
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
// Delete
const elementsDelete = document.querySelectorAll(".delete");
elementsDelete.forEach((el) => {
  el.addEventListener("click", async (e) => {
    e.preventDefault();
    // delete
    const deleteID = e.target.id.split("_")[1];
    const index = getcheckedItem.indexOf(deleteID);
    getcheckedItem.splice(index, 1);
    // Update the Database
    await common.recordCheckedFunction(getcheckedItem, uid);
    //
    window.location.reload();
  });
});

// render the number of checked items
if (getcheckedItem.length < 2) {
  numRetrievalItems.textContent = `${getcheckedItem.length} item`;
} else {
  numRetrievalItems.textContent = `${getcheckedItem.length} items`;
}
