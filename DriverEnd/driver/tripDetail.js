"use strict";

import {
  objArr,
  update,
  db,
  getOrder,
  getDoc,
  doc,
} from "../forDriverEnd/load.js";

document.querySelector(".popupBackground").onclick = (e) => {
  e.preventDefault();
  e.target.querySelector("form").remove();
  e.target.style.display = "none";
};

document.querySelector(".popup").onclick = (e) => {
  e.stopPropagation();
};

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const uid = urlParams.get("uid");
const oid = urlParams.get("oid");

const get = await getOrder(uid, oid);
const order = get.data();
console.log(order);
const address = `${order.address.detail}, ${order.address.city}, ${order.address.province} ${order.address.zipCode}`;
const name = `${order.userName.firstName} ${order.userName.lastName}`;
const status = order.status;

const createHtmlElement = (
  type,
  value = null,
  textContent = null,
  att = null,
  attVallue = null
) => {
  const element = document.createElement(type);
  if (value) {
    element.value = value;
  }
  if (textContent) {
    element.textContent = textContent;
  }
  if (att) {
    element.setAttribute(att, attVallue);
  }
  return element;
};

const tripCompletedBehaviour = async (uid, oid) => {
  await update(uid, oid);
  const get = await getOrder(uid, oid);
  const order = get.data();
  if (order.status === "done") {
    alert("Trip successfully ended! Great work buddy! Take some rest:)");
    window.location.href = "../driver.html";
  }
};

const renderTripDetails = (userID, orderID, address, name, status) => {
  // get form container (already exists in HTML)
  const formOrderDetail = document.querySelector(".orderDetail");
  formOrderDetail.setAttribute("id", `${userID}_${orderID}`);

  // address
  const divOrderDetailAddress = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "orderDetailAddress"
  );
  const imgAddress = createHtmlElement(
    "img",
    null,
    null,
    "src",
    "../icons/marker-pin-01_grey.svg"
  );
  const pAddress = createHtmlElement("p", null, address);
  divOrderDetailAddress.appendChild(imgAddress);
  divOrderDetailAddress.appendChild(pAddress);
  formOrderDetail.insertBefore(
    divOrderDetailAddress,
    formOrderDetail.firstChild
  );

  // name
  const divOrderDetailName = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "orderDetailName"
  );
  const imgName = createHtmlElement(
    "img",
    null,
    null,
    "src",
    "../icons/user.svg"
  );
  const pName = createHtmlElement("p", null, name);
  divOrderDetailName.appendChild(imgName);
  divOrderDetailName.appendChild(pName);
  formOrderDetail.insertBefore(divOrderDetailName, formOrderDetail.firstChild);

  // order ID
  const orderDetailIDElements = [
    {
      type: "p",
      value: null,
      textContent: "Order ID",
    },
    {
      type: "p",
      value: null,
      textContent: orderID,
    },
  ];
  const divOrderDetailID = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "orderDetailID"
  );
  orderDetailIDElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divOrderDetailID.appendChild(element);
  });
  formOrderDetail.insertBefore(divOrderDetailID, formOrderDetail.firstChild);

  if (status === "requested") {
    document.querySelector(".btnTripStarted").style.backgroundColor = "#d72e4e";
    document.querySelector(".btnTripStarted").style.cursor = "pointer";
    document.querySelector(".btnTripStarted").disabled = false;
    document.querySelector(".btnTripStarted").textContent = "Start Trip";
    document.querySelector(".btnTripCompleted").style.backgroundColor =
      "#dfdfdf";
    document.querySelector(".btnTripCompleted").style.cursor = "unset";

    document.querySelector(".btnTripCompleted").disabled = true;
  } else if (status === "on going") {
    document.querySelector(".btnTripStarted").style.backgroundColor = "#dfdfdf";
    document.querySelector(".btnTripStarted").style.cursor = "unset";
    document.querySelector(".btnTripStarted").disabled = true;
    document.querySelector(".btnTripStarted").textContent = "Trip Started";
    document.querySelector(".btnTripCompleted").style.backgroundColor =
      "#d72e4e";
    document.querySelector(".btnTripCompleted").style.cursor = "pointer";
    document.querySelector(".btnTripCompleted").disabled = false;
  }

  // EVENT BEHAVIOUR: "Trip Completed" button (form submission) behaviour
  formOrderDetail.onsubmit = async (e) => {
    e.preventDefault();
    console.log(e.submitter.classList[0]);
    if (e.submitter.classList[0] === "btnTripStarted") {
      document.querySelector(".popupBackground").style.display = "grid";

      const form = createHtmlElement(
        "form",
        null,
        null,
        "id",
        `${userID}_${orderID}`
      );

      const driverSelect = createHtmlElement("select");
      form.appendChild(driverSelect);

      const options = [
        { type: "option", value: "Driver 1", textContent: "Driver 1" },
        { type: "option", value: "Driver 2", textContent: "Driver 2" },
        { type: "option", value: "Driver 3", textContent: "Driver 3" },
      ];
      options.forEach(({ type, value, textContent }) => {
        const element = createHtmlElement(type, value, textContent);
        driverSelect.add(element);
      });

      const btnConfirmDriver = createHtmlElement(
        "button",
        null,
        "Confirm and Proceed",
        "class",
        "btnConfirmDriver"
      );
      form.appendChild(btnConfirmDriver);

      // EVENT BEHAVIOUR: "Confirm and Proceed" button (form submission) behaviour
      form.onsubmit = (e) => {
        e.preventDefault();
        console.log(e);

        //  Destructure form id into userid and orderid
        const ids = e.target.id;
        const uid = ids.split("_")[0];
        const oid = ids.split("_")[1];
        (async () => {
          // ETA ///////////////
          // get arrival location (geocode from the order's address)
          const responseUserGeo = await tt.services.geocode({
            key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
            query: address,
          });
          const userLat = responseUserGeo.results[0].position.lat;
          const userLon = responseUserGeo.results[0].position.lng;

          // get driver's departure location (= storage location)
          const docSnap = await getDoc(doc(db, "users", uid));
          console.log(docSnap);
          const driverLat = docSnap.data().storageLocation.latitude;
          const driverLon = docSnap.data().storageLocation.longitude;

          // calculate ETA
          const responseETA = await tt.services.calculateRoute({
            key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
            locations: [
              [driverLat, driverLon],
              [userLat, userLon],
            ],
          });
          const rawETA = new Date(responseETA.routes[0].summary.arrivalTime);
          const formattedETA = rawETA.toLocaleString("en-CA", {
            timeZone: "America/Vancouver",
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "shortGeneric",
          });

          // dismiss popup
          document
            .querySelector(".popupBackground")
            .querySelector("form")
            .remove();
          document.querySelector(".popupBackground").style.display = "none";

          // update DB, get updated info back, and show trip details page
          // --UPDATE DB--
          // Update driverid and status
          await update(uid, oid, formattedETA, driverSelect);
          // Get the updated order info.
          const get = await getOrder(uid, oid);
          const order = get.data();

          // re-render trip details
          document.querySelectorAll("form.orderDetail div").forEach((el) => {
            el.remove();
          });
          renderTripDetails(userID, orderID, address, name, order.status);
          // window.location.href = `driver/tripDetail.html?uid=${userID}&oid=${orderID}`;
        })();
      };
      document.querySelector(".popup").appendChild(form);
    } else if (e.submitter.classList[0] === "btnTripCompleted") {
      await tripCompletedBehaviour(userID, orderID);
    }
  };
};

renderTripDetails(uid, oid, address, name, status);

// TAB BEHAVIOUR
document.querySelectorAll("header li").forEach((el) => {
  el.onclick = (e) => {
    e.preventDefault();
    const currentPageClass = e.target.classList[0];
    sessionStorage.setItem("currentPage", currentPageClass);
    window.location.href = "../driver.html";
  };
});
