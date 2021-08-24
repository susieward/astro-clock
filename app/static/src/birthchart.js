import cityTimezones from 'city-timezones'
import { getPlanetSocket, getAscSocket, clear } from './main'
const ChartBtn = document.getElementById('chart-btn')
const DateInput = document.getElementById('date-input')
const TimeInput = document.getElementById('time-input')
const LocationInput = document.getElementById('place-input')
const SearchDropdown = document.getElementById('loc-results')

var timeout
var dateVal = null
var timeVal = TimeInput.value
var locationVal = null

ChartBtn.addEventListener('click', handleChart)
DateInput.addEventListener('change', (e) => { dateVal = e.target.value }, false)
TimeInput.addEventListener('change', (e) => { timeVal = e.target.value }, false)
LocationInput.addEventListener('input', handleInput, false)

function handleChart() {
  //const planetSocket = getPlanetSocket()
  const ascSocket = getAscSocket()
  if (dateVal && timeVal && locationVal) {
    clear()
    const { lat, lng, timezone } = locationVal
    const str = buildDateString(dateVal, timeVal, timezone)
    const payload = JSON.stringify({ long: lng, lat: lat, date: str })
    console.log('payload', payload)
    //planetSocket.send(str)
    ascSocket.send(payload)
  } else {
    alert('Please fill out all fields')
  }
}

function handleInput(e) {
  SearchDropdown.style.height = 0
  if (e.isComposing) return
  const data = e.target.value
  if (timeout) {
    clearTimeout(timeout)
  }
  timeout = setTimeout(() => {
    showResults(data)
  }, 300)
}

function showResults(data) {
  let results = cityTimezones.findFromCityStateProvince(data)
  if (results && results.length > 0) {
    let resultsInUS = results.filter(r => r.iso2 === 'US')
    let rest = results.filter(r => r.iso2 !== 'US')
    results = [...resultsInUS, ...rest]
    SearchDropdown.style.display = 'block'
    SearchDropdown.style.height = 'auto'
    SearchDropdown.style.width = "100%"
    SearchDropdown.style.maxHeight = '175px'
    SearchDropdown.innerHTML = `${results.map(r => {
      let text = r.iso2 === 'US'
        ? `${r.city}, ${r.state_ansi}`
        : `${r.city}, ${r.country}`
      return (`<span class="result" data-lat="${r.lat}" data-lng="${r.lng}" data-tmz="${r.timezone}">${text}</span>`)
    }).join('')}`

    const resultEls = document.querySelectorAll('.result')
    for (const el of resultEls) {
      el.addEventListener('click', (e) => {
        getResult(el)
      })
    }
  }
}

function getResult(el) {
  console.log(el.innerText)
  const result = {
    lat: Number(el.dataset.lat),
    lng: Number(el.dataset.lng),
    timezone: el.dataset.tmz
  }
  //console.log('result', result)
  locationVal = result
  //LocationInput.setAttribute('value', el.innerText)
  SearchDropdown.replaceChildren()
  SearchDropdown.style.height = 0
  SearchDropdown.style.display = 'none'
}

function buildDateString(dateVal, timeVal, timeZoneVal) {
  const baseDate = new Date(`${dateVal} ${timeVal}`)
  const tmz = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZoneVal,
    timeZoneName: 'short'
  }).format(baseDate).split(', ')[1]
  const date = new Date(`${dateVal} ${timeVal}:00 ${tmz}`)
  let utcStr = date.toUTCString().substr(-12)
  utcStr = utcStr.substr(0, 8)
  const dateString = `${dateVal} ${utcStr}`
  return dateString
}
