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
const userId = "1Rhsvb5eYgebqaRSnS7moZCE4za2";
// const userId = uid;
// For 1. Booking_additem
const item = document.getElementById("item");
const newItemName = document.getElementById("newItemName");
const displayItemName = document.getElementById("displayItemName");
const displayItemNameElement = document.getElementById("displayItemName");
const btnSave = document.getElementById("btnSave");
const itemList = document.getElementById("item-list");
// For 2. Booking_pick-up
const firstname = document.getElementById("firstname");
const lastname = document.getElementById("lastname");
const unitNumber = document.getElementById("unitnumber");
const street = document.getElementById("street");
const city = document.getElementById("city");
const province = document.getElementById("province");
const zipCode = document.getElementById("zipcode");
const pikupDate = document.getElementById("pickup-date");
const pikupTime = document.getElementById("pickup-time");
const storageLocation = document.getElementById("storage-location");
const btnSavePickup = document.getElementById("btn-save-pickup");

// For 3. Booking_Size selection
const smallPrice = document.getElementById("small-price");
const mediumPrice = document.getElementById("medium-price");
const largePrice = document.getElementById("large-price");
const btnSelectSmall = document.getElementById("btn-small");
const btnSelectMedium = document.getElementById("btn-medium");
const btnSelectLarge = document.getElementById("btn-large");

// For 4. Booking_TermPlan selection
// to be placed here later
const tripShort = document.getElementById("trip-short");
const tripMid = document.getElementById("trip-mid");
const tripLong = document.getElementById("trip-long");
const monthShort = document.getElementById("month-short");
const monthMid = document.getElementById("month-mid");
const monthLong = document.getElementById("month-long");
const priceShort = document.getElementById("price-short");
const priceMid = document.getElementById("price-mid");
const priceLong = document.getElementById("price-long");
const btnShort = document.getElementById("btn-short");
const btnMid = document.getElementById("btn-mid");
const btnLong = document.getElementById("btn-long");

//using camera
const cameraIcon = document.getElementById("cameraIcon");
const captureBtn = document.getElementById("capture");
const retakeBtn = document.getElementById("retake");
const reuploadBtn = document.getElementById("reupload");
const saveBtn = document.getElementById("saveItem");
const saveImageBtn = document.getElementById("saveImage");
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

// Firebase handling---------------
// Get User document
const docSnap = await getDoc(doc(db, "users", `${userId}`));
const userDoc = docSnap.data();

// --------------------------------
// For Prathibha
const renderListFor = function (doc) {
  for (let i = 0; i < doc.length; i++) {
    if (doc[i].data().status === "saved") {
      const item = doc[i].data();
      const itemID = doc[i].id;
      // Use the item's image if available; otherwise, use the default image from the 'images' folder
      const itemImageSrc = item.picture
        ? item.picture
        : "/images/default-image.jpg";

      itemList.insertAdjacentHTML(
        "beforeend",
        `<li class='item-list-li'><img src='${itemImageSrc}' class='placeholder-pic' alt='Item Image'><p>${item.itemName}</p> <span class='icon-span'><i class="fa-regular fa-image icon pic" id="picitem_${itemID}"></i><i class="fa-solid fa-trash icon delete" id="deleteitem_${itemID}"></i></span></li>`
      );

      const iconElement = document.getElementById(`picitem_${itemID}`);
      iconElement.addEventListener("click", function (e) {
        itemData = item;
        modalOpen(e, item, doc[i].id);
      });
    }
  }
};

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
captureBtn.addEventListener("click", function (e) {
  e.preventDefault();
  
  // document.getElementById("displayItemName").style.display = "block"; // Show input after image capture
  displayItemNameElement.textContent = document.getElementById("newItemName").value;

  const fixedWidth = 300;
  const fixedHeight = 150;
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
  retakeBtn.disabled = false;
  document.getElementById("capture").style.display = "none";
  document.getElementById("retake").style.display = "inline-block";
  document.getElementById("saveImage").style.display = "inline-block";
  saveImageBtn.disabled = false;
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
  saveImageBtn.disabled = true;
  document.getElementById("capture").style.display = "inline-block";
  document.getElementById("uploadButton").style.display = "inline-block";
  document.getElementById("saveImage").style.display = "none";
  document.getElementById("displayItemName").style.display = "none";
  document.getElementById("reupload").style.display = "none";

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
  imageUpload.value = ""; // Clear the previous selection
  imageUpload.click(); 
  canvas.hidden = true;
  video.hidden = true;
});

reuploadBtn.addEventListener("click", function (e) {
  e.preventDefault();
  imageUpload.onchange();
  canvas.hidden = true;
  video.hidden = true;
});

imageUpload.addEventListener("change", function (e) {
  if (e.target.files.length > 0) {
    // File has been selected
    const file = e.target.files[0];
    processFile(file); // Call a function to handle the file
  } else {
    // This block will not be executed for a cancel operation since
    // the change event is not fired if the user cancels the dialog.
    console.log("No file selected or upload cancelled.");
  }
});

function processFile(file) {
  document.getElementById("displayItemName").style.display = "block"; // Show input after image capture
  displayItemNameElement.textContent = document.getElementById("newItemName").value;;

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

    reuploadBtn.disabled = false;
    document.getElementById("capture").style.display = "none";
    document.getElementById("uploadButton").style.display = "none";
    document.getElementById("retake").style.display = "none";
    document.getElementById("reupload").style.display = "inline-block";
    document.getElementById("saveImage").style.display = "inline-block";
  } else {    
    openCamera();
    document.getElementById("reupload").style.display = "none";
    document.getElementById("saveImage").style.display = "none";
    document.getElementById("capture").style.display = "inline-block";
    document.getElementById("uploadButton").style.display = "inline-block";
    document.getElementById("displayItemName").style.display = "none";
  }
}

saveImageBtn.addEventListener("click", async function (e) {
  modalClose();
});

saveBtn.addEventListener("click", async function (e) {
  e.preventDefault();

  const itemName = document.getElementById("newItemName").value;
  if (!itemName.trim()) {
    alert("Please provide an item name.");
    return;
  }

  let imageReference = null;
  if (image) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(`photos/${itemName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.jpg`);
    const snapshot = await imageRef.put(image);
    imageReference = await snapshot.ref.getDownloadURL();
  }

  if (currentEditingItemId) {
    await updateDoc(doc(db, "users", userId, "inStorage", currentEditingItemId), {
      itemName,
      picture: imageReference || itemData.picture,
    });
    alert("Item updated successfully!");
  } else {
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
// Prathibha_end

//-----------------------------------------
// Ishi start
// 2. Booking_Pickup
// Rendering as default values
firstname.value = userDoc.userName.firstName;
lastname.value = userDoc.userName.lastName;
unitNumber.value = userDoc.address.roomNumEtc;
street.value = userDoc.address.detail;
city.value = userDoc.address.city;
province.value = userDoc.address.province;
zipCode.value = userDoc.address.zipCode;
storageLocation.value = userDoc.storageLocation.name;

// Calendar
// display control
pikupDate.addEventListener("click", (e) => {
  e.preventDefault();
  let displayCalendar = document.getElementById("calendar-wrapper");
  if (displayCalendar.style.display === "none") {
    displayCalendar.style.display = "block";
  } else {
    displayCalendar.style.display = "none";
  }
});

// calendar logic
const weeks = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const date = new Date();
let year = date.getFullYear();
let month = date.getMonth() + 1;
const config = {
  show: 1,
};
function showCalendar(year, month) {
  for (let i = 0; i < config.show; i++) {
    const calendarHtml = createCalendar(year, month);
    const sec = document.createElement("section");
    sec.innerHTML = calendarHtml;
    document
      .querySelector("#calendar")
      .insertAdjacentHTML("afterbegin", "<h1>" + year + "/" + month + "</h1>");
    document.querySelector("#calendar").appendChild(sec);

    month++;
    if (month > 12) {
      year++;
      month = 1;
    }
  }
}

function createCalendar(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const endDayCount = endDate.getDate();
  const lastMonthEndDate = new Date(year, month - 2, 0);
  const lastMonthendDayCount = lastMonthEndDate.getDate();
  const startDay = startDate.getDay();
  let dayCount = 1;
  let calendarHtml = "";

  // calendarHtml += "<h1>" + year + "/" + month + "</h1>";
  calendarHtml += "<table>";
  for (let i = 0; i < weeks.length; i++) {
    calendarHtml += "<td>" + weeks[i] + "</td>";
  }
  for (let w = 0; w < 6; w++) {
    calendarHtml += "<tr>";
    for (let d = 0; d < 7; d++) {
      if (w == 0 && d < startDay) {
        let num = lastMonthendDayCount - startDay + d + 1;
        calendarHtml += '<td class="is-disabled">' + num + "</td>";
      } else if (dayCount > endDayCount) {
        let num = dayCount - endDayCount;
        calendarHtml += '<td class="is-disabled">' + num + "</td>";
        dayCount++;
      } else {
        calendarHtml += `<td class="calendar_td" data-date="${year}/${month}/${dayCount}">${dayCount}</td>`;
        dayCount++;
      }
    }
    calendarHtml += "</tr>";
  }
  calendarHtml += "</table>";
  return calendarHtml;
}

function moveCalendar(e) {
  document.querySelector("#calendar").innerHTML = "";
  if (e.target.id === "prev") {
    month--;
    if (month < 1) {
      year--;
      month = 12;
    }
  }
  if (e.target.id === "next") {
    month++;
    if (month > 12) {
      year++;
      month = 1;
    }
  }

  showCalendar(year, month);
}

document.querySelector("#prev").addEventListener("click", moveCalendar);
document.querySelector("#next").addEventListener("click", moveCalendar);

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("calendar_td")) {
    pikupDate.value = e.target.dataset.date;
    document.getElementById("calendar-wrapper").style.display = "none";
  }
});
showCalendar(year, month);

// Time of pickup
// time options
var quarterHours = ["00", "30"];
var times = [];
for (var i = 9; i < 21; i++) {
  for (var j = 0; j < 2; j++) {
    times.push(i + ":" + quarterHours[j]);
  }
}
console.log(times);
// render
times.forEach((el) => {
  pikupTime.insertAdjacentHTML("beforeend", `<option>${el}</option>`);
});

// Event : Back

// Event : Save & Proceed
btnSavePickup.addEventListener("click", async (e) => {
  e.preventDefault();
  await updateDoc(doc(db, "users", `${userId}`), {
    "userName.firstName": `${firstname.value}`,
    "userName.lastName": `${lastname.value}`,
    "address.city": `${city.value}`,
    "address.province": `${province.value}`,
    "address.detail": `${street.value}`,
    "address.roomNumEtc": `${unitNumber.value}`,
    "address.zipCode": `${zipCode.value}`,
    "ongoing_order.date": `${pikupDate.value}`,
    "ongoing_order.time": `${pikupTime.value}`,
    "storageLocation.name": `${storageLocation.value}`,
  });
});

// ------------------------------
// 3. Storage Size
// load plan data from 'Company' and render first
const docPlan = await getDoc(doc(db, "Company", "plan"));
const docPlanSize = docPlan.data().size;
// Render the price
smallPrice.textContent = `$${docPlanSize.small.price}`;
mediumPrice.textContent = `$${docPlanSize.medium.price}`;
largePrice.textContent = `$${docPlanSize.large.price}`;

// btn click
const btnSelectClick = function (btn, size) {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "users", `${userId}`), {
      "plan.size": size,
    });
  });
};
// execute
btnSelectClick(btnSelectSmall, "small");
btnSelectClick(btnSelectMedium, "medium");
btnSelectClick(btnSelectLarge, "large");

// ------------------------------
// 4. Storage Plan
// define variables

const docPlanTerm = docPlan.data().term;
// Read user's size for calc later
const selectedSize = docSnap.data().plan.size;
// calc function
const calcTotalPrice = function (discount, size) {
  return Math.trunc(discount * docPlanSize[size].price);
};
// Render it
tripShort.textContent = `${docPlanTerm.short.numTrip}`;
tripMid.textContent = `${docPlanTerm.mid.numTrip}`;
tripLong.textContent = `${docPlanTerm.long.numTrip}`;
monthShort.textContent = `${docPlanTerm.short.numMonth}`;
monthMid.textContent = `${docPlanTerm.mid.numMonth}`;
monthLong.textContent = `${docPlanTerm.long.numMonth}`;
priceShort.textContent = `$${calcTotalPrice(
  docPlanTerm.short.discount,
  selectedSize
)}`;
priceMid.textContent = `$${calcTotalPrice(
  docPlanTerm.mid.discount,
  selectedSize
)}`;
priceLong.textContent = `$${calcTotalPrice(
  docPlanTerm.long.discount,
  selectedSize
)}`;
// btn click
const btnTermClick = function (btn, term) {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "users", `${userId}`), {
      "plan.term": term,
    });
  });
};
btnTermClick(btnShort, "short");
btnTermClick(btnMid, "mid");
btnTermClick(btnLong, "long");

// ---------------------------
// for modal
const modal = document.getElementById("easyModal");
const buttonClose = document.getElementsByClassName("modalClose")[0];

function setupEventListener() {
  const listupPic = document.getElementById("listup-pic");

  if (listupPic) {
    listupPic.addEventListener("click", function (e) {
      modalOpen(e);
    });
  }
}

setupEventListener();

function modalOpen(e, itemData = "", itemId = "") {
  
  initiateModel();

  document.getElementById("imageUpload").style.display = "none";
  
  if (itemData) {
    onEditModel(itemData.picture);
    if (itemId != "") {
      currentEditingItemId = itemId;
    }
    document.getElementById("newItemName").value = itemData.itemName;
    document.getElementById("displayItemName").style.display = "block";
    displayItemNameElement.textContent = itemData.itemName;
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
    if (document.getElementById("newItemName").value != '') {
      modal.style.display = "block";
      if (image == null || image == undefined) {
        openCamera();
      }
    } else {
      alert("Please enter a item name.");
    }
  }

  // saveItem.style.display = "inline-block";
}

buttonClose.addEventListener("click", modalClose);

function modalClose() {
  
  modal.style.display = "none";
  if (image == undefined || image == null) {
    clearModelData()
  }
  if (currentEditingItemId > 0) {
    editSaveItem();
  }
}

addEventListener("click", outsideClose);

function outsideClose(e) {
  if (e.target == modal) {
    modal.style.display = "none";

    if (image == undefined || image == null) {
      clearModelData()
    }
  }
}

function clearModelData() {
  document.getElementById("newItemName").value = "";
  document.getElementById("displayItemName").value = "";
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.hidden = true;
}

function initiateModel() {
  currentEditingItemId = 0;
  retakeBtn.disabled = false;
  reuploadBtn.disabled = false;
  document.getElementById("capture").style.display = "inline-block";
  document.getElementById("retake").style.display = "none";
  document.getElementById("reupload").style.display = "none";
  document.getElementById("uploadButton").style.display = "inline-block";
  document.getElementById("saveImage").style.display = "none";
}

function onEditModel(picture) {
  currentEditingItemId = 0;

  if (picture && picture !== "") {
    document.getElementById("capture").style.display = "none";
    document.getElementById("retake").style.display = "inline-block";
    document.getElementById("reupload").style.display = "inline-block";
    document.getElementById("uploadButton").style.display = "none";
  } else {
    openCamera();
    document.getElementById("capture").style.display = "inline-block";
    document.getElementById("retake").style.display = "none";
    document.getElementById("reupload").style.display = "none";
    document.getElementById("uploadButton").style.display = "inline-block";
  }
  document.getElementById("saveImage").style.display = "none";
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
        // captureBtn.style.display = "inline-block";
        // uploadButton.style.display = "none";
        // saveBtn.style.display = "inline-block";
      })
      .catch(function (err) {
        console.log("An error occurred: " + err);
      });
  }
}