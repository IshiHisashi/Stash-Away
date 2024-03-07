"use strict";

import {
  objArr,
  update,
  db,
  getOrder,
  getDoc,
  doc,
} from "./forDriverEnd/load.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const uid = urlParams.get("uid");
const oid = urlParams.get("oid");
console.log(uid, oid);

const get = await getOrder(uid, oid);
const order = get.data();
const address = `${order.address.detail}, ${order.address.city}, ${order.address.province} ${order.address.zipCode}`;
const name = `${order.userName.firstName} ${order.userName.lastName}`;

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
    window.location.href = "driver.html";
  }
};

const renderTripDetails = (userID, orderID, address, name) => {
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
    "https://picsum.photos/45/45"
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
    "https://picsum.photos/45/45"
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

  // EVENT BEHAVIOUR: "Trip Completed" button (form submission) behaviour
  formOrderDetail.onsubmit = async (e) => {
    e.preventDefault();

    await tripCompletedBehaviour(userID, orderID);
  };
};

renderTripDetails(uid, oid, address, name);
