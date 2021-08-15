import { drawChart, drawPlanets } from './canvas.js'

const PlanetOutputLg = document.getElementById('planet-output')
const PlanetOutputSmall = document.getElementById('planet-output-sm')
const sideNav = document.getElementById('sidenav')
const menu = document.getElementById('menu')
const closeBtn = document.getElementById('close-btn')

var planetOutput = PlanetOutputLg

const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']

const baseUrl = window.location.host.includes('astro-clock.com')
  ? 'wss://astro-clock.com'
  : 'ws://127.0.0.1:8000'

var interval
var socket
var loaded = false
var results = []
var menuOpen = false

window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 900) {
    planetOutput = PlanetOutputSmall
  }
  drawChart()
  initSocket()
  listenStart()

  menu.addEventListener('click', () => {
    openMenu()
  })
  closeBtn.addEventListener('click', () => {
    closeMenu()
  })
})

window.addEventListener('resize', () => {
  if (window.innerWidth <= 900 && planetOutput !== PlanetOutputSmall) {
    planetOutput.innerHTML = ''
    planetOutput = PlanetOutputSmall
    loaded = false
  } else if (window.innerWidth > 900 && planetOutput !== PlanetOutputLg) {
    planetOutput.innerHTML = ''
    planetOutput = PlanetOutputLg
    loaded = false
    if (menuOpen) {
      closeMenu()
    }
  }
  if (results.length > 0) {
    drawPlanets(results)
  }
})

function openMenu() {
  sideNav.style.display = 'block'
  sideNav.style.position = 'fixed'
  sideNav.style.width = "200px"
  menuOpen = true
}
function closeMenu() {
  sideNav.style.width = "0px"
  sideNav.style.display = 'none'
  menuOpen = false
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

async function processPlanetData(latest) {
  try {
    // if latest data is the same as previous, do nothing
    if (JSON.stringify(latest) === JSON.stringify(results)) return

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
  const str = `<div id="${planet}">
    ${keys.map((k, i) => {
    return (i === keys.length - 1)
      ? `<span>${result[k]}</span>`
      : `<span>${result[k]}</span><br>`
  }).join('')}</div>`
  planetOutput.insertAdjacentHTML('beforeend', str)
}

function updatePlanetOutput(result, keys, planet) {
  const el = document.getElementById(`${planet}`)
  const str = `${keys.map((k, i) => {
  return (i === keys.length - 1)
    ? `<span>${result[k]}</span>`
    : `<span>${result[k]}</span><br>`
  }).join('')}`
  el.innerHTML = str
}

async function requestData() {
  if (socket && socket.readyState === 1) {
    await socket.send('requesting data')
  }
}

// request new planet data once per second
function listenStart(){
  interval = setInterval(requestData, 1000)
  // timeout after 20 minutes
  setTimeout(() => {
    listenStop()
  }, 1200000)
}

function listenStop(){
  clearInterval(interval)
  if (socket && socket.readyState === 1) {
    socket.close()
  }
}
