/////////////////
//Sağ tık menüsü
////////////////
/*
      editableLayerGroup.eachLayer(function (layer) {
        layer.on('click', function (e) {
          alert(aa)
        })
      })
      var popup = L.popup().setContent(
        '<p>Hello world!<br />This is a nice popup.</p>'
      )
      editableLayers.on('contextmenu', function (e) {
        editableLayers.eachLayer(function (e) {
          e.on('click', function (a) {
            // console.log(e)
            if (e.feature.properties.radius != null) {
              let radius = prompt('Çember Kaç Metre Olmalı', e.getRadius())
              if (radius) {
                e.setRadius(radius)
              }
            }
            editableLayers.removeEventParent(a)
          })
          editableLayers.removeEventParent(e)
        })
        editableLayers.removeEventParent(e)
      })*/

var selected
let oldColor
let oldSelected
editableLayers.on('click', function (e) {
  editableLayers.off('contextmenu')
  // Check for selected
  map.once('click', function (e) {
    map.off('click')
    selected.setStyle({
      fillColor: selected.color
    })
    selected = undefined
  })

  if (selected != undefined) {
    oldSelected = selected

    oldSelected.setStyle({
      fillColor: oldColor
    })

    selected = e.layer
    // Bring selected to front
    //selected.bringToFront()
    // Style selected
    selected.setStyle({
      fillColor: 'red'
    })
  } else {
    selected = e.layer
    oldColor = e.layer.options.color
    // Bring selected to front
    selected.bringToFront()
    // Style selected
    selected.setStyle({
      fillColor: 'red'
    })
    oldSelected = selected
  }
  editableLayers.on('contextmenu', function (e) {
    if (e.layer._leaflet_id == selected._leaflet_id) {
      if (typeof e.layer.feature.properties.radius != 'undefined') {
        let newRadius = prompt('Çap?', e.layer.feature.properties.radius)
        e.layer.setRadius(newRadius)
      }
    }
  })
})
