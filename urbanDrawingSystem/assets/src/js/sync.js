var center = [41.015137, 28.97953]
var editableLayers = new L.FeatureGroup()
let editableLayerGroup = L.layerGroup(editableLayers)

var editableLayersA = new L.FeatureGroup()
let editableLayerGroupA = L.layerGroup(editableLayersA)

var editableLayersB = new L.FeatureGroup()
let editableLayerGroupB = L.layerGroup(editableLayersB)

var options = {
  attribution:
    '<a href="http://openstreetmap.org/copyright">&copy; OpenStreetmap and Contributors</a>',
  subdomains: 'abc',
  minZoom: 0,
  maxZoom: 20
}

let osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', options),
  osmfr = L.tileLayer(
    'http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    options
  ),
  osmbw = L.tileLayer(
    'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
    options
  ),
  osmA = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', options),
  osmfrA = L.tileLayer(
    'http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    options
  ),
  osmbwA = L.tileLayer(
    'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
    options
  ),
  osmB = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', options),
  osmfrB = L.tileLayer(
    'http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    options
  ),
  osmbwB = L.tileLayer(
    'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
    options
  ),
  streets = L.esri.basemapLayer('Streets'),
  streetsA = L.esri.basemapLayer('Streets'),
  streetsB = L.esri.basemapLayer('Streets'),
  mapboxUrl =
    'https://api.mapbox.com/styles/v1/cakirefekan/ckev6pd6k0a6t19nth974qxss/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY2FraXJlZmVrYW4iLCJhIjoiY2tlcHAzZWNtMmppdDJzcGMxOG04a21kMyJ9._Z_qxs1w7c87CsBWii_A8w',
  mapbox = L.tileLayer(mapboxUrl, options),
  mapboxA = L.tileLayer(mapboxUrl, options),
  mapboxB = L.tileLayer(mapboxUrl, options)

var mapA = L.map('mapA', {
  layers: [streetsA, editableLayersA],
  center: center,
  zoom: 18,
  zoomControl: false
})
var mapB = L.map('mapB', {
  layers: [streetsB],
  center: center,
  zoom: 18,
  zoomControl: false
})

var map = L.map('map', {
  layers: [mapbox, editableLayers],
  center: center,
  zoom: 18
})

map.sync(mapA, { offsetFn: L.Sync.offsetHelper([1, 0], [0, 0]) })
map.sync(mapB, { offsetFn: L.Sync.offsetHelper([1, 1], [0, 1]) })

var doAll = true
var doA = false
var doB = false

var p = location.search
if (p != '') {
  var params = p.substring(1).split('&')
  for (var i = 0; i < params.length; i++) {
    var param = params[i].split('=')
    switch (param[0]) {
      case 'all':
        doAll = parseInt(param[1])
        break
      case 'a':
        doA = parseInt(param[1])
        break
      case 'b':
        doB = parseInt(param[1])
        break
    }
  }
}

// If you want interaction with mapA|B to be synchronized on map,
// add other links as well
// or add ?all=1 to the url.
if (doAll || doA) {
  mapA.sync(map, { offsetFn: L.Sync.offsetHelper([0, 0], [1, 0]) })
  mapA.sync(mapB, { offsetFn: L.Sync.offsetHelper([0, 1], [0, 0]) })
}

if (doAll || doB) {
  mapB.sync(map, { offsetFn: L.Sync.offsetHelper([0, 1], [1, 1]) })
  mapB.sync(mapA, { offsetFn: L.Sync.offsetHelper([0, 0], [0, 1]) })
}
map.on('click', function (e) {
  // alert('Lat, Lon : ' + e.latlng.lat + ', ' + e.latlng.lng)
})
let seffafYol = 'Şeffaf Yol',
  yolBina = 'Yol + Bina',
  siyahBeyaz = 'Siyah Beyaz',
  standart = 'Standart',
  kopruStandart = 'Köprü Standart'

let baseMaps = {
    standart: osm,
    yolBina: streets,
    seffafYol: mapbox,
    kopruStandart: osmfr,
    siyahBeyaz: osmbw
  },
  baseMapsA = {
    standart: osmA,
    yolBina: streetsA,
    seffafYol: mapboxA,
    kopruStandart: osmfrA,
    siyahBeyaz: osmbwA
  },
  baseMapsB = {
    standart: osmB,
    yolBina: streetsB,
    seffafYol: mapboxB,
    kopruStandart: osmfrB,
    siyahBeyaz: osmbwB
  },
  bottomright = { position: 'bottomright' },
  bottomleft = { position: 'bottomleft' },
  topleft = { position: 'topleft' },
  topright = { position: 'topright' },
  overlays = {},
  overlaysA = {},
  overlaysB = {},
  layers = L.control.layers(baseMaps, overlays, bottomleft).addTo(map).expand(),
  layersA = L.control.layers(baseMapsA, overlaysA, bottomright).addTo(mapA),
  layersB = L.control.layers(baseMapsB, overlaysB, bottomright).addTo(mapB)
