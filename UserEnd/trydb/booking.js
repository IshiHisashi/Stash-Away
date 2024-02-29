"use strict";
// Import the functions you need from the SDKs you need
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
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
const saveBtn = document.getElementById("saveItem");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const uploadButton = document.getElementById("uploadButton");
const imageUpload = document.getElementById("imageUpload");
const deleteIcon = document.getElementById("deleteIcon");
let stream = null;
let image;
let currentEditingItemId;
let itemData;

const renderListFor = function (doc) {
  for (let i = 0; i < doc.length; i++) {
    if (doc[i].data().status === "saved") {
      const item = doc[i].data();
      const itemID = doc[i].id;
      // Use the item's image if available; otherwise, use the default image from the 'images' folder
      const itemImageSrc = item.picture ? item.picture : "/images/default-image.jpg";

      itemList.insertAdjacentHTML(
        "beforeend",
        `<li class='item-list-li'><img src='${itemImageSrc}' class='placeholder-pic' alt='Item Image'><p>${item.itemName}</p> <span class='icon-span'><i class="fa-regular fa-image icon pic" id="picitem_${itemID}"></i><i class="fa-solid fa-trash icon delete" id="deleteitem_${itemID}"></i></span></li>`
      );

      const iconElement = document.getElementById(`picitem_${itemID}`);
      iconElement.addEventListener('click', function (e) {
        itemData = item;
        modalOpen(e, item, doc[i].id);
      });
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

document.getElementById("newItemName").addEventListener("input", function () {
  const itemNameValue = document.getElementById("newItemName").value.trim();
  document.getElementById("saveItem").disabled = itemNameValue === "";
});

captureBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const fixedWidth = 300;
  const fixedHeight = 150; // 
  canvas.width = fixedWidth;
  canvas.height = fixedHeight;

  const scale = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
  const scaledWidth = video.videoWidth * scale;
  const scaledHeight = video.videoHeight * scale;

  const xOffset = (canvas.width - scaledWidth) / 2;
  const yOffset = (canvas.height - scaledHeight) / 2;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(video, xOffset, yOffset, scaledWidth, scaledHeight);
  canvas.hidden = false;
  captureBtn.hidden = true;
  retakeBtn.disabled = false;
  retakeBtn.style.display = "inline-block";
  saveBtn.disabled = false;
  video.hidden = true;
  uploadButton.style.display = "none";

  canvas.toBlob(function (blob) {
    console.log(blob); 
    image = blob;
    console.log(image);
  }, "image/jpeg");

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
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
      .getUserMedia({
        video: true
      })
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
  e.preventDefault();
  imageUpload.click();
  canvas.hidden = true;
  video.hidden = true;
});

imageUpload.addEventListener("change", function (e) {
  e.preventDefault();
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const fixedWidth = 300;
        const fixedHeight = 150;
        canvas.width = fixedWidth;
        canvas.height = fixedHeight;

        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        const xOffset = (canvas.width - scaledWidth) / 2;
        const yOffset = (canvas.height - scaledHeight) / 2;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, xOffset, yOffset, scaledWidth, scaledHeight);
        canvas.hidden = false;

        canvas.toBlob(function (blob) {
          console.log(blob);
          image = blob;
          console.log(image);
        }, "image/jpeg");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

saveBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  
  const itemName = document.getElementById("newItemName").value;
  if (!itemName.trim()) {
    alert("Please provide an item name.");
    return;
  }

  // Handle image upload first
  let imageReference = null;
  if (image) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(`photos/${itemName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.jpg`);
    const snapshot = await imageRef.put(image);
    imageReference = await snapshot.ref.getDownloadURL();
  }

  //update or add the item
  if (currentEditingItemId) {
    // Update existing item
    await updateDoc(doc(db, "users", userId, "inStorage", currentEditingItemId), {
      itemName,
      picture: imageReference || itemData.picture, 
    });
    alert("Item updated successfully!");
  } else {
    // Add a new item
    await addDoc(collection(db, "users", userId, "inStorage"), {
      itemName,
      boxNumber: (await getDocs(query(collection(db, "users", userId, "inStorage")))).docs.length + 1,
      picture: imageReference || "",
      storedDate: "2024-01-31",
      status: "saved",
    });
    alert("Item added successfully!");
  }

  modalClose();
  clearModelData(); 
});

const itemsContainer = document.getElementById("itemsContainer");



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
    const idAndData = {
      [id]: itemData
    };
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
const modal = document.getElementById("easyModal");
const buttonClose = document.getElementsByClassName("modalClose")[0];
const newItemName = document.getElementById("newItemName");

function setupEventListener() {
  const listupPic = document.getElementById("listup-pic");

  if (listupPic) {
    listupPic.addEventListener("click", function (e) {
      modalOpen(e);
    });
  }
}

setupEventListener();

// Adjusted modalOpen function
function modalOpen(e, itemData = "", itemId = "") {
  const option1 = document.getElementById('option1');
  clearModelData();

  if (itemData) {
    if (itemId != "") {
      currentEditingItemId = itemId;
    }
    document.getElementById("newItemName").value = itemData.itemName;
    modal.style.display = "block";

    if (itemData.picture && itemData.picture !== "") {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.hidden = false;
      };
      img.src = itemData.picture;
    }
  } else {
    modal.style.display = "block";
  }

  saveItem.style.display = "inline-block";

  if (option1.checked) {
    openCamera();
  }
}

// close sign is clicked
buttonClose.addEventListener("click", modalClose);

function modalClose() {
  modal.style.display = "none";

  clearModelData()
}

// you can close modal by clicking any place.
addEventListener("click", outsideClose);

function outsideClose(e) {
  if (e.target == modal) {
    modal.style.display = "none";

    clearModelData();
  }
}

function clearModelData() {
  // Reset input fields
  currentEditingItemId = 0;
  document.getElementById("newItemName").value = "";

  // Reset radio buttons
  const radioButtons = document.querySelectorAll('input[type="radio"][name="options"]');
  radioButtons.forEach(radio => radio.checked = false);

  // Clear canvas
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.hidden = true; 

  document.getElementById("capture").style.display = "none";
  document.getElementById("retake").style.display = "none";
  document.getElementById("uploadButton").style.display = "none";
  document.getElementById("saveItem").style.display = "none";
}

function openCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        video: true
      })
      .then(function (localStream) {
        stream = localStream;
        video.srcObject = stream;
        video.hidden = false;
        video.height = 150;
        video.width = 300;
        captureBtn.disabled = false;
        captureBtn.style.display = "inline-block";
        uploadButton.style.display = "none";
        saveBtn.style.display = "inline-block";
      })
      .catch(function (err) {
        console.log("An error occurred: " + err);
      });
  }
}

function handleCaptureImageSelected() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.hidden = true;
  imageUpload.value = "";
  openCamera();
}

function handleUploadImageSelected() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.hidden = true;
  imageUpload.value = "";
  imageUpload.click();
  canvas.hidden = true;
  captureBtn.disabled = true;
  video.hidden = true;
  captureBtn.style.display = "none";
  uploadButton.style.display = "inline-block";
  retakeBtn.disabled = true;
  retakeBtn.style.display = "none";
  saveBtn.style.display = "inline-block";

}

document.getElementById('option1').addEventListener('change', function () {
  if (this.checked) {
    handleCaptureImageSelected();
  }
});

document.getElementById('option2').addEventListener('change', function () {
  if (this.checked) {
    handleUploadImageSelected();
  }
});

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