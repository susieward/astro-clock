const svg = document.getElementById('responsive-svg')
const chartEl = document.getElementById('chart-svg')
const svgns = "http://www.w3.org/2000/svg"
const signs = ['Aries', 'Taurus', 'Gemini','Cancer','Leo','Virgo', 'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
export const glyphs = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇']
const majorAspects = [
  { name: 'Conjunction', degrees: 0, color: 'green' },
  { name: 'Sextile', degrees: 60, color: 'magenta' },
  { name: 'Square', degrees: 90, color: 'red' },
  { name: 'Trine', degrees: 120, color: 'blue' },
  { name: 'Opposition', degrees: 180, color: 'black' }
]
var signData = []
var planetData = {}

export function drawPlanets(data) {
  const asc = data.find(r => r.name === 'Ascendant')
  drawChart(asc)
  for (const planet of data) {
    const degrees = parsePlanetDegrees(planet)
    const angle = calcPlanetAngle(planet, degrees)
    const str = window.innerWidth <= 900
      ? `${planet.hasOwnProperty('id') ? glyphs[planet.id] : 'ASC'} ${degrees}°`
      : `${planet.name} (${degrees}°)`
    drawPoint(angle, str, asc)
    const aspects = getAspects(planet, angle, data)
    planetData[`${planet.name}`] = { angle, aspects }
  }
  drawAspects()
  if (asc) {
    drawHouses(asc)
  }
}

function drawHouses(asc) {
  console.log(asc.houses)
// soon
}

function drawAspects() {
  const planets = Object.keys(planetData)
  for (const key of planets) {
    const planet = planetData[key]
    if (planet.aspects.length > 0) {
      const planetA = calcAngleCoords(planet.angle)
      for (const aspect of planet.aspects) {
        const planetB = calcAngleCoords(aspect.angleB)
        drawSVG('path', {
          d: `M ${planetA.x},${planetA.y}, L ${planetB.x},${planetB.y}`,
          stroke: aspect.color
        })
      }
    }
  }
}

function getAspects(planet, angle, data) {
  let results = []
  let otherPlanets = data.filter(p => p.id !== planet.id)
  const orb = (planet.name === 'Sun' || planet.name === 'Moon') ? 10 : 6
  for (const planetB of otherPlanets) {
    const degreesB = parsePlanetDegrees(planetB)
    const angleB = calcPlanetAngle(planetB, degreesB)
    let diff = getPlanetDiff(angle, angleB)
    let aspects = calcAspects(diff, orb)
    if (aspects.length > 0) {
      results.push({
        planetB: planetB.name,
        angleB: angleB,
        ...aspects[0]
      })
    }
  }
  return results
}

function calcAspects(angle, orb) {
  let aspects = []
  for (const aspect of majorAspects) {
    const max = aspect.degrees + orb
    const min = aspect.degrees - orb
    if ((angle <= max) && (angle >= min)) {
      aspects.push(aspect)
    }
  }
  return aspects
}

function calcPlanetAngle(planet, degrees) {
  const planetSignData = signData.find(s => s.sign === planet.sign)
  const { startAngle } = planetSignData
  const angle = startAngle - degrees
  return angle
}

function getPlanetDiff(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  a %= 360
  b %= 360
  if (a < b) return getPlanetDiff(b, a)
  else return Math.min(a-b, b-a+360)
}

export function drawChart(asc = null) {
  chartEl.replaceChildren()
  const { center_x, center_y, min, radius } = getCurrentDimensions()
  drawSVG('circle', { cy: center_y, cx: center_x, r: radius, fill: 'transparent', stroke: '#f9f9f9', 'stroke-width': 1, cursor: 'pointer' })

  let index = 0
  let startAngle = 0
  let endAngle = 30
  let sign
  signData = []

  if (asc) {
    const ascSign = signs.find(s => s === asc.sign)
    index = signs.indexOf(ascSign)
    const ascDeg = parsePlanetDegrees(asc)
    startAngle = startAngle + ascDeg
  }

  while (true) {
    sign = signs[index]
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
    const { x, y } = calcAngleCoords(startAngle)
    drawSVG('path', {
      d: `M ${center_x},${center_y}, L ${x},${y}`,
      stroke: '#f9f9f9'
    })
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
  // console.log(signData)
}

function drawPoint(angle, label, asc){
  let { x, y } = calcAngleCoords(angle)
  angle = Math.abs(angle)
  drawSVG('circle', { cy: y, cx: x, r: 4, fill: '#f9f9f9', cursor: 'pointer' })

  const textCoords = calcTextCoords(angle, x, y)
  x = textCoords.x
  y = textCoords.y

  drawSVG('text', { x, y, font: '14px Avenir', fill: '#f9f9f9' }, label)
}

function calcTextCoords(angle, x, y) {
  let xDiff, yDiff
  if (angle < 180 && angle < 90) {
    if (angle > 45) {
      xDiff = (window.innerWidth <= 900) ? 30 : 60
      x = x - xDiff
      y = y + 20
    } else {
      xDiff = (window.innerWidth <= 900) ? 60 : 100
      x = x - xDiff
    }
  } else if (angle < 180 && angle > 90) {
    x = x + 10
    if (angle < 135) {
      y = y + 15
    }
  } else if (angle > 180 && angle < 270) {
    x = x + 10
  } else if (angle > 180 && angle > 270) {
    xDiff = (window.innerWidth <= 900) ? 40 : 60
    yDiff = (window.innerWidth <= 900) ? 10 : 12
    x = x - xDiff
    y = y - yDiff
  }
  return { x, y }
}


function calcAngleCoords(angle, data = null) {
  if (!data) data = getCurrentDimensions()
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

function getCurrentDimensions() {
  const center_x = svg.clientWidth / 2
  const center_y = svg.clientHeight / 2
  const min = Math.min(svg.clientHeight, svg.clientWidth)
  const radius = window.innerWidth <= 900
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
