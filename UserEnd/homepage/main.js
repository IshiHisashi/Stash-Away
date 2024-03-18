async function loadComponent(componentName, containerId) {
    const response = await fetch(`${componentName}/${componentName}.html`);
    const content = await response.text();
    document.getElementById(containerId).innerHTML = content;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('header', 'header-container');
    await loadComponent('body', 'body-container');
    await loadComponent('footer', 'footer-container');
});
