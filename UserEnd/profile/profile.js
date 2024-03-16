import * as common from "../../common.js";
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
  inputfields[0].value = profileInfo.userName.firstName;
  inputfields[1].value = profileInfo.userName.lastName;
  inputfields[2].value = profileInfo.contact.email;
  inputfields[3].value = profileInfo.contact.phone;
  inputfields[4].value = profileInfo.address.roomNumEtc;
  inputfields[5].value = profileInfo.address.detail;
  inputfields[6].value = profileInfo.address.city;
  inputfields[7].value = profileInfo.address.province;
  inputfields[8].value = profileInfo.address.zipCode;

  // MEMBERSHIPT SECTION ===================================
  let size = profileInfo.plan.size;
  let firstLetterUppercase = size.charAt(0).toUpperCase();
  let remainingLetters = size.slice(1);
  let sizeCapped = firstLetterUppercase + remainingLetters;
  document.getElementById("storage-size").innerHTML = `${sizeCapped} Storage`;

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
    document.getElementById("plan-price").innerHTML = `$${originalPrice}/month`;
    document.getElementById("plan-price").style.textDecoration = "line-through";
  } else {
    document.getElementById("plan-price").innerHTML =
      "You might want to get great discount by changing your plan!";
  }

  let discountedPrice =
    Math.round(originalPrice * planDetailsByDuraton.discount * 10) / 10;
  document.getElementById("discounted").innerHTML = `$${discountedPrice}/month`;

  document.getElementById(
    "free-trip"
  ).innerHTML = `${planDetailsByDuraton.numTrip} Free Trips`;

  // PAYMENT METHOD SECTION ================================
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
      let cardRadioBtn = document.createElement("input");
      cardRadioBtn.setAttribute("type", "radio");
      cardRadioBtn.setAttribute("id", `card-${this.number}`);
      cardRadioBtn.setAttribute("name", "card-number");
      cardRadioBtn.setAttribute("value", `${this.cardNum}`);
      if (this.defaultBoolean == true) {
        cardRadioBtn.setAttribute("checked", "");
      }
      label.appendChild(image);
      label.appendChild(cardNumPara);
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
      key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
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
