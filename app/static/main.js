import { drawChart, drawPlanets } from './canvas.js'

const PlanetOutput = document.getElementById('planet-output')
const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']

var interval
var socket
var loaded = false
var results = []
const timeout = 900000
const baseUrl = 'ws://127.0.0.1:8000'

window.addEventListener('DOMContentLoaded', () => {
  drawChart()
  initSocket()
  listenStart()
})

async function processPlanetData(latest) {
  try {
    if (JSON.stringify(latest) === JSON.stringify(results)) {
      return
    }
    for (const result of latest) {
      const planet = planets[result.id]
      const keys = Object.keys(result).filter(k => k !== 'id' && k !== 'sign')
      if (!loaded) {
        initPlanetOutput(result, keys, planet)
      } else {
        updatePlanetOutput(result, keys, planet)
      }
    }
    drawPlanets(latest)
    results = latest
    if (!loaded) loaded = true
  } catch (err) {
    listenStop()
    throw err
  }
}

function initPlanetOutput(result, keys, planet) {
  const str = `<p id="${planet}">${keys.map(k => {
    return `<span>${result[k]}</span><br>`
  }).join('')}</p>`
  PlanetOutput.insertAdjacentHTML('beforeend', str)
}

function updatePlanetOutput(result, keys, planet) {
  const el = document.getElementById(`${planet}`)
  const str = `${keys.map(k => {
    return `<span>${result[k]}</span><br>`
  }).join('')}`
  el.innerHTML = str
}


function initSocket() {
  const client_id = Date.now()
  socket = new WebSocket(`${baseUrl}/ws/${client_id}`)

  socket.addEventListener('open', () => {
    console.log('connected')
    requestData()
  })

  socket.addEventListener('message', (event) => {
    processPlanetData(JSON.parse(event.data))
  })

  socket.addEventListener('close', () => {
    console.log('disconnected')
    listenStop()
  })
}

async function requestData() {
  if (socket && socket.readyState === 1) {
    await socket.send('requesting data')
  }
}

// request new planet data once per second
function listenStart(){
  interval = setInterval(requestData, 1000);

  setTimeout(() => {
    listenStop()
  }, timeout)
}

function listenStop(){
  clearInterval(interval)

  if (socket && socket.readyState === 1) {
    socket.close()
  }
}
