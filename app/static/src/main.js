import { drawChart, drawPlanets, glyphs } from './canvas.js'
import './birthchart.js'
const Sidenav = createSidenav()
const PlanetOutputLg = document.getElementById('planet-output')
const PlanetOutputSm = document.getElementById('planet-output-sm')
const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
const baseUrl = window.location.host.includes('astro-clock.com')
  ? 'wss://astro-clock.com'
  : 'ws://127.0.0.1:8000'

var planetOutput = PlanetOutputLg
var interval
var planetSocket
var ascSocket
var loaded = false
var results = []

export const getPlanetSocket = () => planetSocket
export const getAscSocket = () => ascSocket

window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 900) planetOutput = PlanetOutputSm
  drawChart()
  initSockets()
})
window.addEventListener('resize', () => {
  if (window.innerWidth <= 900 && planetOutput !== PlanetOutputSm) {
    resetOutput(PlanetOutputSm)
  } else if (window.innerWidth > 900 && planetOutput !== PlanetOutputLg) {
    resetOutput(PlanetOutputLg)
    if (Sidenav.navOpen) Sidenav.closeNav()
  }
  if (results.length > 0) drawPlanets(results)
})

export function clear() {
  if (interval) clearInterval(interval)
  planetOutput.innerHTML = ''
  loaded = false
  drawChart()
}

function initSockets() {
  const client_id = Date.now()
  planetSocket = new WebSocket(`${baseUrl}/ws/${client_id}`)
  ascSocket = new WebSocket(`${baseUrl}/ws/asc/${client_id}`)
  ascSocket.addEventListener('message', processAscData)
  planetSocket.addEventListener('open', () => {
    console.log('connected')
    requestData()
  })
  planetSocket.addEventListener('message', processPlanetData)
  planetSocket.addEventListener('close', () => {
    console.log('disconnected')
    listenStop(planetSocket)
  })
  listenStart()
}

function listenStart() {
  interval = setInterval(requestData, 1000)
}
function listenStop(socket) {
  clearInterval(interval)
  const states = [1, 0]
  if (socket && states.includes(socket.readyState)) {
    socket.close()
  }
}

function requestData() {
  if (planetSocket && planetSocket.readyState === 1) {
    planetSocket.send('requesting data')
  }
}

function processAscData(event) {
  return processPlanetData(event)
}

function processPlanetData(event) {
  try {
    const latest = JSON.parse(event.data)
    if (JSON.stringify(latest) === JSON.stringify(results)) return
    for (const result of latest) {
      updatePlanetOutput(result)
    }
    drawPlanets(latest)
    results = latest
    if (!loaded) loaded = true
  } catch (err) {
    throw err
    listenStop()
  }
}

function updatePlanetOutput(result) {
  const filteredKeys = ['id', 'sign', 'houses']
  const previous = results.find(r => r.id === result?.id)
  if (loaded && previous) {
    if (JSON.stringify(result) === JSON.stringify(previous)) return
  }
  const planet = result.hasOwnProperty('id') ? planets[result.id] : 'Ascendant'
  const keys = Object.keys(result).filter(k => !filteredKeys.includes(k))
  const str = buildStr(result, keys)
  if (!loaded) {
    const div = document.createElement('div')
    div.setAttribute('id', planet)
    div.innerHTML = str
    planetOutput.appendChild(div)
  } else {
    const el = document.getElementById(`${planet}`)
    el.innerHTML = str
  }
}
function resetOutput(outputEl) {
  planetOutput.innerHTML = ''
  planetOutput = outputEl
  loaded = false
}

function buildStr(result, keys) {
  const str = `${keys.map((k, i) => {
    if (i === 0 && result.id) return `<span>${result[k]} ${glyphs[result.id]}</span><br>`
    else if (i === keys.length - 1) return `<span>${result[k]}</span>`
    else return `<span>${result[k]}</span><br>`
  }).join('')}`
  return str
}

function createSidenav() {
  class Sidenav {
    nav = document.getElementById('sidenav')
    menuBtn = document.getElementById('menu')
    closeBtn = document.getElementById('close-btn')
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
