import * as common from "../../../common.js";

let user = null;
const basePath = "../";

async function initHeader() {
  try {
    user = await common.getCurrentUserObj();
    updateUIBasedOnUser(user);
  } catch (error) {
    console.error("An error occurred:", error);
  }

  const btntoggleMenu = document.getElementById("btntoggleMenu");
  if (btntoggleMenu) {
    btntoggleMenu.addEventListener("click", async (e) => {
      e.preventDefault();
      const nav = document.querySelector(".main-menu");
      nav.classList.toggle("active");

      if (nav.classList.contains("active")) {
        document.querySelector("main").onclick = (e) => {
          e.preventDefault();
          nav.classList.remove("active");
        };
      }
    });
  }

  const btnGeoLocation = document.getElementById("btnGeoLocation");
  if (btnGeoLocation) {
    btnGeoLocation.addEventListener("click", async (e) => {
      e.preventDefault();
      if (isAuthenticated()) {
        window.location.href = `${basePath}home-page-map/index.html`;
      } else {
        window.location.href = `${basePath}authentication/login.html?returnUrl=${encodeURIComponent(
          `${basePath}home-page-map/index.html`
        )}`;
      }
    });
  }

  const btnPricing = document.getElementById("btnPricing");
  if (btnPricing) {
    btnPricing.addEventListener("click", function () {
      alert("Pricing Page - Not yet developed!");
    });
  }

  const btnHelpCenter = document.getElementById("btnHelpCenter");
  if (btnHelpCenter) {
    btnHelpCenter.addEventListener("click", function () {
      alert("Help Center Page - Not yet developed!");
    });
  }

  // const buttonMyAccount = document.querySelector('btnMyAccount');
  // if (buttonMyAccount) {
  //     buttonMyAccount.addEventListener("click", async (e) => {
  //         debugger
  //         e.preventDefault();
  //         if (window.innerWidth > 600) {
  //             var subMenu = e.target.nextElementSibling;
  //             subMenu.style.display = subMenu.style.display === 'block' ? 'none' : 'block';
  //         }
  //     });
  // }

  const btnOrderUpdate = document.getElementById("btnOrderUpdate");
  if (btnOrderUpdate) {
    btnOrderUpdate.addEventListener("click", function () {
      window.location.href = `${basePath}order-confirmation/order-confirmation.html`;
    });
  }

  const btnViewStorage = document.getElementById("btnViewStorage");
  if (btnViewStorage) {
    btnViewStorage.addEventListener("click", function () {
      window.location.href = `${basePath}storage-mgmt/storageMgmt.html`;
    });
  }

  const btnProfile = document.getElementById("btnProfile");
  if (btnProfile) {
    btnProfile.addEventListener("click", function () {
      window.location.href = `${basePath}profile/index.html`;
    });
  }

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      common
        .signOut(common.auth)
        .then(() => {
          //   debugger;
          console.log("signed out");
          window.location.href = `${basePath}homepage/main.html`;
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  const btnLogin = document.getElementById("btnLogin");
  if (btnLogin) {
    btnLogin.addEventListener("click", function () {
      window.location.href = `${basePath}authentication/login.html`;
    });
  }

  const btnSignUp = document.getElementById("btnSignUp");
  if (btnSignUp) {
    btnSignUp.addEventListener("click", function () {
      window.location.href = `${basePath}authentication/signup.html`;
    });
  }

  const btnBookNow = document.getElementById("btnBookNow");
  if (btnBookNow) {
    btnBookNow.addEventListener("click", async (e) => {
      e.preventDefault();
      if (isAuthenticated()) {
        window.location.href = `${basePath}home-page-map/index.html`;
      } else {
        window.location.href = `${basePath}authentication/login.html?returnUrl=${encodeURIComponent(
          `${basePath}home-page-map/index.html`
        )}`;
      }
    });
  }

  // Since this logic might depend on the header being fully loaded,
  // make sure you call this function after the header HTML has been inserted.
  window.onclick = function (event) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  };
}

function toggleDropdown(event) {
  document.getElementById("myDropdown").classList.toggle("show");
  event.stopPropagation();
}

const isAuthenticated = () => {
  return !!user;
};

// const bookNowHero = document.getElementById('bookNowHero');
// if (bookNowHero) {
//     bookNowHero.addEventListener('click', function (event) {
//         event.preventDefault();
//         window.location.href = '../authentication/login.html';
//     });
// }

function updateUIBasedOnUser(user) {
  const buttonMyAccount = document.getElementById("btnMyAccount");
  const buttonOrderUpdate = document.getElementById("btnOrderUpdate");
  const buttonViewStorage = document.getElementById("btnViewStorage");
  const buttonProfile = document.getElementById("btnProfile");
  const buttonLogout = document.getElementById("btnLogout");
  const buttonLogin = document.getElementById("btnLogin");
  const buttonSignUp = document.getElementById("btnSignUp");
  if (user) {
    console.log(user.uid);
    buttonMyAccount.style.display = "flex";
    buttonMyAccount.style.gap = "0.5rem";

    buttonOrderUpdate.style.display = "block";
    buttonViewStorage.style.display = "block";
    buttonProfile.style.display = "block";
    buttonLogout.style.display = "block";
    buttonLogin.style.display = "none";
    buttonSignUp.style.display = "none";
  } else {
    console.log("No user is logged in.");
    buttonMyAccount.style.display = "none";
    buttonMyAccount.style.display = "none";
    buttonOrderUpdate.style.display = "none";
    buttonViewStorage.style.display = "none";
    buttonProfile.style.display = "none";
    buttonLogout.style.display = "none";
    if (window.location.href.includes("login")) {
      buttonSignUp.style.display = "block";
    } else {
      buttonLogin.style.display = "block";
    }
  }
}

export { initHeader };
