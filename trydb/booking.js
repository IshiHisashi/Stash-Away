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
  onSnapshot,
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

//using camera
const cameraIcon = document.getElementById("cameraIcon");
const captureBtn = document.getElementById("capture");
const retakeBtn = document.getElementById("retake");
const saveBtn = document.getElementById("save");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const uploadButton = document.getElementById("uploadButton");
const imageUpload = document.getElementById("imageUpload");
const deleteIcon = document.getElementById("deleteIcon");
let stream = null;
let image;
let savedItemName;
let imageReference;

// fnc
// foreach __NOT IN USE__
// const renderList = (docs) => {
//   docs.forEach((doc) => {
//     if (doc.data().status === "saved") {
//       const item = doc.data();
//       const itemID = doc.id;
//       itemList.insertAdjacentHTML(
//         "beforeend",
//         `<li class='item-list-li'><p>${item.itemName}</p> <span class='icon-span'><i class="fa-regular fa-image icon pic" id="picitem_${itemID}"></i><i class="fa-solid fa-trash icon delete" id="deleteitem_${itemID}"></i></span></li>`
//       );
//     }
//   });
// };
// forloop
const renderListFor = function (doc) {
  for (let i = 0; i < doc.length; i++) {
    if (doc[i].data().status === "saved") {
      const item = doc[i].data();
      const itemID = doc[i].id;
      itemList.insertAdjacentHTML(
        "beforeend",
        `<li class='item-list-li'><img src='${
          item.picture ? item.picture : ""
        }' class=placeholder-pic alt=${itemID}><p>${
          item.itemName
        }</p> <span class='icon-span'><i class="fa-regular fa-image icon pic" id="picitem_${itemID}"></i><i class="fa-solid fa-trash icon delete" id="deleteitem_${itemID}"></i></span></li>`
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
const unsubscribe = onSnapshot(queryStorage, (querySnapshot) => {
  itemList.innerHTML = "";
  renderListFor(querySnapshot.docs);

  // camera access;
  const elementsCamera = document.querySelectorAll(".pic");
  elementsCamera.forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = e.target.id.split("_")[1];
      console.log(id);
    });
  });
  //Delete
  const elementsDelete = document.querySelectorAll(".delete");
  elementsDelete.forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      // delete
      const deleteID = e.target.id.split("_")[1];
      await deleteDoc(
        doc(db, "users", `${userId}`, "inStorage", `${deleteID}`)
      );
      console.log(`${e.target.id} is deleted`);
    });
  });
});

//camera

document.getElementById("itemName").addEventListener("input", function () {
  const itemNameValue = document.getElementById("itemName").value.trim();
  document.getElementById("save").disabled = itemNameValue === "";
});

// Function to enable the camera
cameraIcon.addEventListener("click", function (e) {
  e.preventDefault();
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (localStream) {
        stream = localStream;
        video.srcObject = stream;
        video.hidden = false;
        captureBtn.disabled = false;
        captureBtn.style.display = "inline-block";
        uploadButton.style.display = "inline-block";
        saveBtn.style.display = "inline-block";
      })
      .catch(function (err) {
        console.log("An error occurred: " + err);
      });
  }
});
// Function to capture the image
captureBtn.addEventListener("click", function (e) {
  e.preventDefault();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  captureBtn.hidden = true;
  retakeBtn.disabled = false;
  retakeBtn.style.display = "inline-block";
  saveBtn.disabled = false;
  video.hidden = true;
  canvas.hidden = false;
  // Stop the camera after capturing the image
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
});

retakeBtn.addEventListener("click", function (e) {
  e.preventDefault();
  canvas.hidden = true;
  video.hidden = false;
  captureBtn.disabled = false;
  retakeBtn.style.display = "none";
  saveBtn.disabled = true;

  // Restart the camera stream
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (localStream) {
        stream = localStream;
        video.srcObject = stream;
      })
      .catch(function (err) {
        console.log("An error occurred: " + err);
      });
  }
});

uploadButton.addEventListener("click", function (e) {
  e.preventDefault(); // Prevent the form from submitting if the button is part of a form
  imageUpload.click(); // Trigger file input click on button click
  canvas.hidden = true;
  video.hidden = true;
});

imageUpload.addEventListener("change", function (e) {
  e.preventDefault();
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        canvas.hidden = false;
        deleteIcon.style.display = "inline-block"; // Show delete icon
        saveBtn.disabled = false;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

deleteIcon.addEventListener("click", function (e) {
  e.preventDefault();
  context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  canvas.hidden = true;
  deleteIcon.style.display = "none"; // Hide delete icon
  saveBtn.disabled = true; // Disable save button until another image is uploaded or captured
  imageUpload.value = ""; // Reset file input
});

saveBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const itemName = document.getElementById("itemName").value;

  // Only proceed if item name is provided
  if (itemName.trim() !== "") {
    canvas.toBlob(function (blob) {
      image = blob;
      savedItemName = itemName;
    }, "image/jpeg");

    modalClose();
  } else {
    alert("Please provide an item name.");
  }
  // retakeBtn.style.display = 'none';
  // captureBtn.style.display = 'none';
  // uploadButton.style.display = 'none';
  // saveBtn.style.display = 'none';
  // deleteIcon.style.display = 'none';
  // canvas.hidden=true;
  // video.hidden=true;
  // Clear the itemName input field after initiating the save logic
  // document.getElementById('itemName').value = '';
});

async function handleBlob(blob, itemName) {
  // Get a reference to the storage service
  const storageRef = firebase.storage().ref();
  // Create a reference to the img file
  const imageRef = storageRef.child("photos/photo_" + Date.now() + ".jpg");
  try {
    // Upload the file to the path 'photos/photo_(timestamp).jpg'
    const snapshot = await imageRef.put(blob);
    // Get the URL of the uploaded file
    const imageUrl = await snapshot.ref.getDownloadURL();

    // After uploading the image, save the item with the image URL
    addNewItemWithImage(itemName, imageUrl);
  } catch (error) {
    console.error("Error uploading image: ", error);
    alert("Error saving item with image: " + error.message);
  }
}

function addNewItemWithImage(itemName, imageUrl) {
  const db = firebase.firestore();
  const itemData = { name: itemName };
  if (imageUrl) {
    itemData.image = imageUrl;
  }

  db.collection("items")
    .add(itemData)
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      alert("Item saved successfully!");
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
      alert("Error saving item: " + error.message);
    });
}

const showItemsBtn = document.getElementById("showItems");
const itemsContainer = document.getElementById("itemsContainer");

showItemsBtn.addEventListener("click", function (e) {
  e.preventDefault();
  fetchAndDisplayItems();
});

function fetchAndDisplayItems() {
  // Clear previous items
  itemsContainer.innerHTML = "";

  // Fetch items from Firestore
  firebase
    .firestore()
    .collection("items")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const item = doc.data();
        const itemElement = document.createElement("div");

        const name = document.createElement("h2");
        name.textContent = item.name;

        // Create an image element
        const image = new Image();
        // Set source to the base64 image string
        image.src = item.image;

        itemElement.appendChild(name);
        itemElement.appendChild(image);

        itemsContainer.appendChild(itemElement);
      });
    })
    .catch((error) => {
      console.error("Error fetching items: ", error);
    });
}

// Save data
btnSave.addEventListener("click", async function (e) {
  e.preventDefault();
  const inputItemName = item.value;
  const queryStorage = query(collection(db, "users", `${userId}`, "inStorage"));
  const storage = await getDocs(queryStorage);
  debugger;
  if (image) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child("photos/photo_" + Date.now() + ".jpg");
    const snapshot = await imageRef.put(image);
    imageReference = await snapshot.ref.getDownloadURL();
  }
  debugger;
  // store data
  await addDoc(collection(db, "users", `${userId}`, "inStorage"), {
    itemName: inputItemName,
    boxNumber: storage.docs.length + 1,
    picture: `${imageReference ? imageReference : ""}`,
    storedDate: "2024-01-31",
    status: "saved",
  });
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
    storageLocation: {
      latitude: `${userDoc.storageLocation.latitude}`,
      longitude: `${userDoc.storageLocation.longitude}`,
      name: `${userDoc.storageLocation.name}`,
    },
  });
});

// for modal
// const listupPic = item.value != '' ? document.getElementById("listup-pic") : alert("Please enter Item Name");
const modal = document.getElementById("easyModal");
const buttonClose = document.getElementsByClassName("modalClose")[0];
const itemName = document.getElementById("itemName");

function setupEventListener() {
  const listupPic = document.getElementById("listup-pic");

  // Only attach the event listener if listupPic exists
  if (listupPic) {
    listupPic.addEventListener("click", function (e) {
      // Directly call modalOpen, which now includes the value check
      modalOpen(e);
    });
  }
}

setupEventListener();

// // pic icon is clicked
// listupPic.addEventListener("click", function(e) {
//   // Call modalOpen function with event object
//   modalOpen(e);
// });

// Adjusted modalOpen function
function modalOpen(e) {
  e.preventDefault(); // Prevent default action
  // Check if item.value is not empty
  if (item && item.value !== "") {
    itemName.value = item.value; // Set the value of the modal input to the value of the item input
    modal.style.display = "block";
  } else {
    alert("Please enter Item Name");
  }
}

// close sign is clicked
buttonClose.addEventListener("click", modalClose);
function modalClose() {
  item.value = itemName.value;
  modal.style.display = "none";
}

// you can close modal by clicking any place.
addEventListener("click", outsideClose);
function outsideClose(e) {
  if (e.target == modal) {
    item.value = itemName.value;
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
