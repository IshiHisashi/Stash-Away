"use strict";
import * as common from "../../common.js";

const btnAdd = document.getElementById("btn-add");
const btnRetrieval = document.getElementById("btn-retrieval");

// add action
btnAdd.addEventListener("click", async (e) => {
  e.preventDefault();
  await common.addOrderSubmitFunction(common.snapShot);
  window.location.href = "../updates/pickup-and-delivery-updates.html";
});

// retrieve action
btnRetrieval.addEventListener("click", async (e) => {
  e.preventDefault();
  // Old
  // await common.retrievalOrderSubmitFunction();
  // New
  getcheckedItem.forEach(async (el) => {
    const getItem = await getDoc(
      doc(db, "users", `${userId}`, "inStorage", `${el}`)
    );
    const item = getItem.data();
    const itemID = getItem.id;
    // update item
    await updateDoc(doc(db, "users", `${userId}`, "inStorage", `${itemID}`), {
      status: "retrieval requested",
    });
  });
  // Generate order
  await addDoc(collection(db, "users", `${userId}`, "order"), {
    userId: `${userId}`,
    userName: {
      firstName: `${userDoc.userName.firstName}`,
      lastName: `${userDoc.userName.lastName}`,
    },
    driverId: "",
    itemKey: getcheckedItem,
    orderTimestamp: nowFullDate,
    orderType: "retrieval",
    status: "requested",
    address: {
      detail: `${userDoc.address.detail}`,
      city: `${userDoc.address.city}`,
      province: `${userDoc.address.province}`,
      zipCode: `${userDoc.address.zipCode}`,
    },
    storageLocation: {
      latitude: `${userDoc.storageLocation.latitude}`,
      longitude: `${userDoc.storageLocation.longitude}`,
      name: `${userDoc.storageLocation.name}`,
    },
    requestedDateTime: {
      date: `Mon Mar 18 2024 00:00:00 GMT-0700 (Pacific Daylight Time)`,
      time: `17:00 hrs`,
    },
  });
  await updateDoc(doc(db, "users", `${userId}`), {
    // Then, delete 'ongoingRetrievalItems' from userDoc
    ongoingRetrievalItems: deleteField(),
    // Deduct number of free trip
    "plan.remainingFreeTrip": Number(
      `${
        userDoc.plan.remainingFreeTrip > 0
          ? userDoc.plan.remainingFreeTrip - 1
          : 0
      }`
    ),
  });

  // Move to the next page
  window.location.href = "../updates/pickup-and-delivery-updates.html";
});

export const retrievalOrderSubmitFunction = async function () {};
