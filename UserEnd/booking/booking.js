"use strict";

import * as common from "../../common.js";
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
// For 2. Booking_pick-up
const firstname = document.getElementById("firstname");
const lastname = document.getElementById("lastname");
const unitNumber = document.getElementById("unitnumber");
const street = document.getElementById("street");
const city = document.getElementById("city");
const province = document.getElementById("province");
const zipCode = document.getElementById("zipcode");
const pickupDate = document.getElementById("pickup-date");
const pickupTime = document.getElementById("pickup-time");
const storageLocation = document.getElementById("storage-location");
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
  document.getElementById("capture").style.display = "none";
  document.getElementById("retake").style.display = "inline-block";
  document.getElementById("saveImage").style.display = "inline-block";
  document.getElementById("backButton").style.display = "inline-block";
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
  document.getElementById("capture").style.display = "inline-block";
  document.getElementById("uploadButton").style.display = "inline-block";
  document.getElementById("saveImage").style.display = "none";
  document.getElementById("displayItemName").style.display = "none";
  document.getElementById("reupload").style.display = "none";

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
    document.getElementById("reupload").style.display = "inline-block";
    document.getElementById("saveImage").style.display = "inline-block";
    document.getElementById("backButton").style.display = "inline-block";
  } else {
    openCamera();
    document.getElementById("reupload").style.display = "none";
    document.getElementById("saveImage").style.display = "none";
    document.getElementById("capture").style.display = "inline-block";
    document.getElementById("uploadButton").style.display = "inline-block";
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
  }

  document.getElementById("newItemName").value = "";

  modalClose();
  clearModelData();
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
// pickup-time is separately controled by the function generating the option tags.
storageLocation.value = userDoc.storageLocation.name;

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

// Time of pickup
// time options
let quarterHours = ["00", "30"];
let times = [];
for (let i = 9; i < 21; i++) {
  for (let j = 0; j < 2; j++) {
    times.push(i + ":" + quarterHours[j]);
  }
}
// render
times.forEach((el) => {
  pickupTime.insertAdjacentHTML(
    "beforeend",
    `<option value=${el} ${
      el === userDoc.ongoing_order?.time ? "selected" : ""
    }>${el}</option>`
  );
});

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
    pickupTime.value === "" ||
    storageLocation.value === ""
  ) {
    e.preventDefault();
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
      "ongoing_order.time": `${pickupTime.value}`,
      "storageLocation.name": `${storageLocation.value}`,
    });
  }
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

  debugger;
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
  document.getElementById("capture").style.display = "inline-block";
  document.getElementById("retake").style.display = "none";
  document.getElementById("reupload").style.display = "none";
  document.getElementById("uploadButton").style.display = "inline-block";
  document.getElementById("saveImage").style.display = "none";
  document.getElementById("backButton").style.display = "none";
}

function onEditModel(picture) {
  currentEditingItemId = 0;

  clearModelData();

  if (picture && picture !== "") {
    closeCamera();
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

    video.srcObject = null; // Disconnect the stream from the video element
    video.hidden = true; // Optionally hide the video element
  }
}

backButton.addEventListener("click", function (e) {
  e.preventDefault();
  clearModelData(true);
  openCamera();
  document.getElementById("capture").style.display = "inline-block";
  document.getElementById("displayItemName").style.display = "none";
  document.getElementById("retake").style.display = "none";
  document.getElementById("reupload").style.display = "none";
  document.getElementById("saveImage").style.display = "none";
  document.getElementById("backButton").style.display = "none";
  document.getElementById("uploadButton").style.display = "inline-block";
});

const load = document.getElementById("loading-screen");
const body = document.querySelector("body");
setTimeout(() => {
  load.style.display = "none";
  body.style.overflowY = "auto";
}, 1000);

// HEADER
let user = null;
const basePath = "../";

async function init() {
  try {
    user = await common.getCurrentUserObj();
    updateUIBasedOnUser(user);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

function updateUIBasedOnUser(user) {
  const buttonMyAccount = document.getElementById("btnMyAccount");
  const buttonOrderUpdate = document.getElementById("btnOrderUpdate");
  const buttonViewStorage = document.getElementById("btnViewStorage");
  const buttonProfile = document.getElementById("btnProfile");
  const buttonLogout = document.getElementById("btnLogout");
  const buttonLogin = document.getElementById("btnLogin");
  if (user) {
    console.log(user.uid);
    buttonMyAccount.style.display = "block";
    buttonOrderUpdate.style.display = "block";
    buttonViewStorage.style.display = "block";
    buttonProfile.style.display = "block";
    buttonLogout.style.display = "block";
    buttonLogin.style.display = "none";
  } else {
    console.log("No user is logged in.");
    buttonMyAccount.style.display = "none";
    buttonMyAccount.style.display = "none";
    buttonOrderUpdate.style.display = "none";
    buttonViewStorage.style.display = "none";
    buttonProfile.style.display = "none";
    buttonLogout.style.display = "none";
    buttonLogin.style.display = "block";
  }
}
function toggleDropdown(event) {
  document.getElementById("myDropdown").classList.toggle("show");
  event.stopPropagation();
}

window.onclick = function (event) {
  var dropdowns = document.getElementsByClassName("dropdown-content");
  for (var i = 0; i < dropdowns.length; i++) {
    var openDropdown = dropdowns[i];
    if (openDropdown.classList.contains("show")) {
      openDropdown.classList.remove("show");
    }
  }
};

const isAuthenticated = () => {
  return !!user;
};

init();

const btntoggleMenu = document.getElementById("btntoggleMenu");
if (btntoggleMenu) {
  btntoggleMenu.addEventListener("click", async (e) => {
    e.preventDefault();
    const nav = document.querySelector(".main-menu");
    nav.classList.toggle("active");
  });
}

const btnGeoLocation = document.getElementById("btnGeoLocation");
if (btnGeoLocation) {
  btnGeoLocation.addEventListener("click", async (e) => {
    e.preventDefault();
    window.location.href = `${basePath}home-page-map/index.html`;
  });
}

const btnPricing = document.getElementById("btnPricing");
if (btnPricing) {
  btnPricing.addEventListener("click", function () {
    window.location.href = `${basePath}dummy_payment/dummy_payment.html`;
  });
}

const btnHelpCenter = document.getElementById("btnHelpCenter");
if (btnHelpCenter) {
  btnHelpCenter.addEventListener("click", function () {
    alert("Help Center - Not yet developed!");
  });
}

// const buttonMyAccount = document.querySelector('btnMyAccount');
// if (buttonMyAccount) {
//     buttonMyAccount.addEventListener("click", async (e) => {
//         debugger
//         e.preventDefault();
//         if (window.innerWidth > 600) {
//             var subMenu = e.target.nextElementSibling;
//             subMenu.style.display = subMenu.style.display === 'block' ? 'none' : 'block';
//         }
//     });
// }

const btnOrderUpdate = document.getElementById("btnOrderUpdate");
if (btnOrderUpdate) {
  btnOrderUpdate.addEventListener("click", function () {
    window.location.href = `${basePath}order-confirmation/order-confirmation.html`;
  });
}

const btnViewStorage = document.getElementById("btnViewStorage");
if (btnViewStorage) {
  btnViewStorage.addEventListener("click", function () {
    window.location.href = `${basePath}storage-mgmt/storageMgmt.html`;
  });
}

const btnProfile = document.getElementById("btnProfile");
if (btnProfile) {
  btnProfile.addEventListener("click", function () {
    window.location.href = `${basePath}profile/index.html`;
  });
}

const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", function () {
    common
      .signOut(common.auth)
      .then(() => {
        console.log("signed out");
        window.location.href = "main.html";
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

const btnLogin = document.getElementById("btnLogin");
if (btnLogin) {
  btnLogin.addEventListener("click", function () {
    window.location.href = `${basePath}authentication/login.html`;
  });
}

const btnBookNow = document.getElementById("btnBookNow");
if (btnBookNow) {
  btnBookNow.addEventListener("click", async (e) => {
    e.preventDefault();
    if (isAuthenticated()) {
      window.location.href = `${basePath}booking/booking.html`;
    } else {
      window.location.href = `${basePath}authentication/login.html?returnUrl=${encodeURIComponent(
        `${basePath}booking/booking.html`
      )}`;
    }
  });
}

// const bookNowHero = document.getElementById('bookNowHero');
// if (bookNowHero) {
//     bookNowHero.addEventListener('click', function (event) {
//         event.preventDefault();
//         window.location.href = '../authentication/login.html';
//     });
// }
