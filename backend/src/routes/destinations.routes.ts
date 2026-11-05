
import { Router } from 'express'
import { createHash } from 'node:crypto'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

export const destinationsRouter = Router()

interface GeoapifyResult {
  place_id?: string
  name?: string
  city?: string
  country?: string
  state?: string
  formatted?: string
  lat?: number
  lon?: number
}

interface GeoapifyResponse {
  results?: GeoapifyResult[]
}

destinationsRouter.get(
  '/search',
  authenticate,
  authorize('ORGANIZER'),
  async (req, res, next) => {
    try {
      const q = typeof req.query.q === 'string'
        ? req.query.q.trim()
        : ''

      if (q.length < 3 || q.length > 100) {
        return res.status(400).json({
          message: 'Enter between 3 and 100 characters.',
        })
      }

      const apiKey = process.env.GEOAPIFY_API_KEY

      if (!apiKey) {
        return res.status(503).json({
          message: 'Destination search is not configured.',
        })
      }

      const params = new URLSearchParams({
        text: q,
        type: 'city',
        format: 'json',
        lang: 'en',
        limit: '8',
        apiKey,
      })

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
        { signal: AbortSignal.timeout(10000) }
      )

      if (!response.ok) {
        return res.status(502).json({
          message: 'Destination search provider is unavailable.',
        })
      }

      const payload = await response.json() as GeoapifyResponse

      const data = (payload.results ?? [])
        .filter(
          (place) =>
            place.country &&
            (place.city || place.name) &&
            typeof place.lat === 'number' &&
            typeof place.lon === 'number' &&
            Number.isFinite(place.lat) &&
            Number.isFinite(place.lon)
        )
        .map((place) => {
          const name = place.city || place.name || ''
          const country = place.country || ''
          const latitude = place.lat!
          const longitude = place.lon!

          // Stable identifier, independent of the provider's
          // optional place_id field.
          const identity = place.place_id ||
            `${name}|${country}|${latitude}|${longitude}`

          const id = createHash('sha256')
            .update(identity)
            .digest('hex')

          return {
            externalPlaceId: `geoapify:${id}`,
            name,
            country,
            displayName:
              place.formatted || `${name}, ${country}`,
            state: place.state || null,
            latitude,
            longitude,
          }
        })

      return res.json({ data })
    } catch (error) {
      next(error)
    }
  }
)

destinationsRouter.get(
  '/places',
  authenticate,
  authorize('ORGANIZER'),
  async (req, res, next) => {
    try {
      const query = typeof req.query.q === 'string'
        ? req.query.q.trim()
        : ''

      if (query.length < 3 || query.length > 100) {
        return res.status(400).json({
          message: 'Search query must contain 3 to 100 characters.',
        })
      }

      const apiKey = process.env.GEOAPIFY_API_KEY

      if (!apiKey) {
        return res.status(503).json({
          message: 'Location search is not configured.',
        })
      }

      const params = new URLSearchParams({
        text: query,
        format: 'json',
        lang: 'en',
        limit: '8',
        apiKey,
      })

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?${params}`
      )

      if (!response.ok) {
        return res.status(502).json({
          message: 'Location search is temporarily unavailable.',
        })
      }

      const result = await response.json() as {
        results?: Array<{
          place_id?: string
          formatted?: string
          name?: string
          address_line1?: string
          city?: string
          country?: string
          lat?: number
          lon?: number
        }>
      }

      const places = (result.results ?? [])
        .filter(
          (place) =>
            typeof place.lat === 'number' &&
            typeof place.lon === 'number'
        )
        .map((place) => ({
          placeId: place.place_id ?? '',
          name:
            place.name ??
            place.address_line1 ??
            place.formatted ??
            'Unknown location',
          displayName: place.formatted ?? '',
          city: place.city ?? '',
          country: place.country ?? '',
          latitude: place.lat!,
          longitude: place.lon!,
        }))

      return res.json({ data: places })
    } catch (error) {
      next(error)
    }
  }
)

