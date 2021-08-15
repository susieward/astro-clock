import { drawChart, drawPlanets, glyphs } from './canvas.js'
import Sidenav from './sidenav.js'
const PlanetOutputLg = document.getElementById('planet-output')
const PlanetOutputSm = document.getElementById('planet-output-sm')
const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
const baseUrl = window.location.host.includes('astro-clock.com')
  ? 'wss://astro-clock.com'
  : 'ws://127.0.0.1:8000'

var planetOutput = PlanetOutputLg
var socket
var loaded = false
var results = []

window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 900) planetOutput = PlanetOutputSm
  drawChart()
  initSocket()
  Sidenav.init()
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
  socket.addEventListener('open', () => { console.log('connected') })
  socket.addEventListener('message', (event) => { processPlanetData(JSON.parse(event.data)) })
  socket.addEventListener('close', () => { console.log('disconnected') })
}

async function processPlanetData(latest) {
  try {
    // if latest data is the same as previous, do nothing
    if (JSON.stringify(latest) === JSON.stringify(results)) return
    for (const result of latest) {
      const planet = planets[result.id]
      const keys = Object.keys(result).filter(k => k !== 'id' && k !== 'sign')
      if (!loaded) initPlanetOutput(result, keys, planet)
      else updatePlanetOutput(result, keys, planet)
    }
    drawPlanets(latest)
    results = latest
    if (!loaded) loaded = true
  } catch (err) {
    throw err
  }
}

function initPlanetOutput(result, keys, planet) {
  const str = `<div id="${planet}">
    ${buildStr(result, keys)}
  </div>`
  planetOutput.insertAdjacentHTML('beforeend', str)
}

function updatePlanetOutput(result, keys, planet) {
  const el = document.getElementById(`${planet}`)
  const str = buildStr(result, keys)
  el.innerHTML = str
}

function buildStr(result, keys) {
  const str = `${keys.map((k, i) => {
    if (i === 0) return `<span>${result[k]} ${glyphs[result.id]}</span><br>`
    else if (i === keys.length - 1) return `<span>${result[k]}</span>`
    else return `<span>${result[k]}</span><br>`
  }).join('')}`
  return str
}
