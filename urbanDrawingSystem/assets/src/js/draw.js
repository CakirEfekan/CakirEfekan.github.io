//////////////////
//for Leaflet.draw
//////////////////

layers.addOverlay(editableLayers, 'Çizimler')
var drawOptions = {
  position: 'topleft',
  draw: {
    polyline: {
      allowIntersection: false, // Restricts shapes to simple polygons
      drawError: {
        color: '#e1e100', // Color the shape will turn when intersects
        message:
          '<strong>Hayda!<strong> Ne bir duvar ne de bir yol kendi içinden geçer!' // Message that will show when intersect
      },
      shapeOptions: {
        color: '#f357a1',
        weight: 10
      }
    },
    polygon: {
      allowIntersection: false, // Restricts shapes to simple polygons
      drawError: {
        color: '#e1e100', // Color the shape will turn when intersects
        message:
          '<strong>Hayda!<strong> Ne bir duvar ne de bir yol kendi içinden geçer!' // Message that will show when intersect
      },
      shapeOptions: {
        color: '#bada55'
      }
    },
    circlemarker: false, // Turns off this drawing tool
    rectangle: {
      shapeOptions: {
        clickable: false
      }
    },
    marker: {}
  },
  edit: {
    featureGroup: editableLayers, //REQUIRED!!
    moveMarkers: true // centroids, default: false
  }
}

var drawControl = new L.Control.Draw(drawOptions)
map.addControl(drawControl)
let objectCount = 0
map.on('draw:created', function (event) {
  var layer = event.layer
  editableLayers.addLayer(layer)
})
map.on(L.Draw.Event.CREATED, function (e) {
  var type = e.layerType,
    layer = e.layer

  editableLayers.addLayer(layer)
})
