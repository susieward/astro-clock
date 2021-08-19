import { drawChart, drawPlanets, glyphs } from './canvas.js'
const nav = document.getElementById('sidenav')
const menuBtn = document.getElementById('menu')
const closeBtn = document.getElementById('close-btn')
const Sidenav = createSidenav(nav, menuBtn, closeBtn)
const PlanetOutputLg = document.getElementById('planet-output')
const PlanetOutputSm = document.getElementById('planet-output-sm')
const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
const baseUrl = window.location.host.includes('astro-clock.com')
  ? 'wss://astro-clock.com'
  : 'ws://127.0.0.1:8000'

var planetOutput = PlanetOutputLg
var interval
var socket
var loaded = false
var results = []

window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 900) planetOutput = PlanetOutputSm
  drawChart()
  initSocket()
})
window.addEventListener('resize', () => {
  if (window.innerWidth <= 900 && planetOutput !== PlanetOutputSm) {
    planetOutput.innerHTML = ''
    planetOutput = PlanetOutputSm
    loaded = false
  } else if (window.innerWidth > 900 && planetOutput !== PlanetOutputLg) {
    planetOutput.innerHTML = ''
    planetOutput = PlanetOutputLg
    loaded = false
    if (Sidenav.navOpen) Sidenav.closeNav()
  }
  if (results.length > 0) drawPlanets(results)
})

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
  listenStart()
}

function listenStart() {
  interval = setInterval(requestData, 1000)
}
function listenStop() {
  clearInterval(interval)
  if ((socket.readyState === 1) || (socket.readyState === 0)) {
    socket.close()
  }
}

async function requestData() {
  if (socket?.readyState === 1) {
    await socket.send('requesting data')
  }
}

async function processPlanetData(latest) {
  try {
    // if latest data is the same as previous, do nothing
    if (JSON.stringify(latest) === JSON.stringify(results)) return
    for (const result of latest) {
      updatePlanetOutput(result, loaded)
    }
    drawPlanets(latest)
    results = latest
    if (!loaded) loaded = true
  } catch (err) {
    throw err
    listenStop()
  }
}

function updatePlanetOutput(result, isLoaded) {
  const planet = planets[result.id]
  const keys = Object.keys(result).filter(k => k !== 'id' && k !== 'sign')
  const str = buildStr(result, keys)
  if (!isLoaded) {
    const div = document.createElement('div')
    div.setAttribute('id', planet)
    div.innerHTML = str
    planetOutput.appendChild(div)
  } else {
    const el = document.getElementById(`${planet}`)
    el.innerHTML = str
  }
}

function buildStr(result, keys) {
  const str = `${keys.map((k, i) => {
    if (i === 0) return `<span>${result[k]} ${glyphs[result.id]}</span><br>`
    else if (i === keys.length - 1) return `<span>${result[k]}</span>`
    else return `<span>${result[k]}</span><br>`
  }).join('')}`
  return str
}

function createSidenav(nav, menuBtn, closeBtn) {
  class Sidenav {
    nav = nav
    menuBtn = menuBtn
    closeBtn = closeBtn
    constructor() {
      this.navOpen = false
      this.menuBtn.addEventListener('click', () => { this.openNav() })
      this.closeBtn.addEventListener('click', () => { this.closeNav() })
    }
    openNav() {
      this.nav.style.left = 0
      this.navOpen = true
    }
    closeNav() {
      this.nav.style.left = '-200px'
      this.navOpen = false
    }
  }
  return new Sidenav()
}
