'use strict';

import * as common from "../../common.js";

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
const paymentMethodsArray = [];

if (uid) {
    console.log("Found user id on DB");
    getPaymentInfo()
}

function firstDigit(num) {
    const len = String(num).length;
    const divisor = 10 ** (len - 1);
    return Math.trunc(num / divisor);
}

function getPaymentInfo() {

    // FILL IN PAYMENT INFO =============================
    let size = profileInfo.plan.size;
    let firstLetterUppercase = size.charAt(0).toUpperCase();
    let remainingLetters = size.slice(1);
    let sizeCapped = firstLetterUppercase + remainingLetters;
    document.querySelector('div[id="box-size"] h3').innerHTML = `${sizeCapped} box`;

    let duration = profileInfo.plan.term;
    let planDetailsByDuraton;
    if (duration == "long") {
        planDetailsByDuraton = plansInfo.term.long;
    } else if (duration == "mid") {
        planDetailsByDuraton = plansInfo.term.mid;
    } else if (duration == "short") {
        planDetailsByDuraton = plansInfo.term.short;
    }
    document.querySelector('div[id="duration"] h3').innerHTML = `${planDetailsByDuraton.numMonth}-Months Plan`;



    // PAYMENT METHOD SECTION ================================
    class Card {
        constructor (cardNum, expDate, defaultBoolean, number) {
            this.cardNum = cardNum;
            this.expDate = expDate;
            this.defaultBoolean = defaultBoolean;
            this.number = number
            if (firstDigit(cardNum) == 2 || firstDigit(cardNum) == 5) {
                this.cardBrandUrl = "masterImageUrl"
            } else if (firstDigit(cardNum) == 4) {
                this.cardBrandUrl = "visaImageUrl"
            } else if (firstDigit(cardNum) == 3) {
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
            eachCard.setAttribute("class", "each-card")
            eachCard.appendChild(label);
            cardArea.appendChild(eachCard);
            
        }

        defaultToTrue() {
            this.defaultBoolean = true;
        }

        defaultToFalse() {
            this.defaultBoolean = false;
        }
    }

    const cardArea = document.getElementById("payment-method");
    console.log(cardArea);
    const paymentMethods = profileInfo.payment_method;
    for (let i in paymentMethods) {
        const newCard = new Card(paymentMethods[i]['cardNum'], paymentMethods[i]['expDate'], paymentMethods[i]['defaultBoolean'], i)
        console.log(newCard);
        paymentMethodsArray.push(newCard);
        console.log(paymentMethodsArray);
        if (newCard.defaultBoolean == true) {
            newCard.createInnerHtml();
        }
    }
}