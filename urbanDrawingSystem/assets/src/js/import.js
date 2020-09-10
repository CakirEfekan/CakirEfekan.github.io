//////////////////////
// import GeoJSON file
//////////////////////
document.getElementById('inputLabel').addEventListener('click', function () {
  var evt = document.createEvent('MouseEvents')
  evt.initMouseEvent(
    'click',
    true,
    true,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  )
  var cb = document.getElementById('input')
  var canceled = !cb.dispatchEvent(evt)
})
const fileSelector = document.getElementById('input')
fileSelector.addEventListener('change', (event) => {
  const fileList = event.target.files
  for (let i = 0; i < fileList.length; i++) {
    let file = fileList[i]
    let reader = new FileReader()

    reader.readAsText(file)

    reader.onload = function () {
      let content = JSON.parse(reader.result)

      let jsonLayer = L.geoJSON(content, {
        pointToLayer: (feature, latlng) => {
          if (feature.properties.radius) {
            return new L.Circle(latlng, feature.properties.radius)
          } else {
            return new L.Marker(latlng)
          }
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent)
          }
          editableLayers.addLayer(layer)
          layer.setStyle({
            stroke: feature.properties.stroke,
            color: feature.properties.color,
            fillColor: feature.properties.fillColor,
            fillOpacity: feature.properties.fillOpacity,
            opacity: feature.properties.opacity,
            clickable: feature.properties.clickable,
            weight: feature.properties.weight,
            popupContent: feature.properties.popupContent,
            showPopup: feature.properties.showPopup,
            name: feature.properties.name,
            image: feature.properties.image
          })
        }
      })
    }

    reader.onerror = function () {
      console.log(reader.error)
    }
  }
})
