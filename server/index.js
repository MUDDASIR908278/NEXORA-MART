import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 5000

/* -------------------- Security & parsing -------------------- */
app.use(helmet())
app.use(compression())
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') ?? '*',
    credentials: true,
  })
)
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

/* -------------------- Trust proxy for Render/Heroku/Vercel -------------------- */
app.set('trust proxy', 1)

/* -------------------- Rate limiting -------------------- */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
})
app.use('/api', apiLimiter)

/* -------------------- Health check -------------------- */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'NEXORA MART API',
    timestamp: new Date().toISOString(),
  })
})

/* -------------------- Routes -------------------- */
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

/* -------------------- Errors -------------------- */
app.use(notFound)
app.use(errorHandler)

/* -------------------- Boot -------------------- */
app.listen(PORT, () => {
  console.log(`\n🚀  NEXORA MART API running on http://localhost:${PORT}`)
  console.log(`    ENV: ${process.env.NODE_ENV || 'development'}\n`)
})

export default app