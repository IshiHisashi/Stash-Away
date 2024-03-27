"use strict";
import * as common from "../../common.js";

import { initHeader } from '../homepage/header/header.js';
import { initFooter } from '../homepage/footer/footer.js';

async function loadComponent(componentPath, placeholderId) {
    try {
        const response = await fetch(componentPath);
        const componentHTML = await response.text();
        document.getElementById(placeholderId).innerHTML = componentHTML;
    } catch (error) {
        console.error('An error occurred while loading the component:', error);
    }
}

async function init() {
    try {
        await loadComponent('../homepage/header/header.html', 'header-placeholder');
        initHeader();
        // await loadComponent('../homepage/body/body.html', 'body-placeholder');
        await loadComponent('../homepage/footer/footer.html', 'footer-placeholder');
        initFooter();
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

if (document.readyState === 'complete' || document.readyState !== 'loading' && !document.documentElement.doScroll) {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}

// Initialize Firebase---------------
const db = common.db;
const uid = await common.getCurrentUid();
// General : Get company info
const companyPlanSnap = await common.getDoc(common.doc(db, "Company", "plan"));
const companyStorageLocationSnap = await common.getDoc(
  common.doc(db, "Company", "storageLocation")
);
const companyPlanDoc = companyPlanSnap.data();
const companyStorageLocationDoc = companyStorageLocationSnap.data();
/// General : Get users in 'usersID'
const userSnap = await common.getDoc(common.doc(db, "users", `${uid}`));
const userDoc = userSnap.data();
console.log(userDoc);
// General : Get item (document) in 'inStorage' (subcollection):
const queryStorage = common.collection(db, "users", `${uid}`, "inStorage");
const snapShot = await common.getDocs(queryStorage);
// ----------------------------

console.log("User id downloaded");
console.log(uid);
const profileInfo = userDoc;
console.log("Profile data downloaded");
console.log(profileInfo);
const plansInfo = companyPlanDoc;
const storageInfo = companyStorageLocationDoc;
console.log("Company data downloaded");
console.log(plansInfo);
console.log(storageInfo);
const paymentMethodsArray = [];
const checkedItemArr = [];
const getcheckedItem = userDoc.ongoingRetrievalItems;
console.log(getcheckedItem);
for (let i = 0; i < getcheckedItem.length; i++) {
  const getItem = await common.getDoc(
    common.doc(db, "users", `${uid}`, "inStorage", getcheckedItem[i])
  );
  const checkedItemObj = { id: getItem.id, item: getItem.data() };
  checkedItemArr.push(checkedItemObj);
}
console.log(checkedItemArr);

if (uid) {
  console.log("Found user id on DB");
  loadingAndShow();
  async function loadingAndShow() {
    await getItems();
    await getPaymentInfo();
    console.log("all the data retrieved.")
    const load = document.getElementById("loading-screen");
    const body = document.querySelector("body");
    setTimeout(() => {
      load.style.display = "none";
      body.style.overflowY = "auto";
    }, 1000);
  }
}

function firstDigit(num) {
  const len = String(num).length;
  const divisor = 10 ** (len - 1);
  return Math.trunc(num / divisor);
}

function getItems() {
  class Item {
    constructor(itemName, itemImageUrl) {
      this.itemName = itemName;
      this.itemImageUrl = itemImageUrl;
    }

    createInnerHtml() {
      let itemImage = document.createElement("img");
      if (this.itemImageUrl == "") {
        itemImage.setAttribute("src", "../images/default-image.jpg");
      } else {
        itemImage.setAttribute("src", `${this.itemImageUrl}`);
      }
      itemImage.setAttribute("class", "item-img");
      let name = document.createElement("p");
      name.setAttribute("class", "item-name");
      let nameNode = document.createTextNode(`${this.itemName}`);
      name.appendChild(nameNode);
      let eachList = document.createElement("li");
      eachList.setAttribute("class", "each-item");
      eachList.appendChild(itemImage);
      eachList.appendChild(name);
      itemListArea.appendChild(eachList);
    }
  }

  const itemListArea = document.getElementById("items-list");
  for (let i in checkedItemArr) {
    const newItem = new Item(
      checkedItemArr[i].item.itemName,
      checkedItemArr[i].item.picture
    );
    console.log(newItem);
    newItem.createInnerHtml();
  }
}

function getPaymentInfo() {
  // FILL IN PAYMENT INFO =============================
  let size = profileInfo.plan.size;
  document.querySelector(
    'div[id="box-size"] h3'
  ).innerHTML = `Delivery fee for ${size} box`;

  let fee;
  if (size == "large") {
    fee = plansInfo.size.large.deliveryFee;
  } else if (size == "medium") {
    fee = plansInfo.size.medium.deliveryFee;
  } else if (size == "small") {
    fee = plansInfo.size.small.deliveryFee;
  }

  let tripRemained = userDoc.plan.remainingFreeTrip;
  document.querySelector(
    'div[id="free-trip-left"] h3'
  ).innerHTML = `Free trip left: ${tripRemained}`;

  // Change all the p element innerHTML here
  let subtotal;
  document.querySelector(
    'div[id="box-size"] p'
  ).innerHTML = `$${fee}`;
  let freeTripDiscounted = 0;
  if (tripRemained !== 0) {
    document.querySelector('div[id="box-size"] p').style.textDecoration =
    "line-through";
    document.querySelector('div[id="free-trip-left"] p').innerHTML = `$${freeTripDiscounted}`;
    subtotal = freeTripDiscounted;
  } else {
    document.querySelector('div[id="free-trip-left"] p').innerHTML = "Looks like you used up all the free trips 😭";
    subtotal = fee;
  }
  document.querySelector(
    'div[id="subtotal"] p'
  ).innerHTML = `$${subtotal}`;
  let gst = Math.round(subtotal * 5) / 100;
  let pst = Math.round(subtotal * 7) / 100;
  document.querySelector('div[id="gst"] p').innerHTML = `$${gst}`;
  document.querySelector('div[id="pst"] p').innerHTML = `$${pst}`;
  let total = Math.round((subtotal + gst + pst) * 100) / 100;
  document.querySelector('div[id="total"] p').innerHTML = `$${total}`;

  // CARD INFO SECTION ================================
  class Card {
    constructor(cardNum, expDate, defaultBoolean, number) {
      this.cardNum = cardNum;
      this.expDate = expDate;
      this.defaultBoolean = defaultBoolean;
      this.number = number;
      if (firstDigit(cardNum) == 2 || firstDigit(cardNum) == 5) {
        this.cardBrandUrl = "../images/master-logo.png";
        this.brandName = "Master";
      } else if (firstDigit(cardNum) == 4) {
        this.cardBrandUrl = "../images/visa-logo.png";
        this.brandName = "Visa";
      } else if (firstDigit(cardNum) == 3) {
        this.cardBrandUrl = "../images/amex-logo.png";
        this.brandName = "Amex";
      }
    }

    createInnerHtml() {
      let label = document.createElement("label");
      label.setAttribute("for", `card-${this.number}`);
      let image = document.createElement("img");
      image.setAttribute("src", `${this.cardBrandUrl}`);
      image.setAttribute("class", "card-brand-img");
      let brandName = document.createElement("p")
      brandName.setAttribute("class", "brand-name");
      let brandNode = document.createTextNode(`${this.brandName}`);
      brandName.appendChild(brandNode);
      let cardNumPara = document.createElement("p");
      cardNumPara.setAttribute("class", "card-num");
      let lastFourDigits = this.cardNum % Math.pow(10, 4);
      let node = document.createTextNode(`${lastFourDigits}`);
      cardNumPara.appendChild(node);
      let expiration = document.createElement("p");
      expiration.setAttribute("class", "exp-date");
      let node2 = document.createTextNode(this.expDate);
      expiration.appendChild(node2);
      label.appendChild(image);
      label.appendChild(brandName);
      label.appendChild(cardNumPara);
      label.appendChild(expiration);
      let eachCard = document.createElement("div");
      eachCard.setAttribute("class", "each-card");
      eachCard.appendChild(label);
      let changeCardImg = document.createElement("img");
      changeCardImg.setAttribute("id", "right-arrow");
      changeCardImg.setAttribute("src", "../icons/chevron-right.png");
      changeCardImg.setAttribute("alt", "Change payment method");
      cardArea.appendChild(eachCard);
      cardArea.appendChild(changeCardImg);
    }
  }

  const cardArea = document.getElementById("payment-method");
  // console.log(cardArea);
  const paymentMethods = profileInfo.payment_method;
  for (let i in paymentMethods) {
    const newCard = new Card(
      paymentMethods[i]["cardNum"],
      paymentMethods[i]["expDate"],
      paymentMethods[i]["defaultBoolean"],
      i
    );
    // console.log(newCard);
    paymentMethodsArray.push(newCard);
    // console.log(paymentMethodsArray);
    if (newCard.defaultBoolean == true) {
      newCard.createInnerHtml();
    }
  }
}

// BTN TREATMENT ====================================
const btnRetrieval = document.getElementById("btn-retrieval");
btnRetrieval.addEventListener("click", async (e) => {
  e.preventDefault();
  await common.retrievalOrderSubmitFunction(uid, getcheckedItem, userDoc);

  // Move to the next page
  window.location.href = "../retreival-payment-confirmation/retreival-payment-confirmation.html";
});
