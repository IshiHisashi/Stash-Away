import { objArr } from "./forDriverEnd/load.js";
console.log(objArr);

const showPickUps = (userID, name, date, status, address, items, orderID) => {
  const addingSection = document.querySelector(".adding");

  const form = document.createElement("form");
  form.setAttribute("id", userID);
  const userIDP = document.createElement("p");
  const nameP = document.createElement("p");
  const dateP = document.createElement("p");
  const statusP = document.createElement("p");
  const addressP = document.createElement("p");
  const itemsP = document.createElement("p");
  const orderIDP = document.createElement("p");

  userIDP.textContent = `User ID: ${userID}`;
  nameP.textContent = `User Name: ${name}`;
  dateP.textContent = `Order Date: ${date}`;
  statusP.textContent = `Current status: ${status}`;
  addressP.textContent = `Pick-up address: ${address}`;
  itemsP.textContent = `Items: ${items}`;
  orderIDP.textContent = `Order ID: ${orderID}`;

  // generate driver dropdown
  const driver = document.createElement("select");
  const driverDefault = document.createElement("option");
  const driverOption1 = document.createElement("option");
  const driverOption2 = document.createElement("option");
  const driverOption3 = document.createElement("option");
  driverDefault.textContent = "---Allocate a driver---";
  driverOption1.textContent = "driver 1";
  driverOption2.textContent = "driver 2";
  driverOption3.textContent = "driver 3";
  driverOption1.value = "driver 1";
  driverOption2.value = "driver 2";
  driverOption3.value = "driver 3";
  const btnToOngoing = document.createElement("button");
  btnToOngoing.disabled = true;

  btnToOngoing.textContent = "Update status to ongoing";
  btnToOngoing.type = "submit";

  addingSection.appendChild(form);
  form.appendChild(userIDP);
  form.appendChild(nameP);
  form.appendChild(dateP);
  form.appendChild(statusP);
  form.appendChild(addressP);
  form.appendChild(itemsP);
  form.appendChild(orderIDP);
  form.appendChild(driver);
  driver.add(driverDefault);
  driver.add(driverOption1);
  driver.add(driverOption2);
  driver.add(driverOption3);
  form.appendChild(btnToOngoing);

  driver.onchange = (event) => {
    const isDefaultValue = event.target.value === "---Allocate a driver---";

    btnToOngoing.disabled = isDefaultValue;
  };

  form.onsubmit = (event) => {
    event.preventDefault();

    statusP.textContent = `Current status: on-going`;
    statusP.style.color = "red";

    btnToOngoing.disabled = true;
    driver.disabled = true;

    console.log(
      `userId: ${event.target.id}, driverId: ${driver.value}, status: on going`
    );
  };
};

const showDeliveries = (
  userID,
  name,
  date,
  status,
  address,
  items,
  orderID
) => {
  const retrievalSection = document.querySelector(".retrieval");

  const form = document.createElement("form");
  form.setAttribute("id", userID);
  const userIDP = document.createElement("p");
  const nameP = document.createElement("p");
  const dateP = document.createElement("p");
  const statusP = document.createElement("p");
  const addressP = document.createElement("p");
  const itemsP = document.createElement("p");
  const orderIDP = document.createElement("p");

  userIDP.textContent = `User ID: ${orderID}`;
  nameP.textContent = `User Name: ${name}`;
  dateP.textContent = `Order Date: ${date}`;
  statusP.textContent = `Current status: ${status}`;
  addressP.textContent = `Pick-up address: ${address}`;
  itemsP.textContent = `Items: ${items}`;
  orderIDP.textContent = `Order ID: ${orderID}`;

  // generate driver dropdown
  const driver = document.createElement("select");
  const driverDefault = document.createElement("option");
  const driverOption1 = document.createElement("option");
  const driverOption2 = document.createElement("option");
  const driverOption3 = document.createElement("option");
  driverDefault.textContent = "---Allocate a driver---";
  driverOption1.textContent = "driver 1";
  driverOption2.textContent = "driver 2";
  driverOption3.textContent = "driver 3";
  driverOption1.value = "driver 1";
  driverOption2.value = "driver 2";
  driverOption3.value = "driver 3";
  const btnToOngoing = document.createElement("button");

  btnToOngoing.textContent = "Update status";
  btnToOngoing.type = "submit";

  retrievalSection.appendChild(form);
  form.appendChild(userIDP);
  form.appendChild(nameP);
  form.appendChild(dateP);
  form.appendChild(statusP);
  form.appendChild(addressP);
  form.appendChild(itemsP);
  form.appendChild(orderIDP);
  form.appendChild(driver);
  driver.add(driverDefault);
  driver.add(driverOption1);
  driver.add(driverOption2);
  driver.add(driverOption3);
  form.appendChild(btnToOngoing);

  form.onsubmit = (event) => {
    event.preventDefault();

    statusP.textContent = `Current status: on-going`;
    statusP.style.color = "red";

    btnToOngoing.disabled = true;
    driver.disabled = true;

    console.log(
      `userId: ${event.target.id}, driverId: ${driver.value}, status: on going`
    );
  };
};

objArr.forEach((orderObj) => {
  const orderID = Object.keys(orderObj)[0];
  const fullName = `${orderObj[orderID].userName.firstName} ${orderObj[orderID].userName.lastName}`;
  const orderDate = orderObj[orderID].orderDate;
  const status = orderObj[orderID].status;
  const address = `${orderObj[orderID].address.detail}, ${orderObj[orderID].address.city}, ${orderObj[orderID].address.province} ${orderObj[orderID].address.zipCode}`;
  const itemKey = orderObj[orderID].itemKey;
  const userID = orderObj[orderID].userId;

  const orderType = orderObj[orderID].orderType;

  // const storeOrders = [];
  // const retrievalOrders = [];

  if (orderType === "retrieval") {
    showPickUps(userID, fullName, orderDate, status, address, itemKey, orderID);
  }

  if (orderType === "add") {
    showDeliveries(
      userID,
      fullName,
      orderDate,
      status,
      address,
      itemKey,
      orderID
    );
  }
});
