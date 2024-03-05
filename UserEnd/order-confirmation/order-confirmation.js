"use strict";
// import from common.js
import * as common from "../../common.js";

const itemList = document.getElementById("item-list");
const numRetrievalItems = document.getElementById("num-retrieval-items");
console.log(common.getcheckedItem);
// Rendering
// await common.renderCheckedItem2(itemList);
// numRetrievalItems.textContent = `${common.getcheckedItem.length}`;

// -----------------EXP
for (let i = 0; i < common.getcheckedItem.length; i++) {
  const getItem = await common.getDoc(
    common.doc(
      common.db,
      "users",
      `${common.userId}`,
      "inStorage",
      common.getcheckedItem[i]
    )
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
    console.log(deleteID);
    const index = common.getcheckedItem.indexOf(deleteID);
    common.getcheckedItem.splice(index, 1);
    // Update the Database
    common.recordCheckedFunction(common.getcheckedItem);
  });
});
