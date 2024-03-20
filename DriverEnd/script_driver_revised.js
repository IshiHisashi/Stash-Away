import {
  // objArr,
  update,
  db,
  getOrder,
  getDoc,
  doc,
} from "./forDriverEnd/load.js";

document.querySelector(".popupBackground").onclick = (e) => {
  e.preventDefault();
  e.target.querySelector("form").remove();
  e.target.style.display = "none";
};

document.querySelector(".popup").onclick = (e) => {
  e.stopPropagation();
};

// common with tripDetail.js
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

const renderOrders = (
  userID,
  date,
  name,
  status,
  orderID,
  address,
  driverID,
  currentPage
) => {
  // order container
  const divOrder = createHtmlElement("div", null, null, "class", "order");

  // user icon
  const img = createHtmlElement("img", null, null, "src", "icons/user.svg");
  divOrder.appendChild(img);

  // order date and name
  const timeAndNameElements = [
    { type: "p", value: null, textContent: date },
    { type: "p", value: null, textContent: name },
  ];
  const divTimeAndName = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "time-and-name"
  );
  timeAndNameElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divTimeAndName.appendChild(element);
  });
  divOrder.appendChild(divTimeAndName);

  // order status chip
  const divOrderStatus = createHtmlElement(
    "div",
    null,
    status === "requested" ? "New Trip" : "Ongoing Trip",
    "class",
    status === "requested" ? "orderStatus newTrip" : "orderStatus ongoingTrip"
  );
  divOrder.appendChild(divOrderStatus);

  // order ID
  const orderIDElements = [
    { type: "p", value: null, textContent: "Order ID" },
    { type: "p", value: null, textContent: orderID },
  ];
  const divOrderID = createHtmlElement("div", null, null, "class", "orderID");
  orderIDElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divOrderID.appendChild(element);
  });
  divOrder.appendChild(divOrderID);

  // address
  const orderAddressElements = [
    { type: "div", value: null, textContent: null },
    { type: "p", value: null, textContent: "Address" },
    { type: "p", value: null, textContent: address },
  ];
  const divOrderAddress = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "orderAddress"
  );
  orderAddressElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divOrderAddress.appendChild(element);
  });
  divOrder.appendChild(divOrderAddress);

  // button ("Assigned to driver#" or "Start Trip")
  const btn = createHtmlElement(
    "button",
    null,
    status === "requested" ? "Start Trip" : `Assigned to ${driverID}`,
    "class",
    status === "requested" ? "btnStartTrip" : "btnDriverAssigned"
  );

  // EVENT BEHAVIOUR: "Start Trip" button behaviour (show popup)
  if (btn.classList[0] === "btnStartTrip") {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
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
          try {
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

            // update DB, get updated info back, and show trip details page
            // --UPDATE DB--
            // Update driverid and status
            await update(uid, oid, formattedETA, driverSelect);
            // Get the updated order info.
            const get = await getOrder(uid, oid);
            const order = get.data();

            // get trip details page ready
            // renderTripDetails(userID, orderID, address, name);
            window.location.href = `driver/tripDetail.html?uid=${userID}&oid=${orderID}`;
          } catch (error) {
            console.log(error);
          }
        })();
      };

      document.querySelector(".popup").appendChild(form);
    };
  }
  divOrder.appendChild(btn);

  document.querySelector(`.orders.${currentPage}`).appendChild(divOrder);

  // EVENT BEHAVIOUR: show trip details page directly from the order cards
  // if (divOrder.querySelector(".btnDriverAssigned")) {
  divOrder.onclick = (e) => {
    e.preventDefault();

    // renderTripDetails(userID, orderID, address, name);

    window.location.href = `driver/tripDetail.html?uid=${userID}&oid=${orderID}`;
  };
  // }
};

const renderAllTrips = (objArr, currentPage) => {
  objArr.forEach((orderObj) => {
    const orderID = Object.keys(orderObj)[0];
    const status = orderObj[orderID].status;

    const orderDate = orderObj[orderID].orderTimestamp;
    const userID = orderObj[orderID].userId;
    const fullName = `${orderObj[orderID].userName.firstName} ${orderObj[orderID].userName.lastName}`;
    const addressFull = `${orderObj[orderID].address.detail}, ${orderObj[orderID].address.city}, ${orderObj[orderID].address.province} ${orderObj[orderID].address.zipCode}`;
    const addressShort = `${orderObj[orderID].address.detail} ${orderObj[orderID].address.zipCode}`;
    const driverID = orderObj[orderID].driverId;

    // don't show 'done' status order
    if (status !== "done") {
      renderOrders(
        userID,
        orderDate,
        fullName,
        status,
        orderID,
        addressShort,
        driverID,
        currentPage
      );
    }
  });

  executeAfterRender();
};

const renderNewTrips = (objArr, currentPage) => {
  const objNewOrdersArr = objArr.filter((obj) => {
    return Object.values(obj)[0].status === "requested";
  });
  renderAllTrips(objNewOrdersArr, currentPage);
};

const renderOngoingTrips = (objArr, currentPage) => {
  const objOngoingOrdersArr = objArr.filter((obj) => {
    return Object.values(obj)[0].status === "on going";
  });
  renderAllTrips(objOngoingOrdersArr, currentPage);
};

const controlCarousel = (currentPage, objArr) => {
  document
    .querySelector(`.orders.${currentPage}`)
    .querySelectorAll(".order")
    .forEach((el) => {
      el.remove();
    });
  switch (currentPage) {
    case "newTrips":
      document.querySelector("li.newTrips").classList.add("current");
      document.querySelector("li.newTrips img").src =
        "icons/book-pick-up_blue.svg";
      document.querySelector("li.ongoingTrips img").src =
        "icons/pick-up-item_grey.svg";
      document.querySelector("li.allTrips img").src =
        "icons/items-stored_grey.svg";
      sectionNewTrips.style.transform = "translateX(0)";
      sectionOngoingTrips.style.transform = "translateX(100%)";
      sectionAllTrips.style.transform = "translateX(200%)";
      renderNewTrips(objArr, currentPage);
      break;
    case "ongoingTrips":
      document.querySelector("li.ongoingTrips").classList.add("current");
      document.querySelector("li.newTrips img").src =
        "icons/book-pick-up_grey.svg";
      document.querySelector("li.ongoingTrips img").src =
        "icons/pick-up-item_blue.svg";
      document.querySelector("li.allTrips img").src =
        "icons/items-stored_grey.svg";
      sectionNewTrips.style.transform = "translateX(-100%)";
      sectionOngoingTrips.style.transform = "translateX(0)";
      sectionAllTrips.style.transform = "translateX(100%)";
      renderOngoingTrips(objArr, currentPage);
      break;
    case "allTrips":
      document.querySelector("li.allTrips").classList.add("current");
      document.querySelector("li.newTrips img").src =
        "icons/book-pick-up_grey.svg";
      document.querySelector("li.ongoingTrips img").src =
        "icons/pick-up-item_grey.svg";
      document.querySelector("li.allTrips img").src =
        "icons/items-stored_blue.svg";
      sectionNewTrips.style.transform = "translateX(-200%)";
      sectionOngoingTrips.style.transform = "translateX(-100%)";
      sectionAllTrips.style.transform = "translateX(0)";
      renderAllTrips(objArr, currentPage);
      break;
  }
};

async function loadVariable() {
  try {
    const { objArr } = await import("./forDriverEnd/load.js");
    let currentPage;
    if (sessionStorage.getItem("currentPage")) {
      currentPage = sessionStorage.getItem("currentPage");
    } else {
      sessionStorage.setItem("currentPage", "allTrips");
      currentPage = sessionStorage.getItem("currentPage");
    }
    controlCarousel(currentPage, objArr);
  } catch (error) {
    console.log(error);
  }
}

// render trips on load
const sectionNewTrips = document.querySelector(".orders.newTrips");
const sectionOngoingTrips = document.querySelector(".orders.ongoingTrips");
const sectionAllTrips = document.querySelector(".orders.allTrips");

sectionNewTrips.style.transform = "translateX(-100%)";
sectionOngoingTrips.style.transform = "translateX(-100%)";
sectionAllTrips.style.transform = "translateX(0)";

loadVariable();

//
//

// Function to execute when all divOrder elements are rendered
const executeAfterRender = function () {
  const footerBegin = document.querySelector(
    `.orders.${sessionStorage.getItem("currentPage")}`
  ).scrollHeight;
  console.log(footerBegin);
  document.querySelector("footer").style.top = `${footerBegin + 60}px`;
};

window.onresize = () => {
  executeAfterRender();
};

// TAB BEHAVIOUR
document.querySelectorAll("header li").forEach((el) => {
  el.onclick = async (e) => {
    e.preventDefault();
    const currentPageClass = e.target.classList[0];
    sessionStorage.setItem("currentPage", currentPageClass);
    const currentPage = sessionStorage.getItem("currentPage");

    document.querySelectorAll("header li").forEach((el) => {
      el.classList.remove("current");
    });
    document.querySelector(`li.${currentPage}`).classList.add("current");
    console.log(document.querySelector(`.${currentPage}`).classList);

    try {
      const { objArr } = await import("./forDriverEnd/load.js");
      controlCarousel(currentPage, objArr);
    } catch (error) {
      console.log(error);
    }
  };
});
