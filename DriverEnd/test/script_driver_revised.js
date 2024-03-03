import {
  objArr,
  update,
  db,
  getOrder,
  getDoc,
  doc,
} from "./forDriverEnd/load.js";

const createHtmlElement = (type, value = null, textContent = null) => {
  const element = document.createElement(type);
  if (value) {
    element.value = value;
  }
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
};

const renderOrders = (
  userID,
  date,
  name,
  status,
  orderID,
  address,
  driverID
) => {
  const divOrder = createHtmlElement("div");
  divOrder.setAttribute("class", "order");

  const img = createHtmlElement("img");
  img.setAttribute("src", "https://picsum.photos/43/43");
  divOrder.appendChild(img);

  const timeAndNameElements = [
    { type: "p", value: null, textContent: date },
    { type: "p", value: null, textContent: name },
  ];
  const divTimeAndName = createHtmlElement("div");
  divTimeAndName.setAttribute("class", "time-and-name");
  timeAndNameElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divTimeAndName.appendChild(element);
  });
  divOrder.appendChild(divTimeAndName);

  const divOrderStatus = createHtmlElement(
    "div",
    null,
    status === "requested" ? "New Trip" : "Ongoing Trip"
  );
  divOrderStatus.setAttribute(
    "class",
    status === "requested" ? "orderStatus newTrip" : "orderStatus ongoingTrip"
  );
  divOrder.appendChild(divOrderStatus);

  const orderIDElements = [
    { type: "p", className: null, value: null, textContent: "Order ID" },
    { type: "p", className: null, value: null, textContent: orderID },
  ];
  const divOrderID = createHtmlElement("div");
  divOrderID.setAttribute("class", "orderID");
  orderIDElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divOrderID.appendChild(element);
  });
  divOrder.appendChild(divOrderID);

  const orderAddressElements = [
    { type: "div", className: "orderAddress", value: null, textContent: null },
    { type: "p", className: null, value: null, textContent: "Address" },
    { type: "p", className: null, value: null, textContent: address },
  ];
  const divOrderAddress = createHtmlElement("div");
  divOrderAddress.setAttribute("class", "orderAddress");
  orderAddressElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divOrderAddress.appendChild(element);
  });
  divOrder.appendChild(divOrderAddress);

  const btn = createHtmlElement(
    "button",
    null,
    status === "requested" ? "Start Trip" : `Assigned to ${driverID}`
  );
  btn.setAttribute(
    "class",
    status === "requested" ? "btnStartTrip" : "btnDriverAssigned"
  );
  if (btn.classList[0] === "btnStartTrip") {
    console.log(btn.classList[0]);
    btn.onclick = (e) => {
      e.preventDefault();
      document.querySelector(".popupBackground").style.display = "grid";

      const form = createHtmlElement("form");
      form.setAttribute("id", `${userID}_${orderID}`);

      const select = createHtmlElement("select");
      form.appendChild(select);

      const options = [
        { type: "option", value: "Driver 1", textContent: "Driver 1" },
        { type: "option", value: "Driver 2", textContent: "Driver 2" },
        { type: "option", value: "Driver 3", textContent: "Driver 3" },
      ];
      options.forEach(({ type, value, textContent }) => {
        const element = createHtmlElement(type, value, textContent);
        select.add(element);
      });

      const btnConfirmDriver = createHtmlElement(
        "button",
        null,
        "Confirm and Proceed"
      );
      btnConfirmDriver.setAttribute("class", "btnConfirmDriver");
      form.appendChild(btnConfirmDriver);

      form.onsubmit = (e) => {
        e.preventDefault();

        document.querySelector(".orders").style.display = "none";
        document.querySelector(".popupBackground").style.display = "none";
        document.querySelector(".tripDetails").style.display = "block";

        const formOrderDetail = document.querySelector(".orderDetail");
        formOrderDetail.setAttribute("id", `${userID}_${orderID}`);

        const divOrderDetailAddress = createHtmlElement("div");
        divOrderDetailAddress.setAttribute("class", "orderDetailAddress");
        const imgAddress = createHtmlElement("img");
        imgAddress.setAttribute("src", "https://picsum.photos/45/45");
        const pAddress = createHtmlElement("p", null, address);
        divOrderDetailAddress.appendChild(imgAddress);
        divOrderDetailAddress.appendChild(pAddress);
        formOrderDetail.insertBefore(
          divOrderDetailAddress,
          formOrderDetail.firstChild
        );

        const divOrderDetailName = createHtmlElement("div");
        divOrderDetailName.setAttribute("class", "orderDetailName");
        const imgName = createHtmlElement("img");
        imgName.setAttribute("src", "https://picsum.photos/45/45");
        const pName = createHtmlElement("p", null, name);
        divOrderDetailName.appendChild(imgName);
        divOrderDetailName.appendChild(pName);
        formOrderDetail.insertBefore(
          divOrderDetailName,
          formOrderDetail.firstChild
        );

        const orderDetailIDElements = [
          { type: "p", className: null, value: null, textContent: "Order ID" },
          { type: "p", className: null, value: null, textContent: orderID },
        ];
        const divOrderDetailID = createHtmlElement("div");
        divOrderDetailID.setAttribute("class", "orderDetailID");
        orderDetailIDElements.forEach(({ type, value, textContent }) => {
          const element = createHtmlElement(type, value, textContent);
          divOrderDetailID.appendChild(element);
        });
        formOrderDetail.insertBefore(
          divOrderDetailID,
          formOrderDetail.firstChild
        );

        formOrderDetail.onsubmit = (e) => {
          e.preventDefault();
          console.log("order doneee");
        };
      };

      document.querySelector(".popup").appendChild(form);
    };
  }
  divOrder.appendChild(btn);

  document.querySelector(".orders").appendChild(divOrder);
};

objArr.forEach((orderObj) => {
  const orderID = Object.keys(orderObj)[0];
  const status = orderObj[orderID].status;

  // don't show 'done' status order
  if (status !== "done") {
    const orderDate = orderObj[orderID].orderDate;
    const userID = orderObj[orderID].userId;
    const fullName = `${orderObj[orderID].userName.firstName} ${orderObj[orderID].userName.lastName}`;
    const addressFull = `${orderObj[orderID].address.detail}, ${orderObj[orderID].address.city}, ${orderObj[orderID].address.province} ${orderObj[orderID].address.zipCode}`;
    const addressShort = `${orderObj[orderID].address.detail} ${orderObj[orderID].address.zipCode}`;
    const driverID = orderObj[orderID].driverId;

    renderOrders(
      userID,
      orderDate,
      fullName,
      status,
      orderID,
      addressShort,
      driverID
    );
  }
});
