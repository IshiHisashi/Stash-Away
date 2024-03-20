import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  db,
} from "../authentication/firebase_firestore.js";

import {
  getCurrentUid,
  getCurrentUserObj,
  signOut,
  auth,
} from "../../common.js";

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

const renderDetail = (
  section,
  orderID,
  address,
  itemKey,
  orderType,
  status,
  orderTimestamp,
  requestedDate,
  requestedTime,
  departTimestamp,
  ETA,
  boxSize
) => {
  // detail container
  const divDetail = createHtmlElement("div", null, null, "class", "detail");
  divDetail.setAttribute("id", orderID);

  // preferred date and time
  const divPreferredDateAndTime = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "preferred-date-and-time"
  );
  const pPreferredDateAndTime = createHtmlElement(
    "p",
    null,
    orderType === "add"
      ? "You have a scheduled pick up at:"
      : "You have a scheduled delivery at:"
  );
  const divPreferredDate = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "preferredDate"
  );
  const divPreferredTime = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "preferredTime"
  );
  const preferredDateElements = [
    { type: "p", value: null, textContent: "DATE" },
    { type: "p", value: null, textContent: requestedDate },
  ];
  const preferredTimeElements = [
    { type: "p", value: null, textContent: "TIME" },
    { type: "p", value: null, textContent: requestedTime },
  ];
  preferredDateElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divPreferredDate.appendChild(element);
  });
  preferredTimeElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divPreferredTime.appendChild(element);
  });
  divPreferredDateAndTime.appendChild(pPreferredDateAndTime);
  divPreferredDateAndTime.appendChild(divPreferredDate);
  divPreferredDateAndTime.appendChild(divPreferredTime);
  divDetail.appendChild(divPreferredDateAndTime);

  // currentStatus and updates
  const divCurrentStatusAndUpdates = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "currentStatus-and-updates"
  );
  const divCurrentStatus = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "currentStatus"
  );
  const currentStatusElements = [
    { type: "h3", value: null, textContent: "CURRENT STATUS" },
    {
      type: "p",
      value: null,
      textContent:
        status === "requested"
          ? "Order Being Processed"
          : status === "on going" && orderType === "add"
          ? "Out For Pickup"
          : status === "on going" && orderType === "retrieval"
          ? "Out For Delivery"
          : "Done",
    },
    {
      type: "p",
      value: null,
      textContent:
        status === "requested" ? "ETA: to be determined" : `ETA: ${ETA}`,
    },
  ];
  currentStatusElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divCurrentStatus.appendChild(element);
  });

  const divUpdates = createHtmlElement("div", null, null, "class", "updates");
  divUpdates.appendChild(createHtmlElement("h3", null, "UPDATES"));

  const milestone1 = createHtmlElement("div", null, null, "class", "milestone");
  milestone1.innerHTML =
    '<svg class="check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="#F4F4F4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  divUpdates.appendChild(milestone1);

  const divUpdatesOrderConfirmed = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "updates-orderConfirmed"
  );
  const updatesOrderConfirmedElements = [
    { type: "p", value: null, textContent: "ORDER CONFIRMED" },
    { type: "p", value: null, textContent: orderTimestamp },
  ];
  updatesOrderConfirmedElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divUpdatesOrderConfirmed.appendChild(element);
  });
  divUpdates.appendChild(divUpdatesOrderConfirmed);
  divUpdatesOrderConfirmed.style.borderLeft = "1px dotted #777777";

  const milestone2 = createHtmlElement("div", null, null, "class", "milestone");
  if (status === "requested") {
    milestone2.innerHTML =
      '<svg class="grey" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#DFDFDF"/></svg>';
  } else {
    milestone2.innerHTML =
      '<svg class="check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="#F4F4F4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  divUpdates.appendChild(milestone2);

  const divUpdatesTripStarted = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "updates-tripStarted"
  );
  const updatesTripStartedElements = [
    {
      type: "p",
      value: null,
      textContent: status === "requested" ? "TRIP NOT STARTED" : "TRIP STARTED",
    },
    {
      type: "p",
      value: null,
      textContent: status === "requested" ? "" : departTimestamp,
    },
  ];
  updatesTripStartedElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    if (status === "requested") {
      element.style.color = "#585858";
    }
    divUpdatesTripStarted.appendChild(element);
  });
  divUpdates.appendChild(divUpdatesTripStarted);
  divUpdatesTripStarted.style.borderLeft = "1px dotted #777777";

  const milestone3 = createHtmlElement("div", null, null, "class", "milestone");
  if (status === "requested") {
    milestone3.innerHTML =
      '<svg class="grey" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#DFDFDF"/></svg>';
  } else if (status === "on going") {
    milestone3.innerHTML =
      '<svg class="yellow" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#F9B035"/></svg>';
  } else {
    milestone3.innerHTML =
      '<svg class="check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="#F4F4F4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  divUpdates.appendChild(milestone3);

  const divUpdatesETA = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "updates-eta"
  );
  divUpdatesETA.appendChild(
    createHtmlElement(
      "p",
      null,
      status === "requested" ? "ETA: to be determined" : `ETA: ${ETA}`
    )
  );
  if (status === "requested") {
    divUpdatesETA.querySelector("p").style.color = "#585858";
  }
  divUpdates.appendChild(divUpdatesETA);
  divUpdatesETA.style.borderLeft = "1px dotted #777777";

  const milestone4 = createHtmlElement("div", null, null, "class", "milestone");
  if (status === "requested" || status === "on going") {
    milestone4.innerHTML =
      '<svg class="grey" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#DFDFDF"/></svg>';
  } else {
    milestone4.innerHTML =
      '<svg class="check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="#F4F4F4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  divUpdates.appendChild(milestone4);

  const divUpdatesTripEnded = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "updates-tripEnded"
  );
  divUpdatesTripEnded.appendChild(
    createHtmlElement("p", null, status === "done" ? "TRIP ENDED" : "")
  );
  divUpdates.appendChild(divUpdatesTripEnded);

  divCurrentStatusAndUpdates.appendChild(divCurrentStatus);
  divCurrentStatusAndUpdates.appendChild(divUpdates);
  divDetail.appendChild(divCurrentStatusAndUpdates);

  // order details
  const divOrderDetails = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "orderDetails"
  );
  divOrderDetails.appendChild(createHtmlElement("h3", null, "ORDER DETAILS"));

  divOrderDetails.appendChild(
    createHtmlElement("img", null, null, "src", "icons/book-pick-up_red.svg")
  );
  const divOrderDetailsItems = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "orderDetails-items"
  );
  const orderDetailsItemsElements = [
    { type: "p", value: null, textContent: "Items" },
    {
      type: "p",
      value: null,
      textContent: `${itemKey.length} products listed`,
    },
  ];
  orderDetailsItemsElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divOrderDetailsItems.appendChild(element);
  });
  divOrderDetails.appendChild(divOrderDetailsItems);

  divOrderDetails.appendChild(
    createHtmlElement("img", null, null, "src", "icons/items-stored_red.svg")
  );
  const divOrderDetailsBoxSize = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "orderDetails-boxSize"
  );
  const orderDetailsBoxSizeElements = [
    { type: "p", value: null, textContent: "Storage Size" },
    { type: "p", value: null, textContent: `${boxSize}` },
  ];
  orderDetailsBoxSizeElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divOrderDetailsBoxSize.appendChild(element);
  });
  divOrderDetails.appendChild(divOrderDetailsBoxSize);

  divOrderDetails.appendChild(
    createHtmlElement("img", null, null, "src", "icons/marker-pin-01_red.svg")
  );
  const divOrderDetailsAddress = createHtmlElement(
    "div",
    null,
    null,
    "class",
    "orderDetails-address"
  );
  const orderDetailsAddressElements = [
    { type: "p", value: null, textContent: "Delivering to" },
    { type: "p", value: null, textContent: `${address}` },
  ];
  orderDetailsAddressElements.forEach(({ type, value, textContent }) => {
    const element = createHtmlElement(type, value, textContent);
    divOrderDetailsAddress.appendChild(element);
  });
  divOrderDetails.appendChild(divOrderDetailsAddress);
  divDetail.appendChild(divOrderDetails);

  section.appendChild(divDetail);
};

const getDetails = async (uid) => {
  try {
    // get storage size
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    const boxSize =
      docSnap.data().plan.size === "small"
        ? "5’ x 5’"
        : docSnap.data().plan.size === "medium"
        ? "5’ x 10’"
        : docSnap.data().plan.size === "large"
        ? "10’ x 10’"
        : null;

    // query criteria: all the documents under the user's 'order' collection, except it's "done".
    const q = query(
      collection(doc(collection(db, "users"), uid), "order"),
      where("status", "!=", "done")
    );
    const objArr = [];
    const order = await getDocs(q);
    order.forEach((el) => {
      const obj = { [el.id]: el.data() };
      objArr.push(obj);
    });
    // console.log(objArr);

    let addingNumber = 0;
    let retrievalNumber = 0;

    objArr.forEach((orderObj) => {
      const orderID = Object.keys(orderObj)[0];
      const status = orderObj[orderID].status;

      // don't show 'done' status order
      if (status !== "done") {
        const address = `${orderObj[orderID].address.detail}, ${orderObj[orderID].address.city}, ${orderObj[orderID].address.province} ${orderObj[orderID].address.zipCode}`;
        const itemKey = orderObj[orderID].itemKey;

        const orderType = orderObj[orderID].orderType;
        orderType === "add" ? addingNumber++ : retrievalNumber++;
        const section = document.querySelector(
          orderType === "add" ? "section.adding" : "section.retrieval"
        );

        const rawOrderTimestamp = new Date(
          orderObj[orderID].orderTimestamp.seconds * 1000 +
            orderObj[orderID].orderTimestamp.nanoseconds / 1000000
        );
        const arrayOrderTimestamp = rawOrderTimestamp
          .toLocaleString("en-CA", {
            timeZone: "America/Vancouver",
            // weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            // timeZoneName: "shortGeneric",
          })
          .split(" ");

        const formattedOrderTimestamp = `${arrayOrderTimestamp[1].substring(
          0,
          arrayOrderTimestamp[1].length - 1
        )}/${arrayOrderTimestamp[0]}/${arrayOrderTimestamp[2].substring(
          0,
          arrayOrderTimestamp[2].length - 1
        )} ${arrayOrderTimestamp[3]}${arrayOrderTimestamp[4]}`;

        const dateArray = orderObj[orderID].requestedDateTime.date.split(" ");

        const requestedDate =
          `${dateArray[2]} ${dateArray[1]} ${dateArray[3]} (${dateArray[0]})`.toUpperCase();
        const requestedTime = orderObj[orderID].requestedDateTime.time;

        let formattedDepartTimestamp;
        if (orderObj[orderID].departTimestamp) {
          const rawDepartTimestamp = new Date(
            orderObj[orderID].departTimestamp.seconds * 1000 +
              orderObj[orderID].departTimestamp.nanoseconds / 1000000
          );
          const arrayDepartTimestamp = rawDepartTimestamp
            .toLocaleString("en-CA", {
              timeZone: "America/Vancouver",
              // weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              // timeZoneName: "shortGeneric",
            })
            .split(" ");

          formattedDepartTimestamp = `${arrayDepartTimestamp[1].substring(
            0,
            arrayDepartTimestamp[1].length - 1
          )}/${arrayDepartTimestamp[0]}/${arrayDepartTimestamp[2].substring(
            0,
            arrayDepartTimestamp[2].length - 1
          )} ${arrayDepartTimestamp[3]}${arrayDepartTimestamp[4]}`;
        } else {
          formattedDepartTimestamp = null;
        }

        let formattedETA;
        if (orderObj[orderID].ETA) {
          const arrayETA = orderObj[orderID].ETA.split(" ");
          formattedETA = `${arrayETA[2].substring(0, arrayETA[2].length - 1)}/${
            arrayETA[1]
          }/${arrayETA[3].substring(0, arrayETA[3].length - 1)} ${arrayETA[4]}${
            arrayETA[5]
          }`;
        } else {
          formattedETA = null;
        }

        // const boxSize = "1 x Small( 18x18x16)";

        renderDetail(
          section,
          orderID,
          address,
          itemKey,
          orderType,
          status,
          formattedOrderTimestamp,
          requestedDate,
          requestedTime,
          formattedDepartTimestamp,
          formattedETA,
          boxSize
        );
      }
    });

    if (addingNumber === 0) {
      if (document.querySelector("section.adding .noOrder")) {
        document.querySelector("section.adding .noOrder").remove();
      }
      document
        .querySelector("section.adding")
        .appendChild(
          createHtmlElement(
            "p",
            null,
            "There is no pickup order.",
            "class",
            "noOrder"
          )
        );
    }
    if (retrievalNumber === 0) {
      if (document.querySelector("section.retrieval .noOrder")) {
        document.querySelector("section.retrieval .noOrder").remove();
      }
      document
        .querySelector("section.retrieval")
        .appendChild(
          createHtmlElement(
            "p",
            null,
            "There is no delivery order.",
            "class",
            "noOrder"
          )
        );
    }

    executeAfterRender();
  } catch (error) {
    console.log(error);
  }
};

const sectionControl = (currentTab, uid) => {
  document
    .querySelector(`section.${currentTab}`)
    .querySelectorAll(".detail")
    .forEach((el) => {
      el.remove();
    });
  switch (currentTab) {
    case "adding":
      document.querySelector("li.adding img").src =
        "icons/items-stored_red.svg";
      document.querySelector("li.retrieval img").src =
        "icons/pick-up-item_blue.svg";
      document.querySelector("section.adding").style.display = "block";
      document.querySelector("section.retrieval").style.display = "none";
      getDetails(uid);
      break;
    case "retrieval":
      document.querySelector("li.adding img").src =
        "icons/items-stored_blue.svg";
      document.querySelector("li.retrieval img").src =
        "icons/pick-up-item_red.svg";
      document.querySelector("section.adding").style.display = "none";
      document.querySelector("section.retrieval").style.display = "block";
      getDetails(uid);
      break;
  }
};

const executeAfterRender = function () {
  const footerBegin = document.querySelector(
    `section.${sessionStorage.getItem("currentTab")}`
  ).scrollHeight;
  console.log(footerBegin);
  document.querySelector("footer").style.top = `${footerBegin}px`;
};

// get currently logged in user.
const uid = await getCurrentUid();
if (uid) {
  // render on load
  let currentTab;
  if (sessionStorage.getItem("currentTab")) {
    currentTab = sessionStorage.getItem("currentTab");
    document.querySelector(`main li.${currentTab}`).classList.add("current");
  } else {
    sessionStorage.setItem("currentTab", "adding");
    currentTab = sessionStorage.getItem("currentTab");
    document.querySelector(`main li.adding`).classList.add("current");
  }
  sectionControl(currentTab, uid);

  window.onresize = () => {
    executeAfterRender();
  };

  // TAB BEHAVIOUR
  document.querySelectorAll("main li").forEach((el) => {
    el.onclick = (e) => {
      e.preventDefault();
      const currentTabClass = e.target.classList[0];
      sessionStorage.setItem("currentTab", currentTabClass);
      const currentTab = sessionStorage.getItem("currentTab");

      document.querySelectorAll("main li").forEach((el) => {
        el.classList.remove("current");
      });
      document.querySelector(`main li.${currentTab}`).classList.add("current");

      sectionControl(currentTab, uid);
    };
  });

  // update info according to Firestore updates
  (async () => {
    try {
      // query criteria: all the documents under the user's 'order' collection
      const q = query(collection(doc(collection(db, "users"), uid), "order"));

      // add change listener to the queried place
      const unsubscribe = await onSnapshot(q, (querySnapshot) => {
        // get an array of the documents changes since the last snapshot.
        querySnapshot.docChanges().forEach((changedDoc) => {
          if (
            changedDoc.type === "modified" &&
            changedDoc.doc.data().status === "on going"
          ) {
            const rawDepartTimestamp = new Date(
              changedDoc.doc.data().departTimestamp.seconds * 1000 +
                changedDoc.doc.data().departTimestamp.nanoseconds / 1000000
            );
            const arrayDepartTimestamp = rawDepartTimestamp
              .toLocaleString("en-CA", {
                timeZone: "America/Vancouver",
                // weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                // timeZoneName: "shortGeneric",
              })
              .split(" ");

            const formattedDepartTimestamp = `${arrayDepartTimestamp[1].substring(
              0,
              arrayDepartTimestamp[1].length - 1
            )}/${arrayDepartTimestamp[0]}/${arrayDepartTimestamp[2].substring(
              0,
              arrayDepartTimestamp[2].length - 1
            )} ${arrayDepartTimestamp[3]}${arrayDepartTimestamp[4]}`;

            const arrayETA = changedDoc.doc.data().ETA.split(" ");
            const formattedETA = `${arrayETA[2].substring(
              0,
              arrayETA[2].length - 1
            )}/${arrayETA[1]}/${arrayETA[3].substring(
              0,
              arrayETA[3].length - 1
            )} ${arrayETA[4]}${arrayETA[5]}`;

            // update current status
            document.querySelectorAll(
              `#${changedDoc.doc.id} .currentStatus p`
            )[0].textContent =
              changedDoc.doc.data().orderType === "add"
                ? "Out For Pickup"
                : "Out For Delivery";
            document.querySelectorAll(
              `#${changedDoc.doc.id} .currentStatus p`
            )[1].textContent = `ETA: ${formattedETA}`;

            // update timeline (tripStarted)
            document.querySelectorAll(
              `#${changedDoc.doc.id} .milestone`
            )[1].innerHTML =
              '<svg class="check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="#F4F4F4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

            document.querySelector(
              `#${changedDoc.doc.id} .updates-tripStarted p:nth-of-type(1)`
            ).textContent = "TRIP STARTED";
            document.querySelector(
              `#${changedDoc.doc.id} .updates-tripStarted p:nth-of-type(1)`
            ).style.color = "#103646";
            document.querySelector(
              `#${changedDoc.doc.id} .updates-tripStarted p:nth-of-type(2)`
            ).textContent = formattedDepartTimestamp;
            document.querySelector(
              `#${changedDoc.doc.id} .updates-tripStarted p:nth-of-type(2)`
            ).style.color = "#103646";

            // update timeline (eta)
            document.querySelectorAll(
              `#${changedDoc.doc.id} .milestone`
            )[2].innerHTML =
              '<svg class="yellow" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#F9B035"/></svg>';
            document.querySelector(
              `#${changedDoc.doc.id} .updates-eta p`
            ).textContent = `ETA: ${formattedETA}`;
            document.querySelector(
              `#${changedDoc.doc.id} .updates-eta p`
            ).style.color = "#103646";

            // notification
            new Notification("StashAway", {
              body: `Driver is on the way! Order ID: ${changedDoc.doc.id}, ETA: ${formattedETA}`,
            });
          } else if (
            changedDoc.type === "modified" &&
            changedDoc.doc.data().status === "done"
          ) {
            // update current status
            document.querySelectorAll(".currentStatus p")[0].textContent =
              "Done";

            // update timeline (eta)
            document.querySelectorAll(
              `#${changedDoc.doc.id} .milestone`
            )[2].innerHTML =
              '<svg class="check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="#F4F4F4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

            // update timeline (ended)
            document.querySelectorAll(
              `#${changedDoc.doc.id} .milestone`
            )[3].innerHTML =
              '<svg class="check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="#F4F4F4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            document.querySelector(
              `#${changedDoc.doc.id} .updates-tripEnded p`
            ).textContent = "TRIP ENDED";
            document.querySelector(
              `#${changedDoc.doc.id} .updates-tripEnded p`
            ).style.color = "#103646";
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  })();
} else {
  console.log("log in first!");
}
