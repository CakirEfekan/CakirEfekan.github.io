//////////////////////
// export GeoJSON Data
//////////////////////
map.on('draw:created', function (event) {
  var layer = event.layer,
    feature = (layer.feature = layer.feature || {})
  type = event.layerType
  let style = layer.options

  feature.type = feature.type || 'Feature'
  var props = (feature.properties = feature.properties || {})
  props.stroke = style.stroke
  props.color = style.color
  props.fillColor = style.fillColor
  props.fillOpacity = style.fillOpacity
  props.opacity = style.opacity
  props.clickable = style.clickable
  props.weight = style.weight
  //layer.feature = {properties: {}}; // No need to convert to GeoJSON.
  //var props = layer.feature.properties;
  let popupInput = prompt('İsim Verin', 'Mekan-' + objectCount)
  if (popupInput == null) {
    props.popupContent = 'Obje ' + objectCount++
  } else {
    props.popupContent = popupInput
  }

  let popupConfirm = confirm('Popup Gösterilsin mi?')
  if (popupConfirm) {
    layer.bindPopup(popupInput)
  }
  if (type == 'circle') {
    props.radius = layer.getRadius()
  }
  props.showPopup = popupConfirm
  props.name = props.popupContent
  props.image = null
})
let featureGroup = editableLayers
map.on('draw:created', function (e) {
  // Each time a feaute is created, it's added to the over arching feature group
  featureGroup.addLayer(e.layer)
})

// on click, clear all layers
/*
document.getElementById('delete').onclick = function (e) {
  featureGroup.clearLayers()
}*/

document.getElementById('export').onclick = function (e) {
  // Extract GeoJson from featureGroup
  var data = featureGroup.toGeoJSON()

  // Stringify the GeoJson
  var convertedData =
    'text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(data, null, 2))

  // Create export
  document
    .getElementById('export')
    .setAttribute('href', 'data:' + convertedData)
  document.getElementById('export').setAttribute('download', 'data.geojson')
}
