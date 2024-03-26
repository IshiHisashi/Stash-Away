"use strict";

import * as common from "../../common.js";
import { initHeader } from "../homepage/header/header.js";
import { initFooter } from "../homepage/footer/footer.js";
// Initialize Firebase---------------
const db = common.db;
// General : Get company info
const companyPlanSnap = await common.getDoc(common.doc(db, "Company", "plan"));
const companyStorageLocationSnap = await common.getDoc(
  common.doc(db, "Company", "storageLocation")
);
const companyPlanDoc = companyPlanSnap.data();
const companyStorageLocationDoc = companyStorageLocationSnap.data();
/// General : Get users in 'usersID'
const uid = await common.getCurrentUid();
// const uid = "3ZGNxHC1avOoTevnctvkhBMwH962";

console.log(uid);
const userSnap = await common.getDoc(common.doc(db, "users", `${uid}`));
const userDoc = userSnap.data();
// General : Get item (document) in 'inStorage' (subcollection):
const queryStorage = common.collection(db, "users", `${uid}`, "inStorage");
const snapShot = await common.getDocs(queryStorage);
// ----------------------------------

// define variable / fnc ------------
// var_DoM
// For Overlay-control
const overlay1 = document.getElementById("overlay-1");
const overlay2 = document.getElementById("overlay-2");
const overlay3 = document.getElementById("overlay-3");
const overlay4 = document.getElementById("overlay-4");

// For Progress bar
const listItemsM = document.getElementById("list-items-m");
const pickUpAddressM = document.getElementById("pick-up-address-m");
const storageSizeM = document.getElementById("storage-size-m");
const selectPlanM = document.getElementById("select-plan-m");
const progressBarM = document.querySelector(".progress-mobile .progress-bar");
const progressBarL = document.querySelector(".progress-large .progress-bar");

// For 1. Booking_additem
const item = document.getElementById("item");
const newItemName = document.getElementById("newItemName");
const displayItemName = document.getElementById("displayItemName");
const displayItemNameElement = document.getElementById("displayItemName");
const btnSave = document.getElementById("btnSave");
const itemList = document.getElementById("item-list");
const btnProceed = document.getElementById("btn-proceed");
const itemNameLabel = document.getElementById("itemnamelabel");

// For 2. Booking_pick-up
const firstname = document.getElementById("firstname");
const lastname = document.getElementById("lastname");
const unitNumber = document.getElementById("unitnumber");
const street = document.getElementById("street");
const city = document.getElementById("city");
const province = document.getElementById("province");
const zipCode = document.getElementById("zipcode");
const pickupDate = document.getElementById("pickup-date");
const pickuptimeDiv = document.getElementById("pickup-time-div");
const pickuptimeUl = document.getElementById("pickup-time-ul");
const storageLocationDiv = document.getElementById("storage-location-div");
const storageLocationUl = document.getElementById("storage-location-ul");
const btnBackPickup = document.getElementById("btn-back-pikup");
const btnSavePickup = document.getElementById("btn-save-pickup");

// For 3. Booking_Size selection
const smallPrice = document.getElementById("small-price");
const mediumPrice = document.getElementById("medium-price");
const largePrice = document.getElementById("large-price");
const btnSelectSmall = document.getElementById("btn-small");
const btnSelectMedium = document.getElementById("btn-medium");
const btnSelectLarge = document.getElementById("btn-large");
const btnSaveSize = document.getElementById("btn-save-size");
const btnBackSize = document.getElementById("btn-back-size");

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
const btnSavePlan = document.getElementById("btn-save-plan");
const btnBackPlan = document.getElementById("btn-back-plan");

//using camera
const cameraIcon = document.getElementById("cameraIcon");
const captureBtn = document.getElementById("capture");
const retakeBtn = document.getElementById("retake");
const reuploadBtn = document.getElementById("reupload");
const saveBtn = document.getElementById("saveItem");
const saveImageBtn = document.getElementById("saveImage");
const backBtn = document.getElementById("backButton");
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

// --------------------------------
// For Prathibha

async function loadComponent(componentPath, placeholderId) {
  try {
    const response = await fetch(componentPath);
    const componentHTML = await response.text();
    document.getElementById(placeholderId).innerHTML = componentHTML;
  } catch (error) {
    console.error("An error occurred while loading the component:", error);
  }
}

async function init() {
  try {
    await loadComponent("../homepage/header/header.html", "header-placeholder");
    initHeader();
    await loadComponent("../homepage/footer/footer.html", "footer-placeholder");
    initFooter();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}

const renderListFor = function (doc) {
  for (let i = 0; i < doc.length; i++) {
    if (doc[i].data().status === "saved") {
      const item = doc[i].data();
      const itemID = doc[i].id;
      const itemImageSrc = item.picture
        ? item.picture
        : "../images/img_no-pic.png";

      itemList.insertAdjacentHTML(
        "beforeend",
        `<li class='item-list-li'>
        <div class="item-card">
          <div class="item-set1">
            <img src='${itemImageSrc}' class='placeholder-pic' alt='Item Image'>
            <div contenteditable='true' class='editable-item-name' id='nameitem_${itemID}'>${item.itemName}</div>
          </div>
          <div class="item-name-container">
            <i class="fa-solid fa-check icon1 save hidden margin" id="saveitem_${itemID}"></i>
            <img class="icon2 pic" src="../icons/camera-02.png" id="picitem_${itemID}">
            <img class="icon3 delete" src="../icons/delete.png" id="deleteitem_${itemID}">
          </div>
        </div>
      </li>`
      );

      const editableNameElement = document.getElementById(`nameitem_${itemID}`);
      let originalContent = item.itemName; // Store the original content here

      editableNameElement.addEventListener("focus", function () {
        const saveIconElement = document.getElementById(`saveitem_${itemID}`);
        saveIconElement.classList.remove("hidden"); // Show the save icon
        originalContent = editableNameElement.innerText; // Update original content on focus
      });

      editableNameElement.addEventListener("blur", function () {
        const currentContent = editableNameElement.innerText;
        if (currentContent === originalContent) {
          const saveIconElement = document.getElementById(`saveitem_${itemID}`);
          saveIconElement.classList.add("hidden"); // Hide the save icon if content hasn't changed
        }
      });

      const saveIconElement = document.getElementById(`saveitem_${itemID}`);
      saveIconElement.addEventListener("click", async function () {
        const newName = document.getElementById(`nameitem_${itemID}`).innerText;
        await saveItemNameEdit(itemID, newName);
        saveIconElement.classList.add("hidden"); // Hide the save icon after saving
      });

      const iconElement = document.getElementById(`picitem_${itemID}`);
      iconElement.addEventListener("click", function (e) {
        itemData = item;
        modalOpen(e, item, doc[i].id);
      });
    }
  }
  if (doc.length > 0) {
    updateProceedButtonState();
  }
};

async function saveItemNameEdit(itemId, newName) {
  if (!newName.trim()) {
    alert("Please provide an item name.");
    return;
  }

  try {
    await common.updateDoc(common.doc(db, "users", uid, "inStorage", itemId), {
      itemName: newName.trim(),
    });
    alert("Item name updated successfully!");
  } catch (error) {
    console.error("Error updating document: ", error);
    alert("Failed to update item.");
  }
}

// Render list
itemList.innerHTML = "";
const unsubscribe = common.onSnapshot(queryStorage, (querySnapshot) => {
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
      common.deleteDoc(
        common.doc(common.db, "users", uid, "inStorage", `${deleteID}`)
      );

      updateProceedButtonState();
    });
  });
});

//camera
captureBtn.addEventListener("click", function (e) {
  e.preventDefault();

  // document.getElementById("displayItemName").style.display = "block"; // Show input after image capture
  displayItemNameElement.textContent =
    document.getElementById("newItemName").value;

  const fixedWidth = 400;
  const fixedHeight = 300;
  canvas.width = fixedWidth;
  canvas.height = fixedHeight;

  const scale = Math.min(
    canvas.width / video.videoWidth,
    canvas.height / video.videoHeight
  );
  const scaledWidth = video.videoWidth * scale;
  const scaledHeight = video.videoHeight * scale;

  const xOffset = (canvas.width - scaledWidth) / 2;
  const yOffset = (canvas.height - scaledHeight) / 2;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(video, xOffset, yOffset, scaledWidth, scaledHeight);
  canvas.hidden = false;
  document.getElementById("itemnamelabel").style.display = "none";
  document.getElementById("capture").style.display = "none";
  document.getElementById("retake").style.display = "flex";
  document.getElementById("saveImage").style.display = "flex";
  document.getElementById("backButton").style.display = "inline-block";
  document.getElementById("displayItemName").style.display = "inline-block";

  video.hidden = true;
  uploadButton.style.display = "none";

  canvas.toBlob(function (blob) {
    console.log(blob);
    image = blob;
    console.log(image);
  }, "image/jpeg");

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
});

retakeBtn.addEventListener("click", function (e) {
  e.preventDefault();
  canvas.hidden = true;
  video.hidden = false;
  retakeBtn.style.display = "none";
  document.getElementById("capture").style.display = "flex";
  document.getElementById("uploadButton").style.display = "flex";
  document.getElementById("saveImage").style.display = "none";
  document.getElementById("displayItemName").style.display = "none";
  document.getElementById("reupload").style.display = "none";
  document.getElementById("itemnamelabel").style.display = "inline-block";

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
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
  document.getElementById("itemnamelabel").style.display = "none";
});

reuploadBtn.addEventListener("click", function (e) {
  e.preventDefault();
  imageUpload.value = "";
  imageUpload.click();
  canvas.hidden = true;
  video.hidden = true;
});

imageUpload.addEventListener("change", function (e) {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    processFile(file);
  } else {
    console.log("No file selected or upload cancelled.");
  }
});

function processFile(file) {
  document.getElementById("displayItemName").style.display = "block"; // Show input after image capture
  displayItemNameElement.textContent =
    document.getElementById("newItemName").value;

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const fixedWidth = 400;
        const fixedHeight = 300;
        canvas.width = fixedWidth;
        canvas.height = fixedHeight;

        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
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

    document.getElementById("capture").style.display = "none";
    document.getElementById("uploadButton").style.display = "none";
    document.getElementById("retake").style.display = "none";
    document.getElementById("reupload").style.display = "flex";
    document.getElementById("saveImage").style.display = "flex";
    document.getElementById("backButton").style.display = "inline-block";
  } else {
    openCamera();
    document.getElementById("reupload").style.display = "none";
    document.getElementById("saveImage").style.display = "none";
    document.getElementById("capture").style.display = "flex";
    document.getElementById("uploadButton").style.display = "flex";
    document.getElementById("displayItemName").style.display = "none";
    document.getElementById("backButton").style.display = "none";
  }
}

saveImageBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  modalClose();

  if (currentEditingItemId) {
    await saveItem();
  }
});

saveBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  await saveItem();
});

async function saveItem() {
  const itemName = document.getElementById("newItemName").value;
  debugger;
  if (!itemName.trim() && !currentEditingItemId) {
    alert("Please provide an item name.");
    return;
  }

  let imageReference = null;
  if (image) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(
      `photos/${itemName.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.jpg`
    );
    const snapshot = await imageRef.put(image);
    imageReference = await snapshot.ref.getDownloadURL();
  }

  if (currentEditingItemId) {
    await common.updateDoc(
      common.doc(db, "users", uid, "inStorage", currentEditingItemId),
      {
        picture: imageReference || itemData.picture,
      }
    );
    alert("Item image updated successfully!");
    updateProceedButtonState();
    document.getElementById("newItemName").value = "";
    updateButtonState();
  } else {
    await common.addDoc(common.collection(db, "users", uid, "inStorage"), {
      itemName,
      boxNumber:
        (
          await common.getDocs(
            common.query(common.collection(db, "users", uid, "inStorage"))
          )
        ).docs.length + 1,
      picture: imageReference || "",
      storedDate: "2024-01-31",
      status: "saved",
    });
    alert("Item added successfully!");
    updateProceedButtonState();
    document.getElementById("newItemName").value = "";
    updateButtonState();
  }

  modalClose();
  clearModelData();
}

function updateProceedButtonState() {
  const itemList = document.querySelectorAll(".item-list-li");
  const btnProceed = document.getElementById("btn-proceed");
  if (itemList.length > 0) {
    btnProceed.classList.remove("disabled");
    btnProceed.href = "#pickup-info"; // Enable the link
  } else {
    btnProceed.classList.add("disabled");
    btnProceed.removeAttribute("href"); // Disable the link
  }
}

const itemsContainer = document.getElementById("itemsContainer");
// Prathibha_end

// Press proceed
btnProceed.addEventListener("click", () => {
  // Overlay change
  overlay1.classList.add("overlay");
  overlay2.classList.remove("overlay");
  // update progress bar for Mobile
  listItemsM.classList.add("hide");
  pickUpAddressM.classList.remove("hide");
  progressBarM.style.width = "36%";
  // update progress bad for Large
  document.querySelector(".list-your-item >span").classList.add("hide");
  document.querySelector(".list-your-item>div").classList.remove("hide");
  document
    .querySelector(".pick-up-address>span")
    .classList.replace("circle-yet", "circle-now");
  progressBarL.style.width = "22%";
});

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
pickupDate.value = userDoc.ongoing_order ? userDoc.ongoing_order.date : "";
pickuptimeDiv.insertAdjacentHTML(
  "afterbegin",
  `${
    userDoc.ongoing_order ? userDoc.ongoing_order.time : ""
  } <img id="filter-arrow" src="../icons/chevron-down-b.png"/>`
);
storageLocationDiv.insertAdjacentHTML(
  "afterbegin",
  `${userDoc.storageLocation.name}<img id="filter-arrow" src="../icons/chevron-down-b.png"/>`
);

// Calendar
// display control
pickupDate.addEventListener("click", (e) => {
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
    pickupDate.value = e.target.dataset.date;
    document.getElementById("calendar-wrapper").style.display = "none";
  }
});
showCalendar(year, month);

// Filtering Area (pickuptime & storagelocation)
// filtering function
// toggle pull-down list
const pulldownToggle = function (div, ul) {
  div.addEventListener("click", (e) => {
    e.preventDefault();
    ul.classList.toggle("hidden");
  });
};
// select pulldown
const selectPulldown = function (arr, div, ul) {
  Array.from(arr).forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      div.innerHTML = "";
      div.insertAdjacentHTML(
        "afterbegin",
        `${el.textContent}  <img src="../icons/chevron-down-b.png" />`
      );
      ul.classList.add("hidden");
    });
  });
};

// Pickup time
// Time of pickup
// time options
let quarterHours = ["00", "30"];
let times = [];
for (let i = 9; i < 21; i++) {
  for (let j = 0; j < 2; j++) {
    times.push(i + ":" + quarterHours[j]);
  }
}
// Render
times.forEach((el) => {
  pickuptimeUl.insertAdjacentHTML(
    "beforeend",
    `<li class='pickup-time-li' id=${el}>${el}</li>`
  );
});
const pickuptimeLi = document.getElementsByClassName("pickup-time-li");
// Execute pulldown
pulldownToggle(pickuptimeDiv, pickuptimeUl);
selectPulldown(pickuptimeLi, pickuptimeDiv, pickuptimeUl);

// Storage Location
const storageLocationLi = document.getElementsByClassName(
  "storage-location-li"
);
// Execute pulldown
pulldownToggle(storageLocationDiv, storageLocationUl);
selectPulldown(storageLocationLi, storageLocationDiv, storageLocationUl);

// Event : Back
btnBackPickup.addEventListener("click", async () => {
  // overlay control
  overlay1.classList.remove("overlay");
  overlay2.classList.add("overlay");
  // update progress bar for Mobile
  listItemsM.classList.remove("hide");
  pickUpAddressM.classList.add("hide");
  progressBarM.style.width = "18%";
  // update progress bad for Large
  document.querySelector(".list-your-item >span").classList.remove("hide");
  document.querySelector(".list-your-item>div").classList.add("hide");
  document
    .querySelector(".pick-up-address >span")
    .classList.replace("circle-now", "circle-yet");
  progressBarL.style.width = "5%";
});

// Event : Save & Proceed
btnSavePickup.addEventListener("click", async (e) => {
  // Required Alert
  if (
    firstname.value === "" ||
    lastname.value === "" ||
    city.value === "" ||
    province.value === "" ||
    street.value === "" ||
    unitNumber.value === "" ||
    zipCode.value === "" ||
    pickupDate.value === "" ||
    pickuptimeDiv.textContent === "" ||
    storageLocationDiv.textContent === ""
  ) {
    alert("Please fill in all the required information");
  } else {
    // e.preventDefault();
    const geoCodeArray = [];
    let wholeAddress = await `${street.value}, ${city.value}, Britich Columbia`;
    await tt.services
      .geocode({
        key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
        query: wholeAddress,
      })
      .then((response) => {
        console.log(response);
        let userLat = response.results[0].position.lat;
        let userLon = response.results[0].position.lng;
        geoCodeArray.push(userLon);
        geoCodeArray.push(userLat);
        console.log(geoCodeArray);
      });
    common.updateDoc(common.doc(db, "users", uid), {
      "userName.firstName": `${firstname.value}`,
      "userName.lastName": `${lastname.value}`,
      "address.city": `${city.value}`,
      "address.province": `${province.value}`,
      "address.detail": `${street.value}`,
      "address.roomNumEtc": `${unitNumber.value}`,
      "address.geoCode": geoCodeArray,
      "address.zipCode": `${zipCode.value}`,
      "ongoing_order.date": `${pickupDate.value}`,
      "ongoing_order.time": `${pickuptimeDiv.textContent}`,
      "storageLocation.name": `${storageLocationDiv.textContent}`,
    });
    // overlay contorol
    overlay2.classList.add("overlay");
    overlay3.classList.remove("overlay");
    // update progress bar for Mobile
    pickUpAddressM.classList.add("hide");
    storageSizeM.classList.remove("hide");
    progressBarM.style.width = "54%";
    // update progress bad for Large
    document.querySelector(".pick-up-address >span").classList.add("hide");
    document.querySelector(".pick-up-address>div").classList.remove("hide");
    document
      .querySelector(".storage-size>span")
      .classList.replace("circle-yet", "circle-now");
    progressBarL.style.width = "47%";
    // Then, go to next section
    function scrollToID(id, margin) {
      const elm = document.getElementById(id);
      window.scrollTo({
        top: elm.offsetTop + margin,
        // behavior: "smooth",
      });
    }
    scrollToID("select-plan");
  }
});

// ------------------------------

// 3. Storage Size
// load plan data from 'Company' and render first
const docPlanSize = companyPlanDoc.size;
// Render the price
smallPrice.textContent = `$${docPlanSize.small.price}`;
mediumPrice.textContent = `$${docPlanSize.medium.price}`;
largePrice.textContent = `$${docPlanSize.large.price}`;

// initial setting (if already selected)
const btnSelectSizeAll = document.querySelectorAll(".storage-size .btn-select");
if (userDoc.plan?.size) {
  // able btn
  document.querySelector(".storage-size .btn-div").classList.remove("grey");
  for (let i = 0; i < btnSelectSizeAll.length; i++) {
    if (btnSelectSizeAll[i].id.includes(userDoc.plan.size)) {
      document
        .querySelector(`.${userDoc.plan.size}-size`)
        .classList.add("selected");
    }
  }
}

// btn click to select size
const btnSelectClick = function (btn, size) {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    // Update database
    await common.updateDoc(common.doc(db, "users", uid), {
      "plan.size": size,
    });
    // Style selected size
    // delete default setting
    document.querySelectorAll(".size-box").forEach((el) => {
      el.classList.remove("selected");
    });
    // style newly selected one
    for (let i = 0; i < btnSelectSizeAll.length; i++) {
      if (btnSelectSizeAll[i].id.includes(size)) {
        document.querySelector(`.${size}-size`).classList.add("selected");
      }
    }
    // able btn
    document.querySelector(".storage-size .btn-div").classList.remove("grey");
    // update section#4
    priceShort.textContent = `$${calcTotalPrice(
      docPlanTerm.short.discount,
      size
    )}`;
    priceMid.textContent = `$${calcTotalPrice(docPlanTerm.mid.discount, size)}`;
    priceLong.textContent = `$${calcTotalPrice(
      docPlanTerm.long.discount,
      size
    )}`;
  });
};
// calc function to return price based on selected plan
const calcTotalPrice = function (discount, size) {
  if (size) {
    return Math.trunc(discount * docPlanSize[size].price);
  } else {
    return "-";
  }
};

// execute
btnSelectClick(btnSelectSmall, "small");
btnSelectClick(btnSelectMedium, "medium");
btnSelectClick(btnSelectLarge, "large");

// Press back
btnBackSize.addEventListener("click", () => {
  // overlay contorol
  overlay2.classList.remove("overlay");
  overlay3.classList.add("overlay");
  // update progress bar for Mobile
  storageSizeM.classList.add("hide");
  pickUpAddressM.classList.remove("hide");
  progressBarM.style.width = "36%";
  // update progress bar for Large
  document.querySelector(".pick-up-address >span").classList.remove("hide");
  document.querySelector(".pick-up-address>div").classList.add("hide");
  document
    .querySelector(".storage-size >span")
    .classList.replace("circle-now", "circle-yet");
  progressBarL.style.width = "22%";
});

// Press next
btnSaveSize.addEventListener("click", () => {
  // overlay contorol
  overlay3.classList.add("overlay");
  overlay4.classList.remove("overlay");
  // update progress bar
  storageSizeM.classList.add("hide");
  selectPlanM.classList.remove("hide");
  progressBarM.style.width = "72%";
  // update progress bad for Large
  document.querySelector(".storage-size >span").classList.add("hide");
  document.querySelector(".storage-size>div").classList.remove("hide");
  document
    .querySelector(".select-plan>span")
    .classList.replace("circle-yet", "circle-now");
  progressBarL.style.width = "70%";
});

// ------------------------------
// 4. Storage Plan
// define variables

let docPlanTerm = companyPlanDoc.term;
// Read user's size for calc later
let selectedSize = userDoc.plan?.size;

// Render term
tripShort.textContent = `${docPlanTerm.short.numTrip}`;
tripMid.textContent = `${docPlanTerm.mid.numTrip}`;
tripLong.textContent = `${docPlanTerm.long.numTrip}`;
monthShort.textContent = `${docPlanTerm.short.numMonth}`;
monthMid.textContent = `${docPlanTerm.mid.numMonth}`;
monthLong.textContent = `${docPlanTerm.long.numMonth}`;
// Render price, based on the selected size in the previous section(#3)
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

// initial setting (if already selected)
const btnSelectTermAll = document.querySelectorAll(".select-plan .btn-select");
if (userDoc.plan?.term) {
  // able btn
  document.querySelector(".select-plan .btn-div").classList.remove("grey");
  for (let i = 0; i < btnSelectTermAll.length; i++) {
    if (btnSelectTermAll[i].id.includes(userDoc.plan.term)) {
      document.querySelector(`.${userDoc.plan.term}`).classList.add("selected");
    }
  }
}

// btn click to select term
const btnTermClick = function (btn, term) {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    common.updateDoc(common.doc(db, "users", uid), {
      "plan.term": term,
    });
    document.querySelectorAll(".term-box").forEach((el) => {
      el.classList.remove("selected");
    });
    for (let i = 0; i < btnSelectTermAll.length; i++) {
      if (btnSelectTermAll[i].id.includes(term)) {
        document.querySelector(`.${term}`).classList.add("selected");
      }
    }
    // able btn
    document.querySelector(".select-plan .btn-div").classList.remove("grey");
  });
};
// Execute
btnTermClick(btnShort, "short");
btnTermClick(btnMid, "mid");
btnTermClick(btnLong, "long");

// Press back
btnBackPlan.addEventListener("click", () => {
  // overlay contorol
  overlay3.classList.remove("overlay");
  overlay4.classList.add("overlay");
  // update progress bar for Mobile
  selectPlanM.classList.add("hide");
  storageSizeM.classList.remove("hide");
  progressBarM.style.width = "54%";
  // update progress bar for Lerge
  document.querySelector(".storage-size >span").classList.remove("hide");
  document.querySelector(".storage-size>div").classList.add("hide");
  document
    .querySelector(".select-plan >span")
    .classList.replace("circle-now", "circle-yet");
  progressBarL.style.width = "47%";
});

// Press proceed to payment

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
    // document.getElementById("newItemName").value = itemData.itemName;
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
    if (document.getElementById("newItemName").value != "") {
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
    clearModelData();
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
      clearModelData();
    }
  }
}

function clearModelData(isBack = false) {
  debugger;
  if (!isBack) {
    document.getElementById("displayItemName").value = "";
  }
  image = null;
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.hidden = true;
}

function initiateModel() {
  currentEditingItemId = 0;
  displayItemNameElement.textContent = "";
  document.getElementById("capture").style.display = "flex";
  document.getElementById("retake").style.display = "none";
  document.getElementById("reupload").style.display = "none";
  document.getElementById("uploadButton").style.display = "flex";
  document.getElementById("saveImage").style.display = "none";
  document.getElementById("backButton").style.display = "none";
}

function onEditModel(picture) {
  currentEditingItemId = 0;

  clearModelData();

  if (picture && picture !== "") {
    closeCamera();
    document.getElementById("capture").style.display = "none";
    document.getElementById("retake").style.display = "flex";
    document.getElementById("reupload").style.display = "flex";
    document.getElementById("uploadButton").style.display = "none";
  } else {
    openCamera();
    document.getElementById("capture").style.display = "flex";
    document.getElementById("retake").style.display = "none";
    document.getElementById("reupload").style.display = "none";
    document.getElementById("uploadButton").style.display = "flex";
  }
  document.getElementById("saveImage").style.display = "none";
}

function openCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then(function (localStream) {
        stream = localStream;
        video.srcObject = stream;
        video.hidden = false;
        video.height = 300;
        video.width = 400;
        // captureBtn.style.display = "inline-block";
        // uploadButton.style.display = "none";
        // saveBtn.style.display = "inline-block";
      })
      .catch(function (err) {
        console.log("An error occurred: " + err);
      });
  }
}

function closeCamera() {
  if (stream) {
    stream.getTracks().forEach(function (track) {
      track.stop();
    });

    video.srcObject = null;
    video.hidden = true;
  }
}

backButton.addEventListener("click", function (e) {
  e.preventDefault();
  clearModelData(true);
  openCamera();
  document.getElementById("capture").style.display = "flex";
  document.getElementById("displayItemName").style.display = "none";
  document.getElementById("retake").style.display = "none";
  document.getElementById("reupload").style.display = "none";
  document.getElementById("saveImage").style.display = "none";
  document.getElementById("backButton").style.display = "none";
  document.getElementById("uploadButton").style.display = "flex";
  document.getElementById("itemnamelabel").style.display = "inline-block";
});

const load = document.getElementById("loading-screen");
const body = document.querySelector("body");
setTimeout(() => {
  load.style.display = "none";
  body.style.overflowY = "auto";
}, 1000);

function updateButtonState() {
  if (newItemName.value.trim() === "") {
    saveBtn.parentElement.classList.add("disabled");
  } else {
    saveBtn.parentElement.classList.remove("disabled");
  }
}

// Initial state check in case there's already text in the input (e.g., browser autofill)
updateButtonState();

newItemName.addEventListener("input", updateButtonState);
