import p5 from 'p5'
import clamp from '~/utils/clamp'
import fakeUuid from '~/utils/fake-uuid'

export default (width?: number, height?: number) => {
  /* * * * * * * * * * * * * * * * * * * * * * *
   *
   * PARAMS
   * 
   * * * * * * * * * * * * * * * * * * * * * * */
  const params = {
    width: width ?? 200,
    height: height ?? 200,
    flow: 0,
    aperture: 1,
    frameRate: 60,
    maxSimultaneousGrains: 10 * 1000,
    gravity: 1,
    wind: {
      vx: 0,
      vy: 0
    },
    showStats: false
  }
  const setSize = (width: number, height: number) => { params.width = width; params.height = height }
  const setFlow = (flow: number) => { params.flow = flow }
  const setAperture = (aperture: number) => { params.aperture = clamp(aperture, 1, 100) }
  const setFrameRate = (frameRate: number) => { params.frameRate = clamp(frameRate, 1, 120) }
  const setMaxSimultaneousGrains = (max: number) => { params.maxSimultaneousGrains = clamp(max, 100, 1000 * 1000) }
  const setGravity = (gravity: number) => { params.gravity = gravity }
  const setShowStats = (newState: boolean) => { params.showStats = newState }
  
  /* * * * * * * * * * * * * * * * * * * * * * *
   *
   * SKETCH
   * 
   * * * * * * * * * * * * * * * * * * * * * * */
  const sketch = (s: p5) => {
    /* * * * * * * * * * * * * * * * * * * * * * *
     *
     * GRAINS
     * 
     * * * * * * * * * * * * * * * * * * * * * * */
    let prevFrameTimestamp = Date.now()
    let lastFramesDuration: number[] = []
    let grainsList: Grain[] = []
    class Grain {
      id: string
      x: number
      y: number
      vx: number
      vy: number

      constructor () {
        this.id = fakeUuid()
        this.x = (Math.random() - .5) * params.width * (params.aperture / 100)
        this.y = (Math.random() - .5) * 100 - 100
        this.vx = (Math.random() - .5) * 2
        this.vy = (Math.random() - .5) * 2
      }
    }
    const addGrains = (...grains: Grain[]) => {
      if (grainsList.length >= params.maxSimultaneousGrains) return
      grainsList.push(...grains)
    }
    const deleteGrains = (...ids: string[]) => {
      const newGrains = grainsList.filter(({ id }) => ids.indexOf(id) === -1)
      grainsList = newGrains
    }
    const downBelowGrainsDeleter = () => {
      const deleteIdsList = []
      for (const grain of grainsList) {
        if (grain.y > params.height) deleteIdsList.push(grain.id)
        if (grain.y < -200) deleteIdsList.push(grain.id)
        if (grain.x < (-1 * params.width / 2)) deleteIdsList.push(grain.id)
        if (grain.x > (params.width / 2)) deleteIdsList.push(grain.id)
      }
      deleteGrains(...deleteIdsList)
    }
    window.setInterval(downBelowGrainsDeleter, 50)

    /* * * * * * * * * * * * * * * * * * * * * * *
     *
     * SETUP
     * 
     * * * * * * * * * * * * * * * * * * * * * * */
    s.setup = () => {
      const { width, height, frameRate } = params
      
      // Apply settings
      s.createCanvas(width, height)
      s.frameRate(frameRate)
      
      // Draw background
      s.background(0, 0, 0, 0)
    }
  
    /* * * * * * * * * * * * * * * * * * * * * * *
     *
     * DRAW
     * 
     * * * * * * * * * * * * * * * * * * * * * * */
    s.draw = () => {
      // Apply settings
      const { width, height, frameRate, flow } = params
      s.resizeCanvas(width, height)
      s.frameRate(frameRate)
      
      // Draw background
      s.background(0, 0, 0, 0)

      // Create grains
      const newGrainProbability = flow / frameRate
      const intNewGrainProbability = window.parseInt(newGrainProbability.toString())
      const decNewGrainProbabilty = newGrainProbability - intNewGrainProbability
      const intNewGrains = new Array(intNewGrainProbability).fill(null).map(e => new Grain())
      const decNewGrains = Math.random() < decNewGrainProbabilty ? new Grain() : null
      addGrains(...intNewGrains)
      if (decNewGrains !== null) addGrains(decNewGrains)

      s.fill(0, 0, 0)
      for (const grain of grainsList) {
        // Apply gravity
        grain.vy += params.gravity

        // Apply air resistance
        // const grainRelativeXSpeed = grain.vx - params.wind.vx
        // const grainRelativeYSpeed = grain.vy - params.wind.vy

        // const grainRelativeAirSpeedSquared = (Math.pow(grainRelativeXSpeed, 2)) + (Math.pow(grainRelativeYSpeed, 2))
        // const rawAirResistance = grainRelativeAirSpeedSquared / 1000
        // const grainSummedXandYRelativeSpeeds = (Math.abs(grainRelativeXSpeed) + Math.abs(grainRelativeYSpeed))
        // const airResistanceX = rawAirResistance * (grainRelativeXSpeed / grainSummedXandYRelativeSpeeds)
        // const airResistanceY = rawAirResistance * (grainRelativeYSpeed / grainSummedXandYRelativeSpeeds)
        // grain.vx -= airResistanceX
        // grain.vy -= airResistanceY

        // Resolve forces
        grain.x += grain.vx
        grain.y += grain.vy

        // Draw grain
        s.rect(grain.x + (params.width / 2), grain.y, 1, 1)
      }

      // Stats panel
      if (params.showStats) {
        // Collect frame duration
        const now = Date.now()
        const duration = now - prevFrameTimestamp
        lastFramesDuration.push(duration)
        if (lastFramesDuration.length > 60) { lastFramesDuration = lastFramesDuration.slice(-60) }
        prevFrameTimestamp = now
        // Draw panel
        s.fill(0, 0, 0)
        s.rect(10, 10 + 30, 100, 80)
        s.fill('white')
        s.text(`${grainsList.length} grains.`, 14, 22 + 30)
        const avgFrameDuration = (lastFramesDuration.reduce((acc, curr) => (acc + curr), 0)) / lastFramesDuration.length
        s.text(`${(1000 / avgFrameDuration).toString().slice(0, 5)} fps avg`, 14, 42 + 30)
        s.text(`${params.aperture} aperture`, 14, 62 + 30)
        s.text(`${params.flow} flow`, 14, 82 + 30)
      }
    }
  }

  return {
    sketch,
    setSize,
    setFlow,
    setAperture,
    setFrameRate,
    setMaxSimultaneousGrains,
    setGravity,
    setShowStats
  }
}
