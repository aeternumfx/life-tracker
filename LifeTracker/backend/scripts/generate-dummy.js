import { runSeed } from '../../scripts/seed.js'

router.post('/generate-dummy', async (req, res) => {
  try {
    await runSeed({ confirm: true }) // Skip prompt
    res.json({ output: '✅ Dummy data seeded.' })
  } catch (err) {
    console.error('❌ Dummy seed failed:', err)
    res.status(500).json({ error: err.message || 'Seed failed' })
  }
})