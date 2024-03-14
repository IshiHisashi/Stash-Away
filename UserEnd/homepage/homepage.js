function toggleMenu() {
    const nav = document.querySelector('.main-menu');
    nav.classList.toggle('active');
}
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('bookNowMenu').addEventListener('click', function () {
        window.location.href = '../authAndNotification/login.html';
    });

    document.getElementById('bookNowHero').addEventListener('click', function (event) {
        event.preventDefault();
        window.location.href = '../authAndNotification/login.html';
    });

    document.querySelector('.account-link').addEventListener('click', function (event) {
        if (window.innerWidth > 900) {
            event.preventDefault();
            var subMenu = this.nextElementSibling;
            subMenu.style.display = subMenu.style.display === 'block' ? 'none' : 'block';
        }
    });
});