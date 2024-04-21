import { tomtomMapsApiKey } from "../../api.js";

import * as common from "../../common.js";

import { initHeader } from "../homepage/header/header.js";
import { initFooter } from "../homepage/footer/footer.js";
import { tomtomMapsApiKey } from "../../api.js";

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
    // await loadComponent('../homepage/body/body.html', 'body-placeholder');
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

// Initialize Firebase---------------
const db = common.db;
const uid = await common.getCurrentUid();
const companyPlanSnap = await common.getDoc(common.doc(db, "Company", "plan"));
const companyStorageLocationSnap = await common.getDoc(
  common.doc(db, "Company", "storageLocation")
);
const companyPlanDoc = companyPlanSnap.data();
const companyStorageLocationDoc = companyStorageLocationSnap.data();
/// General : Get users in 'usersID'
const userSnap = await common.getDoc(common.doc(db, "users", `${uid}`));
const userDoc = userSnap.data();
// ----------------------------

// const app = initializeApp(firebaseConfig);
// const db = common.getFirestore(app);
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

// ASYNC FUNCTION TO FILL IN INPUT FIELD

function getProfileInfo() {
  // ACCOUNT PROFILE SECTION =============================
  const inputfields = document.querySelectorAll('input[name="profile-input"]');
  if (profileInfo.userName.firstName) {
    inputfields[0].value = profileInfo.userName.firstName;
  }
  if (profileInfo.userName.lastName) {
    inputfields[1].value = profileInfo.userName.lastName;
  }
  if (profileInfo.contact.email) {
    inputfields[2].value = profileInfo.contact.email;
  }
  if (profileInfo.contact.phone) {
    inputfields[3].value = profileInfo.contact.phone;
  }
  if (profileInfo.address.roomNumEtc) {
    inputfields[4].value = profileInfo.address.roomNumEtc;
  }
  if (profileInfo.address.detail) {
    inputfields[5].value = profileInfo.address.detail;
  }
  if (profileInfo.address.city) {
    inputfields[6].value = profileInfo.address.city;
  }
  if (profileInfo.address.province) {
    inputfields[7].value = profileInfo.address.province;
  }
  if (profileInfo.address.zipCode) {
    inputfields[8].value = profileInfo.address.zipCode;
  }

  // MEMBERSHIPT SECTION ===================================
  if (profileInfo.plan) {
    let size = profileInfo.plan.size;
    let firstLetterUppercase = size.charAt(0).toUpperCase();
    let remainingLetters = size.slice(1);
    let sizeCapped = firstLetterUppercase + remainingLetters;
    document.getElementById(
      "storage-size"
    ).innerHTML = `<img src="../icons/check.png" alt="check icon">${sizeCapped} Storage`;

    let duration = profileInfo.plan.term;
    let planDetailsByDuraton;
    if (duration == "long") {
      planDetailsByDuraton = plansInfo.term.long;
    } else if (duration == "mid") {
      planDetailsByDuraton = plansInfo.term.mid;
    } else if (duration == "short") {
      planDetailsByDuraton = plansInfo.term.short;
    }
    document.getElementById(
      "duration"
    ).innerHTML = `${planDetailsByDuraton.numMonth}-Months Plan`;

    let originalPrice;
    if (size == "large") {
      originalPrice = plansInfo.size.large.price;
    } else if (size == "medium") {
      originalPrice = plansInfo.size.medium.price;
    } else if (size == "small") {
      originalPrice = plansInfo.size.small.price;
    }

    if (duration !== "short") {
      document.getElementById(
        "plan-price"
      ).innerHTML = `$${originalPrice}/month`;
      document.getElementById("plan-price").style.textDecoration =
        "line-through";
    } else {
      let planPrice = document.getElementById("plan-price");
      planPrice.style.gridRow = "-1/-2";
      planPrice.style.color = "var(--light-pink)";
      planPrice.style.fontFamily = "var(--body-family)";
      planPrice.style.fontSize = "var(--body-size)";
      planPrice.style.fontWeight = "var(--body-weight)";
      planPrice.style.lineHeight = "var(--body-line-height)";
      planPrice.innerHTML =
        "You might want to get a great discount by changing your plan!";
    }

    let discountedPrice =
      Math.round(originalPrice * planDetailsByDuraton.discount * 10) / 10;
    document.getElementById(
      "discounted"
    ).innerHTML = `$${discountedPrice}/month`;

    document.getElementById(
      "free-trip"
    ).innerHTML = `<img src="../icons/check.png" alt="check icon">${planDetailsByDuraton.numTrip} Free Trips`;
  }

  // PAYMENT METHOD SECTION ================================
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
      let brandName = document.createElement("p");
      brandName.setAttribute("class", "brand-name");
      let brandNode = document.createTextNode(`${this.brandName}`);
      brandName.appendChild(brandNode);
      let cardNumPara = document.createElement("p");
      cardNumPara.setAttribute("class", "card-num");
      let lastFourDigits = this.cardNum % Math.pow(10, 4);
      let node = document.createTextNode(`${lastFourDigits}`);
      cardNumPara.appendChild(node);
      let sepatator = document.createElement("p");
      sepatator.innerText = "|";
      let expiration = document.createElement("p");
      expiration.setAttribute("class", "exp-date");
      let node2 = document.createTextNode(this.expDate);
      expiration.appendChild(node2);
      let cardRadioBtn = document.createElement("input");
      cardRadioBtn.setAttribute("type", "radio");
      cardRadioBtn.setAttribute("id", `card-${this.number}`);
      cardRadioBtn.setAttribute("name", "card-number");
      cardRadioBtn.setAttribute("value", `${this.cardNum}`);
      if (this.defaultBoolean == true) {
        cardRadioBtn.setAttribute("checked", "");
      }
      label.appendChild(image);
      label.appendChild(brandName);
      label.appendChild(cardNumPara);
      label.appendChild(sepatator);
      label.appendChild(expiration);
      let eachCard = document.createElement("div");
      eachCard.setAttribute("class", "each-card");
      eachCard.appendChild(label);
      eachCard.appendChild(cardRadioBtn);
      fieldSetArea.appendChild(eachCard);
    }

    defaultToTrue() {
      this.defaultBoolean = true;
    }

    defaultToFalse() {
      this.defaultBoolean = false;
    }
  }

  const fieldSetArea = document.querySelector("#payment-method fieldset");
  console.log(fieldSetArea);
  const paymentMethods = profileInfo.payment_method;
  for (let i in paymentMethods) {
    const newCard = new Card(
      paymentMethods[i]["cardNum"],
      paymentMethods[i]["expDate"],
      paymentMethods[i]["defaultBoolean"],
      i
    );
    console.log(newCard);
    paymentMethodsArray.push(newCard);
    console.log(paymentMethodsArray);
    newCard.createInnerHtml();
  }
}

// ONLY WHEN UID EXISTS, FIRE THE FUNCTIONS ABOVE

if (uid) {
  console.log("Found user id on DB");

  loadingAndShow();
  async function loadingAndShow() {
    await getProfileInfo();
    await radioBtnWork();
    console.log("all the data retrieved.");
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

// SAVE CHANGE ON PROFILE SECTION =================

const saveProfileBtn = document.getElementById("save-profile");
saveProfileBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const inputfields = document.querySelectorAll('input[name="profile-input"]');
  const firstName = inputfields[0].value;
  const lastName = inputfields[1].value;
  const emailAddress = inputfields[2].value;
  const phoneNum = inputfields[3].value;
  const roomNumEtc = inputfields[4].value;
  const street = inputfields[5].value;
  const city = inputfields[6].value;
  const province = inputfields[7].value;
  const zipCode = inputfields[8].value;
  const geoCodeArray = [];
  const wholeAddress = await `${street}, ${city}, Britich Columbia`;
  await tt.services
    .geocode({
      key: tomtomMapsApiKey,
      query: wholeAddress,
    })
    .then((response) => {
      console.log(response);
      const userLat = response.results[0].position.lat;
      const userLon = response.results[0].position.lng;
      geoCodeArray.push(userLon);
      geoCodeArray.push(userLat);
      console.log(geoCodeArray);
    });
  const geoCode = geoCodeArray;

  updateProfileInfo(
    firstName,
    lastName,
    emailAddress,
    phoneNum,
    roomNumEtc,
    street,
    city,
    province,
    zipCode,
    geoCode
  );
  saveProfileBtn.style.backgroundColor = "var(--grey-1)";
  alert("Account profile is saved.");
});

const updateProfileInfo = async function (
  fName,
  lName,
  email,
  phone,
  etc,
  detail,
  city,
  province,
  zip,
  gCode
) {
  await common.updateDoc(common.doc(db, "users", `${uid}`), {
    "address.city": city,
    "address.detail": detail,
    "address.roomNumEtc": etc,
    "address.province": province,
    "address.zipCode": zip,
    "contact.email": email,
    "contact.phone": phone,
    "userName.firstName": fName,
    "userName.lastName": lName,
    "address.geoCode": gCode,
  });

  console.log(
    `${fName}, ${lName}, ${email}, ${phone}, ${etc}, ${detail}, ${city}, ${province}, ${zip}, ${gCode}`
  );
};

// RADIO BUTTON ONCHANGED EVENT ============================

// 🚨 FIX THIS LATERRRRRRR.  🚨

function radioBtnWork() {
  const radioBtns = document.querySelectorAll('input[name="card-number"]');
  console.log(radioBtns);
  for (let i = 0; i <= radioBtns.length - 1; i++) {
    radioBtns[i].addEventListener("click", (e) => {
      for (let j = 0; j <= radioBtns.length - 1; j++) {
        let paymentMethodItem = paymentMethodsArray[j];
        if (j == i) {
          paymentMethodItem.defaultToTrue();
          console.log(paymentMethodItem);
        } else {
          paymentMethodItem.defaultToFalse();
          console.log(paymentMethodItem);
        }
      }
      const newArray = paymentMethodsArray.map(
        ({ cardBrand, cardNum, defaultBoolean, expDate, number }) => ({
          cardNum,
          defaultBoolean,
          expDate,
        })
      );
      console.log(newArray);
      updateDefaultBoolean(newArray);
      alert(`You chose a card with number: ${radioBtns[i].value}`);
    });
  }
}

const updateDefaultBoolean = async function (array) {
  await common.updateDoc(common.doc(db, "users", `${uid}`), {
    payment_method: array,
  });
};

const accountSection = document.querySelector("#account-profile form fieldset");
accountSection.addEventListener("change", () => {
  console.log("fired");
  saveProfileBtn.style.backgroundColor = "var(--pink)";
});
