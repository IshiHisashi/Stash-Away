import { initHeader } from './header/header.js';
import { initFooter } from './footer/footer.js';
import { initBody } from './body/body.js';

async function loadComponent(componentPath, placeholderId) {
    try {
        const response = await fetch(componentPath);
        const componentHTML = await response.text();
        document.getElementById(placeholderId).innerHTML = componentHTML;
    } catch (error) {
        console.error('An error occurred while loading the component:', error);
    }
}

async function init() {
    try {
        await loadComponent('./header/header.html', 'header-placeholder');
        initHeader();

        await loadComponent('./body/body.html', 'body-placeholder');
        initBody();

        await loadComponent('./footer/footer.html', 'footer-placeholder');
        initFooter();
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}
