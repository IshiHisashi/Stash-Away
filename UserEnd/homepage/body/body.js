import * as common from "../../../common.js";

let user = null;
const basePath = "../";

async function initBody() {
    try {
        user = await common.getCurrentUserObj();
    } catch (error) {
        console.error("An error occurred:", error);
    }

    const wrapper = document.querySelector(".wrapper");
    const carousel = document.querySelector(".carousel");
    const firstCardWidth = carousel.querySelector(".card").offsetWidth;
    const arrowBtns = document.querySelectorAll(".wrapper i");
    const carouselChildrens = [...carousel.children];

    const btnBookNow1 = document.getElementById("btnBookNow1");
    const btnBookNow2 = document.getElementById("btnBookNow2");
    const btnBookNow3 = document.getElementById("btnBookNow3");

    const uniqueWrapper = document.querySelector(".unique-wrapper");
    const uniqueCarousel = document.querySelector(".unique-carousel");
    const uniqueFirstCardWidth = uniqueCarousel.querySelector(".unique-card").offsetWidth;
    const uniqueArrowBtns = document.querySelectorAll(".unique-wrapper i");
    const uniqueCarouselChildrens = [...uniqueCarousel.children];

    if (btnBookNow1) {
        btnBookNow1.addEventListener("click", async (e) => {
            e.preventDefault();
            if (isAuthenticated()) {
                window.location.href = `${basePath}home-page-map/index.html`;
            } else {
                window.location.href = `${basePath}authentication/login.html?returnUrl=${encodeURIComponent(`${basePath}home-page-map/index.html`)}`;
            }
        });
    }

    if (btnBookNow2) {
        btnBookNow2.addEventListener("click", async (e) => {
            e.preventDefault();
            if (isAuthenticated()) {
                window.location.href = `${basePath}home-page-map/index.html`;
            } else {
                window.location.href = `${basePath}authentication/login.html?returnUrl=${encodeURIComponent(`${basePath}home-page-map/index.html`)}`;
            }
        });
    }

    if (btnBookNow3) {
        btnBookNow3.addEventListener("click", async (e) => {
            e.preventDefault();
            if (isAuthenticated()) {
                window.location.href = `${basePath}home-page-map/index.html`;
            } else {
                window.location.href = `${basePath}authentication/login.html?returnUrl=${encodeURIComponent(`${basePath}home-page-map/index.html`)}`;
            }
        });
    }

    let isDragging = false, isAutoPlay = true, startX, startScrollLeft, timeoutId;

    // Get the number of cards that can fit in the carousel at once
    let cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);



    // Insert copies of the last few cards to beginning of carousel for infinite scrolling
    carouselChildrens.slice(-cardPerView).reverse().forEach(card => {
        carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
    });

    // Insert copies of the first few cards to end of carousel for infinite scrolling
    carouselChildrens.slice(0, cardPerView).forEach(card => {
        carousel.insertAdjacentHTML("beforeend", card.outerHTML);
    });

    // Scroll the carousel at appropriate postition to hide first few duplicate cards on Firefox
    carousel.classList.add("no-transition");
    carousel.scrollLeft = carousel.offsetWidth;
    carousel.classList.remove("no-transition");

    // Add event listeners for the arrow buttons to scroll the carousel left and right
    arrowBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            carousel.scrollLeft += btn.id == "left" ? -firstCardWidth : firstCardWidth;
        });
    });

    const dragStart = (e) => {
        isDragging = true;
        carousel.classList.add("dragging");
        // Records the initial cursor and scroll position of the carousel
        startX = e.pageX;
        startScrollLeft = carousel.scrollLeft;
    }

    const dragging = (e) => {
        if (!isDragging) return; // if isDragging is false return from here
        // Updates the scroll position of the carousel based on the cursor movement
        carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
    }

    const dragStop = () => {
        isDragging = false;
        carousel.classList.remove("dragging");
    }

    const infiniteScroll = () => {
        // If the carousel is at the beginning, scroll to the end
        if (carousel.scrollLeft === 0) {
            carousel.classList.add("no-transition");
            carousel.scrollLeft = carousel.scrollWidth - (2 * carousel.offsetWidth);
            carousel.classList.remove("no-transition");
        }
        // If the carousel is at the end, scroll to the beginning
        else if (Math.ceil(carousel.scrollLeft) === carousel.scrollWidth - carousel.offsetWidth) {
            carousel.classList.add("no-transition");
            carousel.scrollLeft = carousel.offsetWidth;
            carousel.classList.remove("no-transition");
        }

        // Clear existing timeout & start autoplay if mouse is not hovering over carousel
        clearTimeout(timeoutId);
        if (!wrapper.matches(":hover")) autoPlay();
    }

    const autoPlay = () => {
        if (window.innerWidth < 800 || !isAutoPlay) return; // Return if window is smaller than 800 or isAutoPlay is false
        // Autoplay the carousel after every 2500 ms
        timeoutId = setTimeout(() => carousel.scrollLeft += firstCardWidth, 2500);
    }
    autoPlay();

    carousel.addEventListener("mousedown", dragStart);
    carousel.addEventListener("mousemove", dragging);
    document.addEventListener("mouseup", dragStop);
    carousel.addEventListener("scroll", infiniteScroll);
    wrapper.addEventListener("mouseenter", () => clearTimeout(timeoutId));
    wrapper.addEventListener("mouseleave", autoPlay);

    let uniqueIsDragging = false, uniqueIsAutoPlay = true, uniqueStartX, uniqueStartScrollLeft, uniqueTimeoutId;

    let uniqueCardPerView = Math.round(uniqueCarousel.offsetWidth / uniqueFirstCardWidth);

    // Adjust for infinite scrolling effect
    uniqueCarouselChildrens.slice(-uniqueCardPerView).reverse().forEach(card => {
        uniqueCarousel.insertAdjacentHTML("afterbegin", card.outerHTML);
    });

    uniqueCarouselChildrens.slice(0, uniqueCardPerView).forEach(card => {
        uniqueCarousel.insertAdjacentHTML("beforeend", card.outerHTML);
    });

    // Initial carousel setup to hide duplicates
    uniqueCarousel.classList.add("no-transition");
    uniqueCarousel.scrollLeft = uniqueCarousel.offsetWidth;
    uniqueCarousel.classList.remove("no-transition");

    // Arrow button event listeners
    uniqueArrowBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            uniqueCarousel.scrollLeft += btn.id == "unique-left" ? -uniqueFirstCardWidth : uniqueFirstCardWidth;
        });
    });

    // Drag start function
    const uniqueDragStart = (e) => {
        uniqueIsDragging = true;
        uniqueCarousel.classList.add("dragging");
        uniqueStartX = e.pageX;
        uniqueStartScrollLeft = uniqueCarousel.scrollLeft;
    }

    // Dragging function
    const uniqueDragging = (e) => {
        if (!uniqueIsDragging) return;
        uniqueCarousel.scrollLeft = uniqueStartScrollLeft - (e.pageX - uniqueStartX);
    }

    // Drag stop function
    const uniqueDragStop = () => {
        uniqueIsDragging = false;
        uniqueCarousel.classList.remove("dragging");
    }

    // Infinite scroll functionality
    const uniqueInfiniteScroll = () => {
        if (uniqueCarousel.scrollLeft === 0) {
            uniqueCarousel.classList.add("no-transition");
            uniqueCarousel.scrollLeft = uniqueCarousel.scrollWidth - (2 * uniqueCarousel.offsetWidth);
            uniqueCarousel.classList.remove("no-transition");
        } else if (Math.ceil(uniqueCarousel.scrollLeft) === uniqueCarousel.scrollWidth - uniqueCarousel.offsetWidth) {
            uniqueCarousel.classList.add("no-transition");
            uniqueCarousel.scrollLeft = uniqueCarousel.offsetWidth;
            uniqueCarousel.classList.remove("no-transition");
        }

        clearTimeout(uniqueTimeoutId);
        if (!uniqueWrapper.matches(":hover")) uniqueAutoPlay();
    }

    // Autoplay functionality
    const uniqueAutoPlay = () => {
        if (window.innerWidth < 600 || !uniqueIsAutoPlay) return;
        uniqueTimeoutId = setTimeout(() => uniqueCarousel.scrollLeft += uniqueFirstCardWidth, 2500);
    }
    uniqueAutoPlay();

    // Event listeners
    uniqueCarousel.addEventListener("mousedown", uniqueDragStart);
    uniqueCarousel.addEventListener("mousemove", uniqueDragging);
    document.addEventListener("mouseup", uniqueDragStop);
    uniqueCarousel.addEventListener("scroll", uniqueInfiniteScroll);
    uniqueWrapper.addEventListener("mouseenter", () => clearTimeout(uniqueTimeoutId));
    uniqueWrapper.addEventListener("mouseleave", uniqueAutoPlay);
}

const isAuthenticated = () => {
    return !!user;
};


export { initBody };
