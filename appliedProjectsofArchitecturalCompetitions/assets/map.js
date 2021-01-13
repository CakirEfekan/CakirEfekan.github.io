let zoom = 4,
    centeredLatlong = [38.963745, 35.243322];
var options = {
    attribution: '&copy; <a target="_blank" href="https://www.mapbox.com/feedback/">Mapbox</a> <a target="_blank" href="http://openstreetmap.org/copyright">&copy; OpenStreetmap</a> | <a target="_blank" href="https://odoarchitecture.com/">ODO Architecture</a> | <b>Geliştirici:</b> <a target="_blank" href="https://www.cakirefekan.com/">Efekan</a>',
    subdomains: "abc",
    minZoom: 0,
    maxZoom: 20,
};

(mapboxSatelliteUrl =
    "https://api.mapbox.com/styles/v1/cakirefekan/ckhxfelen0e7119lfxil6ifch/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY2FraXJlZmVrYW4iLCJhIjoiY2tlcHAzZWNtMmppdDJzcGMxOG04a21kMyJ9._Z_qxs1w7c87CsBWii_A8w"),
(mapboxSatellite = L.tileLayer(mapboxSatelliteUrl, options));

/*map = L.map('map', {
    layers: [mapboxSatellite],
    center: centeredLatlong,
    zoomControl: false,
    zoom: zoom,
    worldCopyJump: true
})
L.control.zoom({
    position: 'topright'
}).addTo(map); */