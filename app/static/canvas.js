const Canvas = document.getElementById('canvas')
const ctx = Canvas.getContext('2d')

ctx.font = '14px Avenir'

const center_x = 350
const center_y = 350
const radius = 300
const point_size = 4

const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo', 'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']

const coords = [{ x: 10, y: 350 }, { x: 40, y: 510 }, { x: 150, y: 620 }, { x: 330, y: 670 }, { x: 500, y: 630 }, { x: 630, y: 510 }, { x: 655, y: 350 }, { x: 615, y: 200 }, { x: 500, y: 80 }, { x: 320, y: 34 }, { x: 140, y: 75 }, { x: 30, y: 200 }]

var signData = []

// draw the astro chart on the canvas
function drawChart() {
  let startAngle = 0
  let endAngle = 30
  signData = []

  for(let i = 0; i < signs.length; i++){
    const sign = signs[i]

    if (i > 0) {
      startAngle = startAngle - 30
      endAngle = endAngle - 30
    }

    ctx.beginPath()
    ctx.moveTo(350, 350);
    ctx.arc(350, 350, radius, toRadians(startAngle), toRadians(endAngle), false)
    ctx.strokeStyle = '#f9f9f9'
    ctx.stroke()

    const { x, y } = coords[i]
    ctx.fillStyle = '#f9f9f9'
    ctx.fillText(sign, x, y)
    ctx.closePath()

    signData.push({
        id: i,
        sign: sign,
        startAngle: startAngle,
        endAngle: endAngle
      })
  }
}

function drawPlanets(data) {
  ctx.clearRect(0, 0, Canvas.width, Canvas.height)
  drawChart()
  for (const result of data) {
    processResult(result)
  }
}

function processResult(result) {
  const degrees = parseDegrees(result)
  const planetData = signData.find(s => s.sign === result.sign)
  const { startAngle } = planetData
  const angle = startAngle - degrees
  drawPoint(angle, `${result.name} (${degrees}°)`)
}

function drawPoint(angle, label){
  const radians = toRadians(angle)
  let x = Math.round(center_x + (radius * Math.cos(-radians)))
  let y = Math.round(center_y + (radius * Math.sin(-radians)))

  let diff
  if (x > 350) {
    diff = (x - 350) * 2
    x = x - diff
  } else if (x < 350) {
    diff = (350 - x) * 2
    x = x + diff
  }
  ctx.beginPath();
  ctx.arc(x, y, point_size, 0, 2 * Math.PI)
  ctx.fill()
  ctx.fillText(label, x + 10, y);
}

function parseDegrees(result) {
  const posArr = result.position.split(' ')
  return Number(posArr[0])
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

export { drawChart, drawPlanets }
