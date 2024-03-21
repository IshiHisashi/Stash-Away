// Registration
if (navigator.serviceWorker) {
  // if navigator.serviceWorker’ exists, browser supports service worker.
  // register the SW file (here assuming it’s called sw.js in same dir.)
  navigator.serviceWorker
    .register("../../sw.js")
    .then((registered) => {
      console.log(`SW Registered (Scope: ${registered.scope})`); // logs a success message
    })
    .catch((error) => {
      // in case registration fails we get an error (e.g. sw.js has errors)
      console.error(`SW registration Error`, error); // logs an error message & error object
    });
} else {
  // if browser doesn't support SW or the connection is not an HTTPS nor localhost
  console.warn("Service Worker not supported");
}

// Define var
const cacheName = "v1"; // you need a name for your cache. It also helps with invalidation later.
const urlsToCache = [
  "/",
  "offline.html",
  "offline.css",
  "offline.js",
  "offline.png",
]; // list of URLs to cache

// Installation
self.addEventListener("install", (event) => {
  // self is a global variable refers to worker itself
  event.waitUntil(
    // waitUntil here tells browser to wait for the passed promise to settle
    caches
      .open(cacheName) // caches is a global object representing browser CacheStorage
      .then((cache) => {
        console.log("success");
        // once the cache named cacheName* is open you get it in promise then
        return cache.addAll(urlsToCache); // pass the array of urlsToCache to cache**
      })
  );
});

// Activation
self.addEventListener("activate", (event) => {
  console.log(`SW: Event fired: ${event.type}`);
  event.waitUntil(
    // waitUntil tells the browser to wait for passed promise to finish
    caches.keys().then((keyList) => {
      // get a list of cache names for this origin
      return Promise.all(
        keyList.map((key) => {
          if (key !== cacheName) {
            // compare key with our new cache Name in SW
            return caches.delete(key); // delete any cache that doesn’t match new name
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  console.log(event, event.request);
  //   console.log(`SW: Fetch handler`, event.request.url);
  //   event.respondWith(
  //     // we need a Response object or a promise that resolve to Response
  //     caches.match(event.request).then((response) => {
  //       //check the caches
  //       // if response is found in cache, return that, otherwise the fetch’s promise
  //       return response ? response : fetch(event.request); //
  //     })
  //   );
  console.log(`Fetching ${event.request.url}`);
  event.respondWith(NetworkOrOfflinePage(event));
});

async function NetworkOrOfflinePage(event) {
  try {
    return await fetch(event.request); // returns server fetch
  } catch (error) {
    // in case of error return a static page
    console.log(error);
    return caches.match(urlsToCache[0]); // returns default offline page
  }
}
