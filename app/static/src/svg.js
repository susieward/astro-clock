const svg = document.getElementById('responsive-svg')
const chartEl = document.getElementById('chart-svg')
const chartDetails = document.getElementById('chart-details')
const housesOutputSmall = document.getElementById('houses-output-sm')
const svgns = "http://www.w3.org/2000/svg"
const signs = ['Aries', 'Taurus', 'Gemini','Cancer','Leo','Virgo', 'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
export const glyphs = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇']
const romanNums = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
const majorAspects = [
  { name: 'Conjunction', degrees: 0, color: 'green' },
  { name: 'Sextile', degrees: 60, color: 'magenta' },
  { name: 'Square', degrees: 90, color: 'red' },
  { name: 'Trine', degrees: 120, color: 'blue' },
  { name: 'Opposition', degrees: 180, color: 'black' }
]
const minWidthSmall = 950
var signData = []
var planetData = {}

export function drawPlanets(data) {
  const asc = data.find(r => r.name === 'Ascendant')
  drawChart(asc)
  for (const planet of data) {
    const degrees = planet.deg
    const angle = calcPlanetAngle(planet, degrees)
    const label = window.innerWidth <= minWidthSmall
      ? `${planet.hasOwnProperty('id') ? glyphs[planet.id] : 'ASC'} ${degrees}°`
      : `${planet.name} (${degrees}°)`
    drawPlanetPoint(angle, label, degrees)
    const aspects = getPlanetAspects(planet, angle, data)
    planetData[`${planet.name}`] = { angle, aspects }
  }
  chartDetails.innerHTML = ''
  drawAspects()
  if (asc) {
    drawHouses(asc)
  }
}

function drawHouses(asc) {
  const houses = asc.houses.filter(h => h.number !== 1)
  const hex = '#d1c5ef'
  for (const h of houses) {
    const degrees = Number(h.deg)
    let angle = calcPlanetAngle(h, degrees)
    let { x, y } = calcAngleCoords(angle)
    drawSVG('circle', {cy: y, cx: x, r: 2, fill: hex, cursor: 'pointer'})
    const label = `${romanNums[h.number - 1]}`
    const coords = calcHouseLabelCoords(angle, x, y)
    drawSVG('text', {x: coords.x, y: coords.y, font: '14px Avenir', fill: hex}, label)
  }
}

function displayHouseDetails(houses) {
  const housesStr = `
    <div class="houses-container">
    ${houses.map(h => {
    const posArr = h.position.split(' ')
    const pos = `${posArr[0]}°${posArr[2]}`
    return (`<div class="row">
        <span>House ${romanNums[h.number - 1]}</span> <span>${h.sign}</span> <span>${pos}</span>
      </div>`)
  }).join('')}
  </div>`
  chartDetails.insertAdjacentHTML('afterbegin', housesStr)
}

// this is so gross I hate this
function calcHouseLabelCoords(angle, x, y) {
  angle = Math.abs(angle)
  let xDiff, yDiff

  if (angle < 180) {
    if (angle <= 90) {
      if (angle <= 45) {
        x = x + 10
        y = y - 10
      } else {
        x = x - 5
        y = y - 15
      }
    } else {
      if (angle <= 135) {
        x = x - 10
        y = y - 15
      } else {
        x = x - 15
        y = y - 10
      }
    }
  } else if (angle > 180) {
      if (angle <= 270) {
        xDiff = (angle <= 225) ? 25 : 5
        yDiff = (angle <= 225) ? 5 : 25

        x = x - xDiff
        y = y + yDiff

      } else {
        xDiff = 5
        yDiff = (angle <= 315) ? 20 : 15

        x = x + xDiff
        y = y + yDiff
      }
    } else {
      x = x - 25
    }
  return { x, y }
}

function drawAspects() {
  const planetsWithAspects = Object.keys(planetData).filter(k => planetData[k].aspects.length > 0)
  if (planetsWithAspects.length === 0) return
  for (const p of planetsWithAspects) {
    const planet = planetData[p]
    const planetA = calcAngleCoords(planet.angle)
    for (const aspect of planet.aspects) {
      const planetB = calcAngleCoords(aspect.angleB)
      drawSVG('path', {
        d: `M ${planetA.x},${planetA.y}, L ${planetB.x},${planetB.y}`,
        stroke: aspect.color
      })
    }
  }
  displayAspectDetails(planetsWithAspects)
}

function displayAspectDetails(planetsWithAspects) {
  const aspectsAdded = []
  const aspectStr = `<div class="houses-container">
    ${planetsWithAspects.map((p, i) => {
      const { aspects } = planetData[p]
      return `${aspects.map(a => {
        const reverse = `<span>${a.planetB}</span> <span>${a.name}</span> <span>${p}</span>`
        if (aspectsAdded.includes(reverse)) return
        const content = `<span>${p}</span> <span>${a.name}</span> <span>${a.planetB}</span>`
        aspectsAdded.push(content)
        return (`<div class="row">${content}</div>`)
    }).join('')}`
  }).join('')}
  </div>`
  chartDetails.insertAdjacentHTML('beforeend', aspectStr)
}

function getPlanetAspects(planet, angle, data) {
  const otherPlanets = data.filter(p => p.id !== planet.id)
  const orb = (planet.name === 'Sun' || planet.name === 'Moon') ? 10 : 6
  const results = otherPlanets.flatMap(planetB => {
    const degreesB = planetB.deg
    const angleB = calcPlanetAngle(planetB, degreesB)
    const diff = getPlanetDegreeDiff(angle, angleB)
    const aspects = calcAspects(diff, orb)
    if (aspects.length > 0) {
      return { planetB: planetB.name, angleB: angleB, ...aspects[0] }
    }
    return []
  })
  return results
}

function calcAspects(angle, orb) {
  const matchingAspects = majorAspects.filter(aspect => {
    const max = aspect.degrees + orb
    const min = aspect.degrees - orb
    if ((angle <= max) && (angle >= min)) {
      return aspect
    }
  })
  return matchingAspects
}

function calcPlanetAngle(planet, degrees) {
  const planetSignData = signData.find(s => s.sign === planet.sign)
  const { startAngle } = planetSignData
  const angle = startAngle - degrees
  return angle
}

function getPlanetDegreeDiff(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  a %= 360
  b %= 360
  if (a < b) return getPlanetDegreeDiff(b, a)
  else return Math.min(a-b, b-a+360)
}

export function drawChart(asc = null) {
  chartEl.replaceChildren()
  const { center_x, center_y, min, radius } = getClientDimensions()
  drawSVG('circle', { cy: center_y, cx: center_x, r: radius, fill: 'transparent', stroke: '#f9f9f9', 'stroke-width': 1, cursor: 'pointer' })

  let index = 0
  let startAngle = 0
  let endAngle = 30
  let sign
  signData = []

  if (asc) {
    const ascSign = signs.find(s => s === asc.sign)
    index = signs.indexOf(ascSign)
    const ascDeg = asc.deg
    startAngle = startAngle + ascDeg
  }

  while (true) {
    sign = signs[index]
    if (signData.length > 0 && asc && asc.sign === sign) {
      break
    }
    if (!sign) {
      if (!asc) break
      if (signData.length < signs.length) {
        index = 0
        sign = signs[index]
      } else {
        break
      }
    }
    if (signData.length > 0) {
      startAngle = startAngle - 30
      endAngle = endAngle - 30
    }
    // draw 30 degree section of circle
    const { x, y } = calcAngleCoords(startAngle)
    drawSVG('path', { d: `M ${center_x},${center_y}, L ${x},${y}`, stroke: '#f9f9f9' })
    // add sign text
    const mid = startAngle - 15
    const data = { center_x, center_y, radius: (radius * 0.7), min }
    const midCoords = calcAngleCoords(mid, data)
    drawSVG('text', {
      x: midCoords.x - 30,
      y: midCoords.y,
      font: '14px Avenir',
      fill: '#f9f9f9'
    }, sign)
    signData.push({ id: index, sign, startAngle, endAngle })
    index++
  }
}

function drawPlanetPoint(angle, label){
  let { x, y } = calcAngleCoords(angle)
  drawSVG('circle', { cy: y, cx: x, r: 4, fill: '#f9f9f9', cursor: 'pointer' })
  const textCoords = calcTextCoords(angle, x, y)
  x = textCoords.x
  y = textCoords.y
  drawSVG('text', { x, y, font: '14px Avenir', fill: '#f9f9f9' }, label)
}

// this is also gross
function calcTextCoords(angle, x, y) {
  angle = Math.abs(angle)
  let xDiff, yDiff
  if (angle < 180 && angle < 90) {
    if (angle > 45) {
      xDiff = (window.innerWidth <= minWidthSmall) ? 30 : 60
      x = x - xDiff
      y = y + 20
    } else {
      if (angle === 0) {
        xDiff = (window.innerWidth <= minWidthSmall) ? 65 : 125
        x = x - xDiff
      } else {
        xDiff = (window.innerWidth <= minWidthSmall) ? 60 : 100
        x = x - xDiff
      }
    }
  } else if (angle < 180 && angle > 90) {
    x = x + 10
    if (angle < 135) {
      y = y + 15
    }
  } else if (angle > 180 && angle <= 270) {
    x = x + 10
    y = y - 10
  } else if (angle > 180 && angle > 270) {
    xDiff = (window.innerWidth <= minWidthSmall) ? 40 : 60
    yDiff = (window.innerWidth <= minWidthSmall) ? 10 : 12
    x = x - xDiff
    y = y - yDiff
  }
  return { x, y }
}


function calcAngleCoords(angle, data = null) {
  if (!data) data = getClientDimensions()
  const { center_x, center_y, min, radius } = data
  const radians = toRadians(angle)

  let x = Math.round(center_x + (radius * Math.cos(-radians)))
  let y = Math.round(center_y + (radius * Math.sin(-radians)))

  let diff
  if (x > center_x) {
    diff = (x - center_x) * 2
    x = x - diff
  } else if (x < center_x) {
    diff = (center_x - x) * 2
    x = x + diff
  }
  return { x, y }
}

function getClientDimensions() {
  const center_x = svg.clientWidth / 2
  const center_y = svg.clientHeight / 2
  const min = Math.min(svg.clientHeight, svg.clientWidth)
  const radius = window.innerWidth <= minWidthSmall
    ? (min / 2) * 0.7
    : (min / 2) * 0.9
  return { center_x, center_y, min, radius }
}

function parsePlanetDegrees(result) {
  const posArr = result.position.split(' ')
  return Number(posArr[0])
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

function drawSVG(type, attrs, text = '') {
  const newEl = document.createElementNS(svgns, `${type}`)
  gsap.set(newEl, { attr: { ...attrs } })
  if (type === 'text') newEl.append(text)
  chartEl.appendChild(newEl)
}
