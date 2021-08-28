import cityTimezones from 'city-timezones'
import { requestData, clear } from './main.js'
const ChartBtn = document.getElementById('chart-btn')
const DateInput = document.getElementById('date-input')
const TimeInput = document.getElementById('time-input')
const LocationInput = document.getElementById('place-input')
const SearchDropdown = document.getElementById('loc-results')

DateInput.value = new Date().toISOString().substr(0, 10)

var timeout
var dateVal = DateInput.value
var timeVal = TimeInput.value
var locationVal = null

ChartBtn.addEventListener('click', handleChart)
DateInput.addEventListener('change', (e) => {
  dateVal = e.target.value
})
TimeInput.addEventListener('change', (e) => {
  timeVal = e.target.value
})
LocationInput.addEventListener('input', handleInput)

function handleChart() {
  if (dateVal && timeVal && locationVal) {
    console.log(dateVal, timeVal, locationVal)
    return requestBirthChart(dateVal, timeVal, locationVal)
  } else {
    alert('Please fill out all fields')
  }
}

function requestBirthChart(dateVal, timeVal, locationVal) {
  try {
    clear()
    const { lat, lng, timezone } = locationVal
    const str = buildDateString(dateVal, timeVal, timezone)
    const payload = JSON.stringify({ long: lng, lat: lat, date: str })
    console.log('requestBirthChart payload', payload)
    requestData(payload)
  } catch(err) {
    console.log('requestBirthChart err', err)
    throw err
  }
}

function handleInput(e) {
  SearchDropdown.style.height = 0
  if (e.isComposing) return
  const data = e.target.value
  if (timeout) {
    clearTimeout(timeout)
  }
  // add debounce to search
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

    // construct dynamic search dropdown with scrollable results
    SearchDropdown.style.display = 'block'
    SearchDropdown.style.height = 'auto'
    SearchDropdown.style.width = "100%"
    SearchDropdown.style.maxHeight = '175px'
    SearchDropdown.innerHTML = `${results.map(r => {
      let text = r.iso2 === 'US'
        ? `${r.city}, ${r.state_ansi}`
        : `${r.city}, ${r.country}`
        // embed search result data in element dataset attributes
      return (`<span class="result" data-lat="${r.lat}" data-lng="${r.lng}" data-tmz="${r.timezone}">${text}</span>`)
    }).join('')}`
    // attach event listeners to individual result elements to capture user selection
    const resultEls = document.querySelectorAll('.result')
    for (const el of resultEls) {
      el.addEventListener('click', (e) => {
        getResult(el)
      })
    }
  }
}

function getResult(el) {
  const result = {
    lat: Number(el.dataset.lat),
    lng: Number(el.dataset.lng),
    timezone: el.dataset.tmz
  }
  locationVal = result
  // show selection in input field
  LocationInput.value = el.innerText
  // finally, hide dropdown
  SearchDropdown.replaceChildren()
  SearchDropdown.style.height = 0
  SearchDropdown.style.display = 'none'
}

// Output: string containing ISO-formatted date + UTC time (w/ seconds), no timezone.
function buildDateString(dateValue, time, timezone) {
  // Create a date to pass to Intl.DateTimeFormat

  let str = fixForSafari(`${dateValue} ${time}`)
  const baseDate = new Date(str)
  console.log('baseDate', baseDate)

  // Obtain short-form timezone code from location input
  // (converting to date twice bc of bug seen on mobile)
  const tmz = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short'
  }).format(new Date(baseDate)).split(', ')[1]

  // This is essentially a workaround for how bonkers javascript's Date is:
  // Construct new date object from string containing the correct timezone code.
  // This way, when the new date object gets converted into the client's local timezone,
  // it will maintain its accuracy when converted into a UTC string.
  const withTmz = `${dateValue} ${time}:00 ${tmz}`
  const dateWithTmz = new Date(withTmz)
  let utcStr = dateWithTmz.toUTCString().substr(-12)
  utcStr = utcStr.substr(0, 8)
  const dateString = `${dateValue} ${utcStr}`
  return dateString
}

function fixForSafari(val) {
  let v = val.replace(/-/g, "/")
  return v
}
