
import 'dotenv/config'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password || password.length < 12) {
    throw new Error(
      'Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters).'
    )
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    throw new Error(
      'An account with this email already exists. Admin was not created.'
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      firstName: 'TripHarbor',
      lastName: 'Admin',
      email,
      passwordHash,
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
    },
  })

  console.log('Admin account created successfully.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
