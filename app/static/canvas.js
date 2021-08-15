const svg = document.getElementById('responsive-svg')
const chartEl = document.getElementById('chart-svg')
const svgns = "http://www.w3.org/2000/svg"
const signs = ['Aries', 'Taurus', 'Gemini','Cancer','Leo','Virgo', 'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
export const glyphs = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇']
var signData = []

export function drawPlanets(data) {
  drawChart()
  for (const planet of data) {
    const degrees = parsePlanetDegrees(planet)
    const planetSignData = signData.find(s => s.sign === planet.sign)
    const { startAngle } = planetSignData
    const angle = startAngle - degrees
    const str = window.innerWidth <= 900
      ? `${glyphs[planet.id]} ${degrees}°`
      : `${planet.name} (${degrees}°)`
    drawPoint(angle, str)
  }
}

export function drawChart() {
  chartEl.replaceChildren()
  const { center_x, center_y, min, radius } = getCurrentCanvas()
  drawElement('circle', { cy: center_y, cx: center_x, r: radius, fill: 'transparent', stroke: '#f9f9f9', 'stroke-width': 1, cursor: 'pointer' })
  let startAngle = 0
  let endAngle = 30
  signData = []
  for(let i = 0; i < signs.length; i++){
    const sign = signs[i]
    if (i > 0) {
      startAngle = startAngle - 30
      endAngle = endAngle - 30
    }
    const { x, y } = calcAngleCoords(startAngle)
    drawElement('path', {
      d: `M ${center_x},${center_y}, L ${x},${y}`,
      stroke: '#f9f9f9'
    })
    const mid = startAngle - 15
    const method = () => ({ center_x, center_y, radius: (radius * 0.7), min })
    const midCoords = calcAngleCoords(mid, method)
    drawElement('text', {
      x: midCoords.x - 30,
      y: midCoords.y,
      font: '14px Avenir',
      fill: '#f9f9f9'
    }, sign)
    signData.push({ id: i, sign, startAngle, endAngle })
  }
}

function drawPoint(angle, label){
  let { x, y } = calcAngleCoords(angle)
  drawElement('circle', { cy: y, cx: x, r: 4, fill: '#f9f9f9', cursor: 'pointer' })
  if (angle > -180 && angle > -90) {
    if (window.innerWidth <= 900) x = x - 60
    else x = x - 100
  } else if (angle < -180 && angle < -270) {
    if (window.innerWidth <= 900) {
      x = x - 40
      y = y - 10
    } else {
      x = x - 60
      y = y - 12
    }
  } else {
    x = x + 10
  }
  drawElement('text', { x, y, font: '14px Avenir', fill: '#f9f9f9' }, label)
}

function calcAngleCoords(angle, method = getCurrentCanvas) {
  const { center_x, center_y, min, radius } = method()
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

function getCurrentCanvas() {
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

function drawElement(type, attrs, text = '') {
  const newEl = document.createElementNS(svgns, `${type}`)
  gsap.set(newEl, { attr: { ...attrs } })
  if (type === 'text') newEl.append(text)
  chartEl.appendChild(newEl)
}
