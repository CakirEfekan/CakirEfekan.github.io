/*var xhttp = new XMLHttpRequest()
xhttp.open('POST', 'http://temiz.info/', true)
xhttp.withCredentials = true
xhttp.setRequestHeader('Content-Type', 'application/json')
xhttp.onload = function () {
  var data = JSON.parse(this.response)
  console.log(data)
}
xhttp.send({ request: 'authentication token' })
*/
async function get() {
  let url = 'data.json'
  let response = await fetch(url)

  if (response.ok) {
    // if HTTP-status is 200-299
    // get the response body (the method explained below)
    let json = await response.json()
    let stations = json.dataList
    stations.map(
      (station) =>
        function () {
          console.log(station.lat)
          L.marker([station.lat, station.lon])
            .bindPopup('I am a green leaf.')
            .addTo(map)
        }
    )
  } else {
    // alert('HTTP-Error: ' + response.status)
  }
}
get()
