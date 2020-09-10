//paste && delete drawings
function deleteDrawing(map, ab) {
  var deleteAction = L.Toolbar2.Action.extend({
    options: {
      toolbarIcon: {
        html: '&#10008;',
        tooltip: 'Haritayı Temizle'
      }
    },

    addHooks: function () {
      let countLayer = 0
      let iLayer = 0
      map.eachLayer(function (layer) {
        countLayer++
      })
      map.eachLayer(function (layer) {
        if (iLayer == 0) {
          map.removeLayer(layer)
        }
        console.log(layer)
      })
      if (ab == 'a') {
        new L.Toolbar2.Control({
          position: 'bottomright',
          actions: [pasteA, deleteDrawing(map)]
        }).addTo(map)
      } else {
        new L.Toolbar2.Control({
          position: 'bottomright',
          actions: [pasteB, deleteDrawing(map)]
        }).addTo(map)
      }
    }
  })
  return deleteAction
}

var pasteA = L.Toolbar2.Action.extend({
  options: {
    toolbarIcon: {
      html: '&#8689;',
      tooltip: 'Çizimleri Buraya Aktar'
    }
  },

  addHooks: function () {
    pasteData(mapA, 'a')
  }
})
var pasteB = L.Toolbar2.Action.extend({
  options: {
    toolbarIcon: {
      html: '&#8689;',
      tooltip: 'Çizimleri Buraya Aktar'
    }
  },

  addHooks: function () {
    pasteData(mapB, 'b')
  }
})
new L.Toolbar2.Control({
  position: 'bottomright',
  actions: [pasteA, deleteDrawing(mapA, 'a')]
}).addTo(mapA)
new L.Toolbar2.Control({
  position: 'bottomright',
  actions: [pasteB, deleteDrawing(mapB, 'b')]
}).addTo(mapB)

function pasteData(map, char) {
  let featureGroup = editableLayers
  // Extract GeoJson from featureGroup
  var data = featureGroup.toGeoJSON()
  uploadedJson = data
  let dataOverlay = L.geoJSON(data, {
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
  if (char == 'a') {
  } else {
    layersB.addOverlay(dataOverlay, 'Çizimler')
  }
}

// set color
function createColorButton(color) {
  var tool = L.Toolbar2.Action.extend({
    options: {
      toolbarIcon: {
        html:
          '<div style="width:40%;height:40%;border-radius:50%;background-color:' +
          color +
          '"></div>',
        tooltip: 'Seçili Nesneyi Boya'
      }
    },

    addHooks: function () {
      if (selected != undefined) {
        oldColor = color
        selected.setStyle({
          color: color
        })
        selected.feature.properties.color = color
      } else {
      }
    }
  })
  return tool
}
// make building
var toolBuilding = L.Toolbar2.Action.extend({
  options: {
    toolbarIcon: {
      html: '&#9874',
      tooltip: 'Yükseklik Ver'
    }
  },
  // selected from rightclick.js
  addHooks: function () {
    if (selected != undefined) {
      if (typeof selected.feature.properties.height != 'undefined') {
        let oldHeight = selected.feature.properties.height
        let newHeight = prompt('Kaç metre?', oldHeight)
        selected.feature.properties.height = newHeight
      } else {
        let newHeight = prompt('Kaç metre?', '3')
        selected.feature.properties.height = newHeight
      }
    } else {
    }
  }
})

new L.Toolbar2.Control({
  position: 'topright',
  actions: [
    createColorButton('#ff0000'),
    createColorButton('#ffe800'),
    createColorButton('#00ff0c'),
    createColorButton('#001bff'),
    toolBuilding
  ]
}).addTo(map)
