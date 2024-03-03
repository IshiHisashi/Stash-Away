import {
  objArr,
  update,
  db,
  getOrder,
  getDoc,
  doc,
} from "./forDriverEnd/load.js";
console.log(objArr);

const createFormElement = (type, value = null, textContent = null) => {
  const element = document.createElement(type);
  if (value) {
    element.value = value;
  }
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
};

const showOrderForm = (
  section,
  userID,
  name,
  date,
  status,
  address,
  items,
  orderID,
  driverID,
  type
) => {
  // create a form field
  const form = createFormElement("form");
  form.setAttribute("id", `${userID}_${orderID}`);

  // create elements which will belong to one form and append them
  const elements = [
    { type: "p", value: null, textContent: `Order Date: ${date}` },
    { type: "p", value: null, textContent: `User Name: ${name}` },
    { type: "p", value: null, textContent: `Current status: ${status}` },
    { type: "p", value: null, textContent: `Order ID: ${orderID}` },
    { type: "p", value: null, textContent: `Address: ${address}` },
    // { type: "p", value: null, textContent: `User ID: ${userID}` },
    // { type: "p", value: null, textContent: `Items: ${items}` },
    { type: "select", value: "" },
    { type: "button", value: null, textContent: "Update status to on going" },
    { type: "button", value: null, textContent: "Update status to done" },
  ];

  let buttonNumber = 1;
  elements.forEach(({ type, value, textContent }) => {
    const element = createFormElement(type, value, textContent);

    // add name to buttons. button 1 would be "change to on going", and button 2 would be "change to done"
    if (type === "button") {
      element.name = `button${buttonNumber}`;
      buttonNumber++;
    }

    // control if the select and buttons are abled or disabled by default
    // REFACTOR LATER
    if (
      (type === "select" && status === "done") ||
      (type === "button" && status === "done")
    ) {
      element.disabled = true;
    } else if (
      (type === "select" && status === "on going") ||
      (type === "button" &&
        textContent === "Update status to on going" &&
        status === "on going")
    ) {
      element.disabled = true;
    } else if (type === "button" && status.includes("requested")) {
      element.disabled = true;
    }

    form.appendChild(element);
  });

  // create dropdown options and add them to the select element
  const driverSelect = form.querySelector("select");
  if (driverID !== "") {
    const element = createFormElement("option", driverID, driverID);
    driverSelect.add(element);
  } else {
    const options = [
      { type: "option", value: "", textContent: "--- Allocate a driver ---" },
      { type: "option", value: "driver 1", textContent: "driver 1" },
      { type: "option", value: "driver 2", textContent: "driver 2" },
      { type: "option", value: "driver 3", textContent: "driver 3" },
    ];
    options.forEach(({ type, value, textContent }) => {
      const element = createFormElement(type, value, textContent);
      driverSelect.add(element);
    });
  }

  // append the form to a section
  section.appendChild(form);

  // add an event to the dropdown
  driverSelect.onchange = (event) => {
    const isDefaultValue = event.target.value === "--- Allocate a driver ---";
    form.querySelector("button:nth-of-type(1)").disabled = isDefaultValue;
  };

  // add a submit event
  form.onsubmit = async (event) => {
    event.preventDefault();

    console.log(event.submitter.name);
    console.log(event);

    //  Destructure form id into userid and orderid
    const ids = event.target.id;
    const uid = ids.split("_")[0];
    const oid = ids.split("_")[1];

    // if the submit event is triggered by button 1 (change to on going)
    if (event.submitter.name === "button1") {
      // FIX LATER
      // Geocode the user's address. If we store latitude and longitude on Firestore, we can get rid of this part.
      tt.services
        .geocode({
          key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
          query: address,
        })
        .then((response) => {
          const userLat = response.results[0].position.lat;
          const userLon = response.results[0].position.lng;

          // get driver's departure location (= storage location)
          (async () => {
            const docSnap = await getDoc(doc(db, "users", uid));
            const driverLat = docSnap.data().storageLocation.latitude;
            const driverLon = docSnap.data().storageLocation.longitude;

            // calculate ETA
            tt.services
              .calculateRoute({
                key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
                locations: [
                  [driverLat, driverLon],
                  [userLat, userLon],
                ],
              })
              .then((response) => {
                console.log(response);

                const rawETA = new Date(response.routes[0].summary.arrivalTime);
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

                (async () => {
                  // --UPDATE DB--
                  // Update driverid and status
                  await update(uid, oid, formattedETA, driverSelect);
                  // Get the updated order info.
                  const get = await getOrder(uid, oid);
                  const order = get.data();
                  console.log(order);

                  form.querySelector(
                    "p:nth-of-type(5)"
                  ).textContent = `Current status: ${order.status}`;
                  form.querySelector("select").value = order.driverId;
                  form.querySelector("select").disabled = true;
                  form.querySelector("button:nth-of-type(1)").disabled = true;
                  form.querySelector("button:nth-of-type(2)").disabled = false;
                  return;
                })();
              });
          })();
        });
    }

    // if the submit event is triggered by button 2 (change to done)
    if (event.submitter.name === "button2") {
      await update(uid, oid);
      const get = await getOrder(uid, oid);
      const order = get.data();
      console.log(order);
      form.querySelector(
        "p:nth-of-type(5)"
      ).textContent = `Current status: ${order.status}`;
      form.querySelector("button:nth-of-type(2)").disabled = true;

      // remove the "done" status order
      if (order.status === "done") {
        // helper function which returns a promise
        const delay = (ms) => {
          return new Promise((resolve) => {
            setTimeout(resolve, ms);
          });
        };

        (async () => {
          console.log(event.target);
          await delay(0);
          event.target.classList.add("done");
          await delay(1000);
          event.target.style.display = "none";
        })();
      }
    }
  };
};

objArr.forEach((orderObj) => {
  const orderID = Object.keys(orderObj)[0];
  const status = orderObj[orderID].status;

  // don't show 'done' status order
  if (status !== "done") {
    const orderDate = orderObj[orderID].orderDate;
    const userID = orderObj[orderID].userId;
    const fullName = `${orderObj[orderID].userName.firstName} ${orderObj[orderID].userName.lastName}`;
    const address = `${orderObj[orderID].address.detail}, ${orderObj[orderID].address.city}, ${orderObj[orderID].address.province} ${orderObj[orderID].address.zipCode}`;
    const itemKey = orderObj[orderID].itemKey;
    const driverID = orderObj[orderID].driverId;

    const orderType = orderObj[orderID].orderType;
    const section = document.querySelector(
      orderType === "add" ? ".adding" : ".retrieval"
    );

    showOrderForm(
      section,
      userID,
      fullName,
      orderDate,
      status,
      address,
      itemKey,
      orderID,
      driverID,
      orderType
    );
  }
});
