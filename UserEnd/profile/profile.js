import * as common from "../../common.js";

// GET CURRENTLY LOGGED IN ACCOUNT INFO

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

    let discountedPrice = originalPrice * planDetailsByDuraton.discount;
    document.getElementById("discounted").innerHTML = `$${discountedPrice}/month`;

    document.getElementById("free-trip").innerHTML = `${planDetailsByDuraton.numTrip} Free Trips`

    // PAYMENT METHOD SECTION ================================
    class Card {
        constructor (cardnum, expDate, defaultBoolean, number) {
            this.cardnum = cardnum;
            this.expDate = expDate;
            this.defaultBoolean = defaultBoolean;
            this.number = number
            if (firstDigit(cardnum) == 2 || firstDigit(cardnum) == 5) {
                this.cardBrandUrl = "masterImageUrl"
            } else if (firstDigit(cardnum) == 4) {
                this.cardBrandUrl = "visaImageUrl"
            } else if (firstDigit(cardnum) == 3) {
                this.cardBrandUrl = "amexImageUrl"
            }  
        }
    
        createInnerHtml() {
            if (this.defaultBoolean == true) {
                let label = document.createElement("label");
                label.setAttribute("for", `card-${this.number}`);
                let image = document.createElement("img");
                // image.setAttribute("src", `${this.cardBrandUrl}`);
                image.setAttribute("class", "card-brand-img");
                let cardNumPara = document.createElement("p");
                cardNumPara.setAttribute("class", "card-num");
                let node = document.createTextNode(`${this.cardnum}`);
                cardNumPara.appendChild(node);
                // let expiration = document.createElement("p");
                // expiration.setAttribute("class", "exp-date");
                // var date = new Date(this.expDate * 1000)
                // let node2 = document.createTextNode(`${date}`);
                // expiration.appendChild(node2);
                let cardRadioBtn = document.createElement("input");
                cardRadioBtn.setAttribute("type", "radio");
                cardRadioBtn.setAttribute("id", `card-${this.number}`);
                cardRadioBtn.setAttribute("name", "card-number");
                cardRadioBtn.setAttribute("value", `${this.cardnum}`);
                cardRadioBtn.setAttribute("checked", "");
                label.appendChild(image);
                label.appendChild(cardNumPara);
                // label.appendChild(expiration);
                let eachCard = document.createElement("div");
                eachCard.setAttribute("class", "each-card")
                eachCard.appendChild(label);
                eachCard.appendChild(cardRadioBtn);
                fieldSetArea.appendChild(eachCard);
            } else {
                let label = document.createElement("label");
                label.setAttribute("for", `card-${this.number}`);
                let image = document.createElement("img");
                // image.setAttribute("src", `${this.cardBrandUrl}`);
                image.setAttribute("class", "card-brand-img");
                let cardNumPara = document.createElement("p");
                cardNumPara.setAttribute("class", "card-num");
                let node = document.createTextNode(`${this.cardnum}`);
                cardNumPara.appendChild(node);
                let cardRadioBtn = document.createElement("input");
                cardRadioBtn.setAttribute("type", "radio");
                cardRadioBtn.setAttribute("id", `card-${this.number}`);
                cardRadioBtn.setAttribute("name", "card-number");
                cardRadioBtn.setAttribute("value", `${this.cardnum}`);
                label.appendChild(image);
                label.appendChild(cardNumPara);
                let eachCard = document.createElement("div");
                eachCard.setAttribute("class", "each-card")
                eachCard.appendChild(label);
                eachCard.appendChild(cardRadioBtn);
                fieldSetArea.appendChild(eachCard);
            }
            
        }
    }

    const fieldSetArea = document.querySelector("#payment-method fieldset");
    console.log(fieldSetArea);
    const paymentMethods = profileInfo.payment_method;
    for (let i in paymentMethods) {
        const newCard = new Card(paymentMethods[i]['card-number'], paymentMethods[i]['exp-date'], paymentMethods[i]['default'], i)
        console.log(newCard);
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
