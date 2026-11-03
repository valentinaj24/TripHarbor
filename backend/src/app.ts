
import express from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health.routes.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

export const app = express()

app.disable('x-powered-by')

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173'
}))

app.use(express.json())

app.use('/api/health', healthRouter)

app.use(notFound)
app.use(errorHandler)
