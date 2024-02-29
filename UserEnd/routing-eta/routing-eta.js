
const strageLoc = [[-123.125820, 49.351542], [-123.108487, 49.173966], [-122.841305, 49.159780], [-122.323466, 49.065087], [-122.776836, 49.283485], [-121.954941, 49.150314], [-123.422233, 48.523145], [-119.455072, 49.869284]]

// North Van, Richmond, Surrey, Abbotsford, Coquitlam, Chilliwack, Victoria

// References
// Marker page: https://developer.tomtom.com/maps-sdk-web-js/tutorials/use-cases/how-add-and-customize-location-marker
// Search bar and map display: https://developer.tomtom.com/maps-sdk-web-js/tutorials/basic/searchbox-integration
// Calculate distance and eat: https://github.com/joserojas-tomtom/optimize-routes/commit/51a18b433141b4a08c695868b5d8f05a7da362e3
// Calculate distance and eat: https://developer.tomtom.com/blog/build-different/understanding-how-tomtom-routing-api-provides-accurate-etas/



if ( navigator.geolocation ) {
  navigator.geolocation.getCurrentPosition(
      (position) => {
          let currentLgt = position.coords.longitude;
          let currentLat = position.coords.latitude;
          const currentLoc = [];
          currentLoc.push(currentLgt);
          currentLoc.push(currentLat);
          // console.log("Longitude: " + position.coords.longitude);
          // console.log("Latitude: " + position.coords.latitude);
          // console.log("Time: " + new Date(position.timestamp));
          // console.log(currentLoc);

          const map = tt.map({
            key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
            container: "map",
            center: currentLoc,
            zoom: 9
          })

          var popupOffsets = {
            top: [0, 0],
            bottom: [0, -70],
            "bottom-right": [0, -70],
            "bottom-left": [0, -70],
            left: [25, -35],
            right: [-25, -35],
          }

          var nvEl = document.createElement("div");
          nvEl.className = "loc-marker"
          var northVan = new tt.Marker({ element: nvEl }).setLngLat([strageLoc[0][0], strageLoc[0][1]]).addTo(map);
          var nvPop = new tt.Popup({ offset: popupOffsets }).setHTML(
            "<b>North Vancouver</b><br>420 Southborough Dr, West Vancouver, BC V7S 1M2"
          )
          northVan.setPopup(nvPop).togglePopup()

          var rchEl = document.createElement("div");
          rchEl.className = "loc-marker"
          var richmond = new tt.Marker({ element: rchEl }).setLngLat([strageLoc[1][0], strageLoc[1][1]]).addTo(map);
          var richPop = new tt.Popup({ offset: popupOffsets }).setHTML(
            "<b>Richmond</b><br>420 Southborough Dr, West Vancouver, BC V7S 1M2"
          )
          richmond.setPopup(richPop).togglePopup()

          var surrey = new tt.Marker().setLngLat([strageLoc[2][0], strageLoc[2][1]]).addTo(map);
          var abbotsford = new tt.Marker().setLngLat([strageLoc[3][0], strageLoc[3][1]]).addTo(map);
          var coquitlam = new tt.Marker().setLngLat([strageLoc[4][0], strageLoc[4][1]]).addTo(map);
          var chilliwack = new tt.Marker().setLngLat([strageLoc[5][0], strageLoc[5][1]]).addTo(map);
          var victoria = new tt.Marker().setLngLat([strageLoc[6][0], strageLoc[6][1]]).addTo(map);
          var kelowna = new tt.Marker().setLngLat([strageLoc[7][0], strageLoc[7][1]]).addTo(map);
        
          map.on('load', () => {
            var curLocEl = document.createElement("div");
            curLocEl.id = "current-location-marker";
            var currentLocation = new tt.Marker({ element:curLocEl }).setLngLat(currentLoc).addTo(map);
          })

          showSearchBar(map);
          let waypoints = [currentLoc, strageLoc[0]];

          function route(map) {
            tt.services.calculateRoute({
              key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY", // Get on for free at developer.tomtom.com
              routeType: 'shortest',
              locations: waypoints
            })
              .then((result) => {
                console.log(result)
                const etaToShow = document.getElementById('eta-shows-here')
                etaToShow.innerHTML = `<p>Distance route: ${result.routes[0].summary.lengthInMeters} mts</p><br><p>Rough eta: ${result.routes[0].summary.arrivalTime}</p><br><p>How long it's gonna take: ${result.routes[0].summary.travelTimeInSeconds} seconds</p>`
                const geojson = result.toGeoJson()
                if (map.getLayer('route')) {
                  map.removeLayer('route')
                  map.removeSource('route')
                }
          
                map.addLayer({
                  'id': 'route',
                  'type': 'line',
                  'source': {
                    'type': 'geojson',
                    'data': geojson
                  },
                  'paint': {
                    'line-color': 'orange',
                    'line-width': 6
                  }
                });
              })
          }
          
          route(map);

          
      },
      (error) => {
          console.log(error);
          if (error.code == error.PERMISSION_DENIED) {
              window.alert("geolocation permission denied")
          }
      }
  );
} else {
  console.log("Geolocation is not supported by this browser.")
}

function showSearchBar(map) {
  var options = {
    searchOptions: {
      key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
      language: "en-GB",
      limit: 5,
    },
    autocompleteOptions: {
      key: "bHlx31Cqd8FUqVEk3CDmB9WfmR95FBvY",
      language: "en-GB",
    },
  }
  
  var ttSearchBox = new tt.plugins.SearchBox(tt.services, options)
  var searchMarkersManager = new SearchMarkersManager(map)
  ttSearchBox.on("tomtom.searchbox.resultsfound", handleResultsFound)
  ttSearchBox.on("tomtom.searchbox.resultselected", handleResultSelection)
  ttSearchBox.on("tomtom.searchbox.resultfocused", handleResultSelection)
  ttSearchBox.on("tomtom.searchbox.resultscleared", handleResultClearing)
  map.addControl(ttSearchBox, "top-left")
  
  function handleResultsFound(event) {
    var results = event.data.results.fuzzySearch.results
  
    if (results.length === 0) {
      searchMarkersManager.clear()
    }
    searchMarkersManager.draw(results)
    fitToViewport(results)
  }
    
  function handleResultSelection(event) {
    var result = event.data.result
    if (result.type === "category" || result.type === "brand") {
      return
    }
    searchMarkersManager.draw([result])
    fitToViewport(result)
  }
  
  function fitToViewport(markerData) {
    if (!markerData || (markerData instanceof Array && !markerData.length)) {
      return
    }
    var bounds = new tt.LngLatBounds()
    if (markerData instanceof Array) {
      markerData.forEach(function (marker) {
        bounds.extend(getBounds(marker))
      })
    } else {
      bounds.extend(getBounds(markerData))
    }
    map.fitBounds(bounds, { padding: 100, linear: true })
  }
    
  function getBounds(data) {
    var btmRight
    var topLeft
    if (data.viewport) {
      btmRight = [
        data.viewport.btmRightPoint.lng,
        data.viewport.btmRightPoint.lat,
      ]
      topLeft = [data.viewport.topLeftPoint.lng, data.viewport.topLeftPoint.lat]
    }
    return [btmRight, topLeft]
  }
    
  function handleResultClearing() {
    searchMarkersManager.clear()
  }
  
  function SearchMarkersManager(map, options) {
    this.map = map
    this._options = options || {}
    this._poiList = undefined
    this.markers = {}
  }
  
  SearchMarkersManager.prototype.draw = function (poiList) {
    this._poiList = poiList
    this.clear()
    this._poiList.forEach(function (poi) {
      var markerId = poi.id
      var poiOpts = {
        name: poi.poi ? poi.poi.name : undefined,
        address: poi.address ? poi.address.freeformAddress : "",
        distance: poi.dist,
        classification: poi.poi ? poi.poi.classifications[0].code : undefined,
        position: poi.position,
        entryPoints: poi.entryPoints,
      }
      var marker = new SearchMarker(poiOpts, this._options)
      marker.addTo(this.map)
      this.markers[markerId] = marker
    }, this)
  }
  
  SearchMarkersManager.prototype.clear = function () {
    for (var markerId in this.markers) {
      var marker = this.markers[markerId]
      marker.remove()
    }
    this.markers = {}
    this._lastClickedMarker = null
  }
  
  function SearchMarker(poiData, options) {
    this.poiData = poiData
    this.options = options || {}
    this.marker = new tt.Marker({
      element: this.createMarker(),
      anchor: "bottom",
    })
    var lon = this.poiData.position.lng || this.poiData.position.lon
    this.marker.setLngLat([lon, this.poiData.position.lat])
  }
  
  SearchMarker.prototype.addTo = function (map) {
    this.marker.addTo(map)
    this._map = map
    return this
  }
  
  SearchMarker.prototype.createMarker = function () {
    var elem = document.createElement("div")
    elem.className = "tt-icon-marker-black tt-search-marker"
    if (this.options.markerClassName) {
      elem.className += " " + this.options.markerClassName
    }
    var innerElem = document.createElement("div")
    innerElem.setAttribute(
      "style",
      "background: white; width: 10px; height: 10px; border-radius: 50%; border: 3px solid black;"
    )
  
    elem.appendChild(innerElem)
    return elem
  }
  
  SearchMarker.prototype.remove = function () {
    this.marker.remove()
    this._map = null
  }
  
  ttSearchBox.on("tomtom.searchbox.resultsfound", function (data) {
    console.log(data)
  })
  
  ttSearchBox.updateOptions({
    minNumberOfCharacters: 5,
    showSearchButton: false,
    labels: {
      placeholder: "Query e.g. TomTom",
    },
  })
  
  ttSearchBox.query()
  
  
}



