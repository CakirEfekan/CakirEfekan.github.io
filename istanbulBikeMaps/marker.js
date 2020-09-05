'use strict'
let requestURL = 'https://cakirefekan.github.io/istanbulBikeMaps/data.json'
let request = new XMLHttpRequest()
request.open('GET', requestURL)
request.responseType = 'json'
request.onload = function () {
  const jsonData = request.response
  addMarker(jsonData)
}
request.send()
function addMarker(obj) {
  let stations = obj.dataList
  let countStation = stations.length
  //  console.log(countStation)
  for (let i = 0; i < countStation; i++) {
    let station = stations[i]
    let kapasite = parseInt(station.dolu) + parseInt(station.bos)
    //    console.log(station)
    L.marker([station.lat, station.lon])
      .bindPopup(
        '<b>' + station.adi + '</b><br>Bisiklet Kapasitesi: ' + kapasite
      )
      .addTo(map)
  }
}
