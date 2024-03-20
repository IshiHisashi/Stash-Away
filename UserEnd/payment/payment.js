"use strict";

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

import * as common from "./../../common.js";
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
const savedItemsArr = [];
const save = await common.queryFunction("saved", uid);

console.log(save);
save.docs.forEach((el) => {
  const saveItemObj = { id: el.id, item: el.data() };
  savedItemsArr.push(saveItemObj);
});
console.log(savedItemsArr);

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
  for (let i in savedItemsArr) {
    const newItem = new Item(
      savedItemsArr[i].item.itemName,
      savedItemsArr[i].item.picture
    );
    console.log(newItem);
    newItem.createInnerHtml();
  }
}

function getPaymentInfo() {
  // FILL IN PAYMENT INFO =============================
  let duration = profileInfo.plan.term;
  let size = profileInfo.plan.size;
  let firstLetterUppercase = size.charAt(0).toUpperCase();
  let remainingLetters = size.slice(1);
  let sizeCapped = firstLetterUppercase + remainingLetters;
  document.querySelector(
    'div[id="box-size"] h3'
  ).innerHTML = `${sizeCapped} box`;

  let originalPrice;
  if (size == "large") {
    originalPrice = plansInfo.size.large.price;
  } else if (size == "medium") {
    originalPrice = plansInfo.size.medium.price;
  } else if (size == "small") {
    originalPrice = plansInfo.size.small.price;
  }

  let planDetailsByDuraton;
  if (duration == "long") {
    planDetailsByDuraton = plansInfo.term.long;
  } else if (duration == "mid") {
    planDetailsByDuraton = plansInfo.term.mid;
  } else if (duration == "short") {
    planDetailsByDuraton = plansInfo.term.short;
  }
  document.querySelector(
    'div[id="duration"] h3'
  ).innerHTML = `${planDetailsByDuraton.numMonth}-Months Plan`;

  // Change all the p element innerHTML here
  let subtotal;
  if (duration !== "short") {
    document.querySelector(
      'div[id="box-size"] p'
    ).innerHTML = `$${originalPrice}/month`;
    document.querySelector('div[id="box-size"] p').style.textDecoration = "line-through";
    let discountedPrice =
      Math.round(originalPrice * planDetailsByDuraton.discount * 100) / 100;
    document.querySelector(
      'div[id="duration"] p'
    ).innerHTML = `$${discountedPrice}/month * ${planDetailsByDuraton.numMonth} months`;
    document.querySelector(
      'div[id="subtotal"] p'
    ).innerHTML = `$${discountedPrice * planDetailsByDuraton.numMonth}`;
    subtotal = discountedPrice * planDetailsByDuraton.numMonth;
  } else {
    document.querySelector(
      'div[id="box-size"] p'
    ).innerHTML = `$${originalPrice} for 1 month`;
    document.querySelector('div[id="duration"] p').innerHTML =
      "You might want to get great discount by changing your plan!";
    document.querySelector(
      'div[id="subtotal"] p'
    ).innerHTML = `$${originalPrice}`;
    subtotal = originalPrice;
  }
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
      } else if (firstDigit(cardNum) == 4) {
        this.cardBrandUrl = "../images/visa-logo.png";
      } else if (firstDigit(cardNum) == 3) {
        this.cardBrandUrl = "../images/amex-logo.png";
      }
    }

    createInnerHtml() {
      let label = document.createElement("label");
      label.setAttribute("for", `card-${this.number}`);
      let image = document.createElement("img");
      image.setAttribute("src", `${this.cardBrandUrl}`);
      image.setAttribute("class", "card-brand-img");
      let cardNumPara = document.createElement("p");
      cardNumPara.setAttribute("class", "card-num");
      let node = document.createTextNode(`${this.cardNum}`);
      cardNumPara.appendChild(node);
      let expiration = document.createElement("p");
      expiration.setAttribute("class", "exp-date");
      let node2 = document.createTextNode(this.expDate);
      expiration.appendChild(node2);
      label.appendChild(image);
      label.appendChild(cardNumPara);
      label.appendChild(expiration);
      let eachCard = document.createElement("div");
      eachCard.setAttribute("class", "each-card");
      eachCard.appendChild(label);
      cardArea.appendChild(eachCard);
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
const btnAdd = document.getElementById("btn-add");
btnAdd.addEventListener("click", async (e) => {
  e.preventDefault();
  await common.addOrderSubmitFunction(snapShot, uid, profileInfo, plansInfo);
  // move to the order-update page
  window.location.href = "../updates/pickup-and-delivery-updates.html";
});
