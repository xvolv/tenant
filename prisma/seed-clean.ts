import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning database...')

  // Delete all rent payments first (due to foreign key constraints)
  await prisma.rentPayment.deleteMany({})
  
  // Delete all renters
  await prisma.renter.deleteMany({})
  
  // Delete all rooms
  await prisma.room.deleteMany({})

  console.log('Database cleaned successfully.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
