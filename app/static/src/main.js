// import './main.css'
import './birthchart.js'
import { drawChart, drawPlanets, glyphs } from './svg.js'
const Sidenav = createSidenav()
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
var birthChartMode = false

window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 900) planetOutput = PlanetOutputSm
  drawChart()
  initSocket()
})

window.addEventListener('resize', () => {
  if (window.innerWidth <= 900 && planetOutput !== PlanetOutputSm) {
    resetOutput(PlanetOutputSm)
  } else if (window.innerWidth > 900 && planetOutput !== PlanetOutputLg) {
    resetOutput(PlanetOutputLg)
    if (Sidenav.navOpen) Sidenav.closeNav()
  }
  if (birthChartMode) {
    return processPlanetData(results)
  }
  if (results.length > 0) drawPlanets(results)
})


export function clear() {
  console.log('clear called')
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
      processPlanetData(JSON.parse(e.data))
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

function processPlanetData(latest) {
  try {
    if (!birthChartMode && JSON.stringify(latest) === JSON.stringify(results)) return
    for (const result of latest) {
      updatePlanetOutput(result)
    }
    drawPlanets(latest)
    results = latest
    if (!loaded) loaded = true
  } catch (err) {
    console.log('processPlanetData err: ', err)
    throw err
    listenStop()
  }
}

function updatePlanetOutput(result) {
  const filteredKeys = ['id', 'sign', 'houses']
  if (!birthChartMode) {
    const previous = results.find(r => r.id === result?.id)
    if (loaded && previous) {
      if (JSON.stringify(result) === JSON.stringify(previous)) return
    }
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

function buildStr(result, keys) {
  const str = `${keys.map((k, i) => {
    if (i === 0 && result.hasOwnProperty('id')) return `<span>${result[k]} ${glyphs[result.id]}</span><br>`
    else if (i === keys.length - 1) return `<span>${result[k]}</span>`
    else return `<span>${result[k]}</span><br>`
  }).join('')}`
  return str
}

function listenStart() {
  interval = setInterval(requestData, 1000)
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

function getCurrentDateString() {
  const date = new Date()
  const isoStr = date.toISOString().substr(0, 10)
  let utcStr = date.toUTCString().substr(-12)
  utcStr = utcStr.substr(0, 8)
  const dateString = `${isoStr} ${utcStr}`
  return dateString
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
