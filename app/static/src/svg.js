const svg = document.getElementById('responsive-svg')
const ChartEl = document.getElementById('chart-svg')
const ChartDetails = document.getElementById('chart-details')
const svgns = "http://www.w3.org/2000/svg"
const signs = ['Aries', 'Taurus', 'Gemini','Cancer','Leo','Virgo', 'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
const signGlyphs = ['♈︎', '♉︎', '♊︎', '♋︎', '♌︎', '♍︎', '♎︎', '♏︎', '♐︎', '♑︎', '♒︎', '♓︎']
const minWidthSmall = 950
const font = '14px Menlo'
const majorAspects = [
  { name: 'Conjunct', degrees: 0 },
  { name: 'Sextile', degrees: 60 },
  { name: 'Square', degrees: 90 },
  { name: 'Trine', degrees: 120 },
  { name: 'Opposite', degrees: 180 }
]

export default class SvgCanvas {
  static signData = []
  static planetsWithAspects = []

  static drawPlanets(data) {
    const asc = data.find(r => r.name === 'Ascendant')
    this.drawChart(asc)
    this.planetsWithAspects = []
    for (const planet of data) {
      const degrees = planet.deg
      const angle = this.calcPlanetAngle(planet, degrees)
      const label = (window.innerWidth <= minWidthSmall) ? planet.label_sm : planet.label
      this.drawPlanet(angle, label, degrees)
      this.updatePlanetAspects(planet, angle, data)
    }
    if (this.planetsWithAspects.length > 0) this.drawAspects()
    if (asc) this.drawHouses(asc)
  }

  static updatePlanetAspects(planet, angle, data) {
    const otherPlanets = data.filter(p => p.id !== planet.id)
    const orb = (planet.name === 'Sun' || planet.name === 'Moon') ? 10 : 6
    const planetAspects = otherPlanets.flatMap(planetB => {
      const degreesB = planetB.deg
      const angleB = this.calcPlanetAngle(planetB, degreesB)
      const diff = getPlanetDegreeDiff(angle, angleB)
      const planetAspects = calcAspects(diff, orb)
      if (planetAspects.length > 0) {
        return { planetB: planetB.name, angleB: angleB, ...planetAspects[0] }
      }
      return []
    })
    if (planetAspects.length > 0) {
      this.planetsWithAspects.push({ name: planet.name, angle, aspects: planetAspects })
    }
  }

  static calcPlanetAngle(planet, degrees) {
    const planetSignData = this.signData.find(s => s.sign === planet.sign)
    const { startAngle } = planetSignData
    return (startAngle - degrees)
  }

  static drawPlanet(angle, label){
    const { center_x, center_y, min, radius } = getClientDimensions()
    const innerDimensions = { center_x, center_y, radius: (radius * 0.8), min }
    let { x, y } = calcAngleCoords(angle, innerDimensions)
    const pointAttrs = { cy: y, cx: x, r: 4, id: 'planet-point' }
    let outerCoords = calcAngleCoords(angle)
    let textAttrs = { x: outerCoords.x, y: outerCoords.y }
    if (outerCoords.x < center_x) textAttrs.style = 'text-anchor: end'

    let dy = (outerCoords.y < center_y) ? -5 : 15
    let dx = (outerCoords.x === center_x) ? 0 : (outerCoords.x < center_x ? -5 : 10)

    const angleAbs = Math.abs(angle)
    if (angleAbs === 0 || angleAbs === 360) {
      dy = 0
    } else if (angleAbs  === 180 || angleAbs === 270) {
      dx = 0
    }
    const tspanAttrs = { dy, dx, id: 'planet-text' }
    drawSVG('circle', { ...pointAttrs })
    drawTextWithTspan(textAttrs, tspanAttrs, label)
  }

  static drawAspects() {
    const { center_x, center_y, min, radius, innerRadius } = getClientDimensions()
    const innerDimensions = { center_x, center_y, radius: innerRadius, min }
    const aspectsAdded = []

    for (const planet of this.planetsWithAspects) {
      const planetA = calcAngleCoords(planet.angle, innerDimensions)

      for (const aspect of planet.aspects) {
        const reverse = buildRow(aspect.planetB, aspect.name, planet.name)
        if (aspectsAdded.includes(reverse)) {
          continue
        }
        const content = buildRow(planet.name, aspect.name, aspect.planetB)
        aspectsAdded.push(content)

        const planetB = calcAngleCoords(aspect.angleB, innerDimensions)
        drawSVG('path', {
          d: `M ${planetA.x},${planetA.y}, L ${planetB.x},${planetB.y}`,
          id: aspect.name
        })
      }
    }
    displayAspectDetails()
  }

  static drawHouses(asc) {
    const houses = asc.houses
    const { center_x, center_y, min, radius, innerRadius } = getClientDimensions()
    const innerDimensions = { center_x, center_y, radius: innerRadius, min }
    const textDimensions = { center_x, center_y, radius: (radius * 0.3), min }
    const tspanAttrs = { id: 'house-text',
      'dominant-baseline': 'central',
      'alignment-baseline': 'middle'
    }
    let h, startAngle, endAngle, next;
    for (let i = 0; i < houses.length; i++) {
      h = houses[i]
      startAngle = this.calcPlanetAngle(h, h.deg)
      next = houses[i + 1]
      endAngle = (!next) ? 360 : this.calcPlanetAngle(next, next.deg)
      const innerCoords = calcAngleCoords(startAngle, innerDimensions)
      drawSVG('path', {
        d: `M ${center_x},${center_y}, L ${innerCoords.x},${innerCoords.y}`,
        id: 'house-path'
      })
      const angleDiff = Math.abs(endAngle) - Math.abs(startAngle)
      const midAngle = startAngle - (angleDiff / 2)
      const textCoords = calcAngleCoords(midAngle, textDimensions)
      const textAttrs = { x: textCoords.x, y: textCoords.y, style: 'text-anchor: middle;' }
      drawTextWithTspan(textAttrs, tspanAttrs, h.label)
    }
  }

  static drawChart(asc = null) {
    const { center_x, center_y, min, radius, innerRadius } = getClientDimensions()
    ChartEl.replaceChildren()
    drawSVG('circle', { id: 'chart-circle', cy: center_y, cx: center_x, r: radius })
    drawSVG('circle', { cy: center_y, cx: center_x, r: innerRadius })
    this.drawSigns(asc, center_x, center_y, min, radius, innerRadius)
  }

  static drawSigns(asc = null, center_x, center_y, min, radius, innerRadius) {
    let index = 0
    let startAngle = 0
    let endAngle = 30
    let sign
    this.signData = []

    if (asc) {
      const ascSign = signs.find(s => s === asc.sign)
      index = signs.indexOf(ascSign)
      const ascDeg = asc.deg
      startAngle = startAngle + ascDeg
    }

    while (true) {
      sign = signs[index]
      if (this.signData.length > 0 && asc && asc.sign === sign) {
        break
      }
      if (!sign) {
        if (!asc) break
        if (this.signData.length < signs.length) {
          index = 0
          sign = signs[index]
        } else {
          break
        }
      }
      if (this.signData.length > 0) {
        startAngle = startAngle - 30
        endAngle = endAngle - 30
      }
      drawSign(index, sign, startAngle, { center_x, center_y, min, radius, innerRadius })
      this.signData.push({ id: index, sign, startAngle, endAngle })
      index++
    }
  }
}

function drawSign(index, sign, startAngle, { ...dimensions }) {
  const { center_x, center_y, min, radius, innerRadius } = dimensions
  const glyph = signGlyphs[index]
  let { x, y } = calcAngleCoords(startAngle)
  const innerData = { center_x, center_y, radius: innerRadius, min }
  const innerCoords = calcAngleCoords(startAngle, innerData)
  drawSVG('path', { id: 'sign-path',
    d: `M ${innerCoords.x},${innerCoords.y}, L ${x},${y}`
  })
  const midAngle = startAngle - 15
  const textData = { center_x, center_y, radius: (radius * 0.9), min }
  const textCoords = calcAngleCoords(midAngle, textData)
  const textAttrs ={ x: textCoords.x, y: textCoords.y, style: 'text-anchor: middle;' }
  const tspanAttrs = {
    id: 'sign-text',
    'dominant-baseline': 'central',
    'alignment-baseline': 'middle'
  }
  drawTextWithTspan(textAttrs, tspanAttrs, glyph)
}

function calcAspects(angle, orb) {
  return majorAspects.filter(aspect => {
    const max = aspect.degrees + orb
    const min = aspect.degrees - orb
    if (angle <= max && angle >= min) {
      return aspect
    }
  })
}

function getPlanetDegreeDiff(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  a %= 360
  b %= 360
  if (a < b) return getPlanetDegreeDiff(b, a)
  else return Math.min(a - b, b - a + 360)
}

function calcAngleCoords(angle, data = null) {
  if (!data) data = getClientDimensions()
  const { center_x, center_y, min, radius } = data
  const radians = angle * (Math.PI / 180)

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
  const innerRadius = (radius * 0.8)
  return { center_x, center_y, min, radius, innerRadius }
}

function drawTextWithTspan(textAttrs, tspanAttrs, label) {
  const textEl = drawSVG('text', { ...textAttrs }, false)
  const tspan = drawSVG('tspan', { ...tspanAttrs }, false, label)
  textEl.append(tspan)
  ChartEl.appendChild(textEl)
}

function drawSVG(type, attrs, append = true, text = null) {
  const newEl = document.createElementNS(svgns, `${type}`)
  gsap.set(newEl, { attr: { ...attrs } })
  if (text) newEl.append(text)
  if (!append) return newEl
  else ChartEl.appendChild(newEl)
}

function displayAspectDetails() {
  const planetsWithAspects = SvgCanvas.planetsWithAspects
  const aspectsAdded = []
  const title = '// Aspects'
  const content = `
    ${planetsWithAspects.map((p, i) => {
      const { aspects } = p
      return `${aspects.map(a => {
        const reverse = buildRow(a.planetB, a.name, p.name)
        if (aspectsAdded.includes(reverse)) return
        const content = buildRow(p.name, a.name, a.planetB)
        aspectsAdded.push(content)
        return content
      }).join('')}`
    }).join('')}`
    ChartDetails.innerHTML = buildDetails(title, content)
}

function buildRow(left, center, right) {
  return (`
    <div class="row">
      <span>${left}</span>
      <span id="${center}" style="text-align: center">${center}</span>
      <span style="text-align: right;">${right}</span>
    </div>
  `)
}

function buildDetails(title, content) {
  return (`<div>
  <span class="details-title">
    <em>${title}</em>
  </span>
    <div class="details-row-container">
    ${content}
  </div>
  </div>`)
}
