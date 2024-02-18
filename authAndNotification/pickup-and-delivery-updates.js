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

          // If the data has ETA in the first place, show it at the same time.
          if (orderObj[orderID].ETA) {
            const h4 = createOrderDivElement("h4", "DRIVER DEPARTED");
            const p = createOrderDivElement(
              "p",
              "---Time stamp would be here---"
              // FIX LATER: add time stamp (use firestore function?)
            );
            document.querySelector(`#${orderID}`).appendChild(h4);
            document.querySelector(`#${orderID}`).appendChild(p);

            const h4ETA = createOrderDivElement("h4", "ETA");
            const pETA = createOrderDivElement("p", orderObj[orderID].ETA);
            document.querySelector(`#${orderID}`).appendChild(h4ETA);
            document.querySelector(`#${orderID}`).appendChild(pETA);
          }
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

            const formattedETA = changedDoc.doc.data().ETA;

            const h4ETA = createOrderDivElement("h4", "ETA");
            const pETA = createOrderDivElement("p", formattedETA);
            document.querySelector(`#${changedDoc.doc.id}`).appendChild(h4ETA);
            document.querySelector(`#${changedDoc.doc.id}`).appendChild(pETA);

            // notification
            new Notification("StashAway", {
              body: `The driver is on the way! Order ID: ${changedDoc.doc.id}, ETA: ${formattedETA}`,
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
