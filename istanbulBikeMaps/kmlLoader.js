fetch('mevcut-bisiklet-yollar.kml')
  .then((res) => res.text())
  .then((kmltext) => {
    // Create new kml overlay
    const parser = new DOMParser()
    const kml = parser.parseFromString(kmltext, 'text/xml')
    const track = new L.KML(kml)
    map.addLayer(track)

    // Adjust map to show the kml
    const bounds = track.getBounds()
    map.fitBounds(bounds)
  })
/*fetch('paylaml-bisiklet-yollar.kml')
  .then((res) => res.text())
  .then((kmltext) => {
    // Create new kml overlay
    const parser = new DOMParser()
    const kml = parser.parseFromString(kmltext, 'text/xml')
    const track = new L.KML(kml)
    map.addLayer(track)

    // Adjust map to show the kml
    const bounds = track.getBounds()
    map.fitBounds(bounds)
  })
*/
