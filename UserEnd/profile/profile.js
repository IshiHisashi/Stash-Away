import * as common from "../../common.js";

// GET CURRENTLY LOGGED IN ACCOUNT INFO

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0Px8PkiCzyTrDcFCWh-mbER-YcWd9d-E",
  authDomain: "fir-jan24.firebaseapp.com",
  projectId: "fir-jan24",
  storageBucket: "fir-jan24.appspot.com",
  messagingSenderId: "831417179844",
  appId: "1:831417179844:web:c3eb03b7fc9c6ef7b03391",
  measurementId: "G-DSYKEF99M1",
};
const app = initializeApp(firebaseConfig);
const db = common.getFirestore(app);
const uid = await common.getCurrentUid();
console.log("User id downloaded")
console.log(uid);
const profileInfo = await common.userDoc;
console.log("Profile data downloaded");
console.log(profileInfo);
const plansInfo = await common.companyPlanDoc;
const storageInfo = await common.companyStorageLocationDoc;
console.log("Company data downloaded");
console.log(plansInfo);
console.log(storageInfo);

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

    // 🚨 ONCE CHANGE TERM INTO ARRAY, OPTIMIZE THE CODE 🚨

    let duration = profileInfo.plan.term;
    let planDetailsByDuraton;
    if (duration == "long") {
        planDetailsByDuraton = plansInfo.term.long;
    } else if (duration == "mid") {
        planDetailsByDuraton = plansInfo.term.mid;
    } else if (duration == "short") {
        planDetailsByDuraton = plansInfo.term.short;
    }
    document.getElementById("duration").innerHTML = `${planDetailsByDuraton.numMonth}-Months Plan`;

    let originalPrice;
    if (size == "large") {
        originalPrice = plansInfo.size.large.price;
    } else if (size == "medium") {
        originalPrice = plansInfo.size.medium.price;
    } else if (size == "small") {
        originalPrice = plansInfo.size.small.price;
    }
    document.getElementById("plan-price").innerHTML = `$${originalPrice}/month`;
    if (duration !== "short") {
        document.getElementById("plan-price").style.textDecoration = "line-through";
    }

    let discountedPrice = Math.round(originalPrice * planDetailsByDuraton.discount * 10 ) / 10;
    document.getElementById("discounted").innerHTML = `$${discountedPrice}/month`;

    document.getElementById("free-trip").innerHTML = `${planDetailsByDuraton.numTrip} Free Trips`

    // PAYMENT METHOD SECTION ================================
    class Card {
        constructor (cardnum, expDate, defaultBoolean) {
            this.cardnum = cardnum;
            this.expDate = expDate;
            this.defaultBoolean = defaultBoolean;
            if (firstDigit(cardnum) == 2 || firstDigit(cardnum) == 5) {
                this.cardBrandUrl = "masterImageUrl"
            } else if (firstDigit(cardnum) == 4) {
                this.cardBrandUrl = "visaImageUrl"
            } else if (firstDigit(cardnum) == 3) {
                this.cardBrandUrl = "amexImageUrl"
            }  
        }
    
        createInnerHtml() {
            let label = document.createElement("label");
            label.setAttribute("for", `card-${this.number}`);
            let image = document.createElement("img");
            // image.setAttribute("src", `${this.cardBrandUrl}`);
            image.setAttribute("class", "card-brand-img");
            let cardNumPara = document.createElement("p");
            cardNumPara.setAttribute("class", "card-num");
            let node = document.createTextNode(`${this.cardnum}`);
            cardNumPara.appendChild(node);
            let expiration = document.createElement("p");
            expiration.setAttribute("class", "exp-date");
            let node2 = document.createTextNode(this.expDate);
            expiration.appendChild(node2);
            let cardRadioBtn = document.createElement("input");
            cardRadioBtn.setAttribute("type", "radio");
            cardRadioBtn.setAttribute("id", `card-${this.number}`);
            cardRadioBtn.setAttribute("name", "card-number");
            cardRadioBtn.setAttribute("value", `${this.cardnum}`);
            if (this.defaultBoolean == true) {
                cardRadioBtn.setAttribute("checked", "");
            }
            label.appendChild(image);
            label.appendChild(cardNumPara);
            label.appendChild(expiration);
            let eachCard = document.createElement("div");
            eachCard.setAttribute("class", "each-card")
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
    const paymentMethodsArray = [];
    for (let i in paymentMethods) {
        const newCard = new Card(paymentMethods[i]['card-number'], paymentMethods[i]['exp-date'], paymentMethods[i]['default'])
        console.log(newCard);
        paymentMethodsArray.push(newCard);
        console.log(paymentMethodsArray);
        newCard.createInnerHtml();
    }
    

}

// ONLY WHEN UID EXISTS, FIRE THE FUNCTIONS ABOVE

if (uid) {
    console.log("Found user id on DB");
    getProfileInfo();
}

function firstDigit(num) {
    const len = String(num).length;
    const divisor = 10 ** (len - 1);
    return Math.trunc(num / divisor);
}

// SAVE CHANGE ON PROFILE SECTION =================

const saveProfileBtn = document.getElementById("save-profile");
saveProfileBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const inputfields = document.querySelectorAll('input[name="profile-input"]');
    let firstName = inputfields[0].value;
    let lastName = inputfields[1].value;
    let emailAddress = inputfields[2].value;
    let phoneNum = inputfields[3].value;
    let roomNumEtc = inputfields[4].value;
    let addressDetail = inputfields[5].value;
    let city = inputfields[6].value;
    let province = inputfields[7].value;
    let zipCode = inputfields[8].value;

    updateProfileInfo(firstName, lastName, emailAddress, phoneNum, roomNumEtc, addressDetail, city, province, zipCode)
})

const updateProfileInfo = async function (fName, lName, email, phone, etc, detail, city, province, zip) {
    await common.updateDoc(common.doc(db, "users", `${uid}`), {
        "address.cit": city,
        "address.detail": detail,
        "address.roomNumEtc": etc,
        "address.province": province,
        "address.zipCode": zip,
        "contact.email": email,
        "contact.phone": phone,
        "userName.firstName": fName,
        "userName.lastName": lName,
    });

    console.log(`${fName}, ${lName}, ${email}, ${phone}, ${etc}, ${detail}, ${city}, ${province}, ${zip}`);
};

// RADIO BUTTON ONCHANGED EVENT ============================

// 🚨 FIX THIS LATERRRRRRR.  🚨

const radioBtns = document.querySelectorAll('input[name="card-number"]');
console.log(radioBtns);
for (let i = 0; i <= radioBtns.length - 1; i++) {
    radioBtns[i].addEventListener("click", (e) => {
        for (let j = 0; j <= radioBtns.length - 1; j++) {
            if (j == i) {
                updateDefaultTrue(j);
            } else {
                updateDefaultFalse(j);
            }
        }
        alert(`You chose a card with number: ${radioBtns[i].value}`);
    })
}

// const updateDefaultTrue = async function (arrayNum) {
//     await common.updateDoc(common.doc(db, "users", `${uid}`), {
//         payment_method: common.arrayRemove(arrayNum.default),
//         });
// };

// const updateDefaultFalse = async function (arrayNum) {
//     await common.updateDoc(common.doc(db, "users", `${uid}`), {  

// };