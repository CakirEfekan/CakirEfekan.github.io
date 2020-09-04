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
  let url = 'data.js'
  let response = await fetch(url, {
    method: 'POST'
  })

  if (response.ok) {
    // if HTTP-status is 200-299
    // get the response body (the method explained below)
    let json = await response.json()
    console.log(json)
  } else {
    alert('HTTP-Error: ' + response.status)
  }
}
get()
