// initialize the map at münster
var map = L.map('map').setView([51.9607, 7.6261], 13);

// add the tile layer
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: '© Esri'
});

document.getElementById('baseMapSelect').addEventListener('change', function(e) {
    if (e.target.value === 'osm') {
        map.removeLayer(satelliteLayer);
        map.addLayer(osmLayer);
    } else if (e.target.value === 'satellite') {
        map.removeLayer(osmLayer);
        map.addLayer(satelliteLayer);
    }
});

// initialize the featuregroup to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// initialize the draw control
var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polygon: true,
        polyline: true,
        rectangle: true,
        circle: false,
        marker: true
    }
});
map.addControl(drawControl);

// handle drawing creation
map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);
});

// clear the map on command
function clearMap() {
    drawnItems.clearLayers();
    updateFeatureCount(0);
    console.log("map cleared");
    //alert("map cleared");
}

// get updated feature count
function updateFeatureCount(count) {
    document.getElementById('count').textContent = count;
}

// function to save features to database
function saveToDatabase() {
    var data = drawnItems.toGeoJSON();
    console.log("saving data:", JSON.stringify(data, null, 2));  // debuggingggg
    const savePromises = data.features.map(feature => {
        return fetch('/api/save-feature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feature)
        })
        .then(response => response.json())
        .then(data => console.log('feature saved:', data))
        .catch(error => console.error('error:', error));
    });
    Promise.all(savePromises)
        .then(results => {
            alert(`successfully saved ${results.length} features`);
            loadFromDatabase(); // reload from database to get updated count

        })
        .catch(error => alert('Error saving features'));
}

function loadFromDatabase() {
    drawnItems.clearLayers();
    fetch('/api/get-features')
        .then(response => response.json())
        .then(features => {
            console.log("fetched from DB:", features);
            features.forEach(feature => {
                var geoJSONLayer = L.geoJSON(feature);
                geoJSONLayer.eachLayer(layer => {
                    drawnItems.addLayer(layer);
                });
            });
            // update the feature count
            updateFeatureCount(features.length);
        })
        .catch(error => console.error('Error loading features:', error));
}


// export as geojson
function exportGeoJSON() {
    var data = drawnItems.toGeoJSON();
    console.log(JSON.stringify(data, null, 2));
    alert("Check console for GeoJSON output");
}

// initialize
loadFromDatabase();