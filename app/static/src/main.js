import './darkmode.js'
import SvgCanvas from './svg.js'
import { getCurrentDateString } from './birthchart.js'
const Sidenav = createSidenav()
const PlanetOutputLg = document.getElementById('planet-output')
const PlanetOutputSm = document.getElementById('planet-output-sm')
const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
const glyphs = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇']
const baseUrl = window.location.host.includes('astro-clock.com')
  ? 'wss://astro-clock.com'
  : 'ws://127.0.0.1:8000'

const minWidthSmall = 950
var planetOutput = PlanetOutputLg
var interval
var socket
var loaded = false
var results = []
var birthChartMode = false

window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= minWidthSmall) planetOutput = PlanetOutputSm
  SvgCanvas.drawChart()
  initSocket()
})

window.addEventListener('resize', () => {
  if (window.innerWidth <= minWidthSmall && planetOutput !== PlanetOutputSm) {
    resetOutput(PlanetOutputSm)
  } else if (window.innerWidth > minWidthSmall && planetOutput !== PlanetOutputLg) {
    resetOutput(PlanetOutputLg)
    if (Sidenav.navOpen) Sidenav.closeNav()
  }
  if (birthChartMode) {
    return processPlanetData(results)
  }
  if (results.length > 0) SvgCanvas.drawPlanets(results)
})

export function clear() {
  if (!birthChartMode) {
    birthChartMode = true
  }
  if (interval) clearInterval(interval)
  planetOutput.innerHTML = ''
  loaded = false
}

function resetOutput(outputEl) {
  planetOutput.innerHTML = ''
  planetOutput = outputEl
  loaded = false
}

function initSocket() {
  try {
    const client_id = Date.now()
    socket = new WebSocket(`${baseUrl}/ws/${client_id}`)
    socket.addEventListener('open', () => {
      console.log('connected')
      requestData()
    })
    socket.addEventListener('message', (e) => {
      handleMessage(e.data)
    })
    socket.addEventListener('close', () => {
      console.log('disconnected')
      listenStop()
    })
    listenStart()
  } catch(err) {
    throw err
  }
}

export function requestData(payload = null) {
  try {
    if (!payload) payload = JSON.stringify({ date: getCurrentDateString() })
    if (socket?.readyState === 1) {
      socket.send(payload)
    }
  } catch(err) {
    console.log('requestData err', err)
    throw err
  }
}

function handleMessage(data) {
  data = JSON.parse(data)
  if (data.error) {
    console.log('Received error: ', data.exc_value)
    console.log(data.traceback)
    listenStop()
    return
  }
  return processPlanetData(data)
}

function processPlanetData(latest) {
  try {
    if (!birthChartMode && JSON.stringify(latest) === JSON.stringify(results)) return
    for (const result of latest) {
      updatePlanetOutput(result)
    }
    SvgCanvas.drawPlanets(latest)
    results = latest
    if (!loaded) loaded = true
  } catch (err) {
    console.log('processPlanetData err: ', err)
    throw err
    listenStop()
  }
}

function updatePlanetOutput(result) {
  const keys = ['name', 'position']
  const previous = results.find(r => r.id === result?.id)
  if (!birthChartMode && loaded && previous) {
    if (JSON.stringify(result) === JSON.stringify(previous)) return
  }
  const str = buildStr(result, keys)
  if (!loaded) {
    const div = document.createElement('div')
    div.setAttribute('id', result.name)
    div.setAttribute('class', 'planet')
    div.innerHTML = str
    planetOutput.appendChild(div)
  } else {
    const el = document.getElementById(`${result.name}`)
    el.innerHTML = str
  }
}

function buildStr(result, keys) {
  const str = `${keys.map((k, i) => {
    let content = `<span>${result[k]}</span>`
    if (i === 0 && result.hasOwnProperty('id')) {
      content = `<span>${result[k]} ${glyphs[result.id]}</span>`
    }
    return content
  }).join('')}`
  return str
}

function listenStart() {
  interval = setInterval(requestData, 900)
  console.log('listen started')
}

function listenStop() {
  clearInterval(interval)
  const states = [1, 0]
  if (socket && states.includes(socket.readyState)) {
    console.log('closing socket')
    socket.close()
  }
  console.log('listen stopped')
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
