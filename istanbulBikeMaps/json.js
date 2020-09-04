var xhttp = new XMLHttpRequest()
xhttp.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    //console.log(this.responseText)
  }
}
xhttp.open(
  'POST',
  'https://api.ibb.gov.tr/ispark-bike/GetAllStationStatus',
  true
)
xhttp.onload = function () {
  var data = JSON.parse(this.response)
  console.log(data)
}
xhttp.send()
