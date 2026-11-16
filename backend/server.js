import express from 'express'

const app = express()
const PORT = process.env.PORT || 3001

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CHIPVERSE_ORIGIN || 'http://localhost:5173')
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'chipverse-backend' })
})

app.get('/api/worlds', (_req, res) => {
  res.json({
    worlds: [
      'logic-land',
      'circuit-city',
      'rtl-kingdom',
      'verification-zone',
      'fpga-planet',
      'silicon-factory',
      'physical-design-world',
      'chipverse-core',
    ],
  })
})

app.listen(PORT, () => {
  console.log(`CHIPVERSE backend running on http://localhost:${PORT}`)
})
