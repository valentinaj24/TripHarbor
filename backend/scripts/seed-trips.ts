
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const destinations = [
  { name: 'Barcelona', country: 'Spain', lat: 41.3874, lng: 2.1686 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Bled', country: 'Slovenia', lat: 46.3683, lng: 14.1146 },
  { name: 'Cortina d’Ampezzo', country: 'Italy', lat: 46.5405, lng: 12.1357 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lng: 14.4378 },
  { name: 'Dubrovnik', country: 'Croatia', lat: 42.6507, lng: 18.0944 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.006 },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lng: -21.9426 },
  { name: 'Marrakech', country: 'Morocco', lat: 31.6295, lng: -7.9811 },
]

const trips = [
  ['Barcelona City Escape', 'Explore Gaudi architecture, beaches and local culture.', 'City Break', 'Easy', 3],
  ['Discover Ancient Rome', 'Visit historic landmarks and experience Italian culture.', 'Culture', 'Easy', 5],
  ['Paris Art & Culture', 'Discover museums, charming streets and iconic landmarks.', 'Culture', 'Easy', 7],
  ['Lake Bled Adventure', 'Enjoy beautiful lake views, hiking and outdoor activities.', 'Nature', 'Moderate', 9],
  ['Dolomites Hiking Experience', 'Explore mountain trails and breathtaking alpine scenery.', 'Hiking', 'Hard', 12],
  ['Amsterdam Weekend', 'Discover canals, museums and historic neighbourhoods.', 'City Break', 'Easy', 15],
  ['Prague Historic Discovery', 'Explore medieval streets, castles and local traditions.', 'Culture', 'Easy', 18],
  ['Dubrovnik Coastal Escape', 'Enjoy Adriatic views, historic walls and coastal walks.', 'Nature', 'Moderate', 20],
  ['Tokyo Explorer', 'Experience Japanese traditions, food and modern city life.', 'City Break', 'Moderate', 23],
  ['New York Highlights', 'Explore famous neighbourhoods, parks and city landmarks.', 'City Break', 'Easy', 26],
  ['Iceland Northern Lights', 'Discover dramatic landscapes and search for the northern lights.', 'Nature', 'Moderate', 30],
  ['Marrakech Cultural Journey', 'Explore traditional markets, gardens and Moroccan culture.', 'Culture', 'Easy', 33],
] as const

async function main() {
  const organizer = await prisma.user.findFirst({
    where: {
      role: 'ORGANIZER',
      accountStatus: 'ACTIVE',
    },
  })

  if (!organizer) {
    throw new Error(
      'No active ORGANIZER found. Create an organizer before seeding trips.'
    )
  }

  for (let i = 0; i < destinations.length; i++) {
    const destinationData = destinations[i]
    const tripData = trips[i]

    const existingDestination = await prisma.destination.findFirst({
      where: {
        name: destinationData.name,
        country: destinationData.country,
      },
    })

    const destination =
      existingDestination ??
      (await prisma.destination.create({
        data: {
          name: destinationData.name,
          country: destinationData.country,
          latitude: destinationData.lat,
          longitude: destinationData.lng,
        },
      }))

    const existingTrip = await prisma.trip.findFirst({
      where: {
        title: tripData[0],
        organizerId: organizer.id,
      },
    })

    if (existingTrip) {
      console.log(`Skipping existing trip: ${tripData[0]}`)
      continue
    }

    const startDate = new Date()
    startDate.setUTCDate(startDate.getUTCDate() + 20 + tripData[4])

    const endDate = new Date(startDate)
    endDate.setUTCDate(endDate.getUTCDate() + 3)

    await prisma.trip.create({
      data: {
        organizerId: organizer.id,
        destinationId: destination.id,
        title: tripData[0],
        description: tripData[1],
        category: tripData[2],
        difficulty: tripData[3],
        startDate,
        endDate,
        maxParticipants: 12 + (i % 4) * 4,
        meetingPoint: `${destinationData.name} City Center`,
        status: 'PUBLISHED',
      },
    })

    console.log(`Created: ${tripData[0]}`)
  }

  console.log('Trip seeding completed!')
}

main()
  .catch((error) => {
    console.error(error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
