"use strict";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
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

// define variable / fnc ------------
// var_DoM
const userId = "qhH4gTkcc3Z1Q1bKdN0x6cGLoyB3";
const firstname = document.getElementById("firstname");
const lastname = document.getElementById("lastname");
const item = document.getElementById("item");
const itemList = document.getElementById("item-list");
const detailAddress = document.getElementById("detail");
const city = document.getElementById("city");
const province = document.getElementById("province");
const zip = document.getElementById("zip");
const sizePlan = document.getElementById("size-plan");
const termPlan = document.getElementById("term-plan");
const price = document.getElementById("price");
const btnSubmit = document.getElementById("btnSubmit");
const btnSave = document.getElementById("btnSave");

// fnc
// foreach __NOT IN USE__
const renderList = (docs) => {
  docs.forEach((doc) => {
    if (doc.data().status === "saved") {
      const item = doc.data();
      const itemID = doc.id;
      itemList.insertAdjacentHTML(
        "beforeend",
        `<li class='item-list-li'><p>${item.itemName}</p> <span class='icon-span'><i class="fa-regular fa-image icon pic" id="picitem_${itemID}"></i><i class="fa-solid fa-trash icon delete" id="deleteitem_${itemID}"></i></span></li>`
      );
    }
  });
};
// forloop
const renderListFor = function (doc) {
  for (let i = 0; i < doc.length; i++) {
    if (doc[i].data().status === "saved") {
      const item = doc[i].data();
      const itemID = doc[i].id;
      itemList.insertAdjacentHTML(
        "beforeend",
        `<li class='item-list-li'><p>${item.itemName}</p> <span class='icon-span'><i class="fa-regular fa-image icon pic" id="picitem_${itemID}"></i><i class="fa-solid fa-trash icon delete" id="deleteitem_${itemID}"></i></span></li>`
      );
    }
  }
};

// Firebase handling---------------
// Get User document
const docSnap = await getDoc(doc(db, "users", `${userId}`));
const userDoc = docSnap.data();

// Render name
firstname.value = userDoc.userName.firstName;
lastname.value = userDoc.userName.lastName;

// Render list
itemList.innerHTML = "";
const queryStorage = collection(db, "users", `${userId}`, "inStorage");
const snapShot = await getDocs(queryStorage);
const snapDoc = snapShot.docs;
// rendering
renderListFor(snapDoc);

// Camera access ---coming sonn...----
const elementsCamera = document.querySelectorAll(".pic");
elementsCamera.forEach((el) => {
  el.addEventListener("click", async (e) => {
    e.preventDefault();
    const id = e.target.id.split("_")[1];
    console.log(id);
    await updateDoc(doc(db, "users", `${userId}`, "inStorage", `${id}`), {
      picture: "2bc",
    });
  });
});

// Delete function
const elementsDelete = document.querySelectorAll(".delete");
elementsDelete.forEach((el) => {
  el.addEventListener("click", async (e) => {
    e.preventDefault();
    // delete
    const deleteID = e.target.id.split("_")[1];
    await deleteDoc(doc(db, "users", `${userId}`, "inStorage", `${deleteID}`));
    console.log(`${e.target.id} is deleted`);
    // re-render to update the list
    window.location.reload();
  });
});

// Save data
btnSave.addEventListener("click", async function (e) {
  e.preventDefault();
  const inputItemName = item.value;
  const queryStorage = query(collection(db, "users", `${userId}`, "inStorage"));
  const storage = await getDocs(queryStorage);
  // store data
  await addDoc(collection(db, "users", `${userId}`, "inStorage"), {
    boxNumber: storage.docs.length + 1,
    itemName: inputItemName,
    picture: "picture url",
    storedDate: "2024-01-31",
    status: "saved",
  });
  window.location.reload();
});

// Delivery info.
detailAddress.value = userDoc.address.detail;
city.value = userDoc.address.city;
province.value = userDoc.address.province;
zip.value = userDoc.address.zipCode;

// Plan : rendered once it's selected. => NOT WORKING NOW
// load plan data and render first
const docPlan = await getDoc(doc(db, "Company", "plan"));
const docPlanSize = docPlan.data().size;
// console.log(docPlanSize.small);
Object.keys(docPlanSize).forEach((el) => {
  document
    .getElementById("size-option")
    .insertAdjacentHTML("afterend", `<option value='${el}'>${el}</option>`);
});
const docPlanTerm = docPlan.data().term;
Object.keys(docPlanTerm).forEach((el) => {
  document
    .getElementById("term-option")
    .insertAdjacentHTML("afterend", `<option value='${el}'>${el}</option>`);
});

sizePlan.addEventListener("change", async (e) => {
  const d = await getDoc(doc(db, "users", `${userId}`));
  const user = d.data();
  const selectedsize = e.target.value;
  const termUser = user.plan.term;
  if (selectedsize !== "none") {
    // size = { [selectedsize]: docPlanSize[selectedsize] };
    await updateDoc(doc(db, "users", `${userId}`), {
      "plan.size": `${selectedsize}`,
    });
    pricing(selectedsize, termUser);
  }
});

// Plan_term
termPlan.addEventListener("change", async (e) => {
  const d = await getDoc(doc(db, "users", `${userId}`));
  const user = d.data();
  const selectedterm = e.target.value;
  const sizeUser = user.plan.size;
  if (selectedterm !== "none") {
    // term = { [selectedterm]: docPlanTerm[selectedterm] };
    await updateDoc(doc(db, "users", `${userId}`), {
      "plan.term": `${selectedterm}`,
    });
    pricing(sizeUser, selectedterm);
  }
});

// pricing
const pricing = async (size, term) => {
  let sizeUser = size;
  let termUser = term;
  let monthlyFee = docPlanSize[sizeUser].price * docPlanTerm[termUser].discount;
  console.log(monthlyFee);
  price.textContent = "$" + monthlyFee;
  await updateDoc(doc(db, "users", `${userId}`), {
    "plan.monthlyFee": `${monthlyFee}`,
  });
};

// Submit data
btnSubmit.addEventListener("click", async (e) => {
  e.preventDefault();
  const batch = writeBatch(db);
  const queryStorage = collection(db, "users", `${userId}`, "inStorage");
  const snapShot = await getDocs(queryStorage);
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
    const idAndData = { [id]: itemData };
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
  });
});

// for modal
const listupPic = document.getElementById("listup-pic");
const modal = document.getElementById("easyModal");
const buttonClose = document.getElementsByClassName("modalClose")[0];

// pic icon is clicked
listupPic.addEventListener("click", modalOpen);
function modalOpen(e) {
  e.preventDefault();
  modal.style.display = "block";
}

// close sign is clicked
buttonClose.addEventListener("click", modalClose);
function modalClose() {
  modal.style.display = "none";
}

// you can close modal by clicking any place.
addEventListener("click", outsideClose);
function outsideClose(e) {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}

// ----------------------------------------

// Another way of getting data from Subcollection --------------------
// const queryStorage = query(collectionGroup(db, "inStorage"));
// const storage = await getDocs(queryStorage);
// // Render list
// await storage.docs.forEach(async (doc) => {
//   const itemInfo = doc._document.data.value.mapValue.fields;
//   console.log(itemInfo);
//   itemList.insertAdjacentHTML(
//     "beforeend",
//     `<li class='item-list-li'><p>Item #${itemInfo.boxNumber.integerValue} | ${itemInfo.itemName.stringValue}</p> <span class='icon-span'><i class="fa-regular fa-image icon"></i><i class="fa-solid fa-xmark icon"></i></span></li>`
//   );
// });
