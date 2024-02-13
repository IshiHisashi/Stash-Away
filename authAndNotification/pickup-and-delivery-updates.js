import { onAuthStateChanged, signOut, auth } from "./firebase_auth.js";

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  db,
} from "./firebase_firestore.js";

const createOrderDivElement = (type, textContent = null) => {
  const element = document.createElement(type);
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
};

// FIX LATER: If the order status is "on going", we need to show "DRIVER DEPARTED" and "ETA" as well. To do this, we might wanna store ETA on Firestore...?
const showUpdate = (section, orderID, orderDate, itemKey) => {
  const containerDiv = createOrderDivElement("div");
  containerDiv.setAttribute("id", orderID);

  const elements = [
    { type: "p", textContent: `Order ID: ${orderID}` },
    { type: "p", textContent: `Order Date: ${orderDate}` },
    { type: "h3", textContent: `You have a scheduled pick up at:` },
    { type: "p", textContent: `USER PREFFERD DATE & TIME?` },
    { type: "h3", textContent: `Updates` },
    { type: "h4", textContent: `ORDER ACCEPTED` },
    { type: "p", textContent: `---Time stamp would be here---` },
    // FIX LATER: add time stamp (use firestore function?)
  ];

  elements.forEach(({ type, textContent }) => {
    const element = createOrderDivElement(type, textContent);
    containerDiv.appendChild(element);
  });

  section.appendChild(containerDiv);
  // section.appendChild(document.createElement("hr"));
};

// get currently logged in user.
onAuthStateChanged(auth, (user) => {
  const loginStatusSpan = document.querySelector(".loginStatus");

  if (user) {
    const uid = user.uid;
    console.log(user);
    loginStatusSpan.textContent = `Logged in: (user ID: ${uid})`;

    // query criteria: all the documents under the user's 'order' collection, except it's "done".
    (async () => {
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
      console.log(objArr);

      objArr.forEach((orderObj) => {
        const orderID = Object.keys(orderObj)[0];
        const status = orderObj[orderID].status;

        // don't show 'done' status order
        if (status !== "done") {
          const orderDate = orderObj[orderID].orderDate;
          const address = `${orderObj[orderID].address.detail}, ${orderObj[orderID].address.city}, ${orderObj[orderID].address.province} ${orderObj[orderID].address.zipCode}`;
          const itemKey = orderObj[orderID].itemKey;

          const orderType = orderObj[orderID].orderType;
          const section = document.querySelector(
            orderType === "add" ? ".adding" : ".retrieval"
          );

          showUpdate(section, orderID, orderDate, itemKey);
        }
      });
    })();

    (async () => {
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
            const h4 = createOrderDivElement("h4", "DRIVER DEPARTED");
            const p = createOrderDivElement(
              "p",
              "---Time stamp would be here---"
              // FIX LATER: add time stamp (use firestore function?)
            );
            document.querySelector(`#${changedDoc.doc.id}`).appendChild(h4);
            document.querySelector(`#${changedDoc.doc.id}`).appendChild(p);

            // start calculating ETA - get user's address first.
            const wholeAddress = `${changedDoc.doc.data().address.detail}, ${
              changedDoc.doc.data().address.city
            }, ${changedDoc.doc.data().address.province}`;

            // FIX LATER (maybe)
            // Geocode the user's address. If we store latitude and longitude on Firestore, we can get rid of this part.
            tt.services
              .geocode({
                key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
                query: wholeAddress,
                timeZone: "iana",
              })
              .then((response) => {
                console.log(response);
                const userLat = response.results[0].position.lat;
                const userLon = response.results[0].position.lng;

                // Get current geolocation as a driver's location.
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const driverLat = position.coords.latitude;
                    const driverLon = position.coords.longitude;

                    // calculate ETA
                    // FIX LATER: need to convert the time to vancouver time.
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
                        const h4 = createOrderDivElement("h4", "ETA");
                        const p = createOrderDivElement(
                          "p",
                          response.routes[0].summary.arrivalTime
                        );
                        document
                          .querySelector(`#${changedDoc.doc.id}`)
                          .appendChild(h4);
                        document
                          .querySelector(`#${changedDoc.doc.id}`)
                          .appendChild(p);

                        // notification
                        new Notification("StashAway", {
                          body: `The driver is on the way! Order ID: ${changedDoc.doc.id}, ETA: ${response.routes[0].summary.arrivalTime}`,
                        });
                      })
                      .catch((error) => console.log(error));
                  },
                  (error) => {
                    console.log(error);
                  }
                );
              })
              .catch((error) => {
                console.log(error);
                return;
              });
          }
        });
      });
    })();
  } else {
    console.log("no user logged in");
    loginStatusSpan.textContent = `Logged out`;
  }
});
