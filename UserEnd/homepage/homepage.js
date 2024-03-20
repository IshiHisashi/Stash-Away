function toggleMenu() {
  const nav = document.querySelector(".main-menu");
  nav.classList.toggle("active");
}
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("bookNowMenu").addEventListener("click", function () {
    window.location.href = "../authAndNotification/login.html";
  });

  document
    .getElementById("bookNowHero")
    .addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = "../authAndNotification/login.html";
    });

  document
    .querySelector(".account-link")
    .addEventListener("click", function (event) {
      if (window.innerWidth > 900) {
        event.preventDefault();
        var subMenu = this.nextElementSibling;
        subMenu.style.display =
          subMenu.style.display === "block" ? "none" : "block";
      }
    });
});

// load header and footer
import { initHeader } from "./../homepage/header/header.js";
import { initFooter } from "./../homepage/footer/footer.js";

async function loadComponent(componentPath, placeholderId) {
  try {
    const response = await fetch(componentPath);
    const componentHTML = await response.text();
    document.getElementById(placeholderId).innerHTML = componentHTML;
  } catch (error) {
    console.error("An error occurred while loading the component:", error);
  }
}

async function init() {
  try {
    await loadComponent("../homepage/header/header.html", "header-placeholder");
    initHeader();
    await loadComponent("../homepage/body/body.html", "body-placeholder");
    await loadComponent("../homepage/footer/footer.html", "footer-placeholder");
    initFooter();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
