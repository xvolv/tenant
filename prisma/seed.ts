import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create rooms
  const room1 = await prisma.room.create({
    data: { name: 'ROOM 1' }
  })
  const room2 = await prisma.room.create({
    data: { name: 'ROOM 2' }
  })
  const room3 = await prisma.room.create({
    data: { name: 'ROOM 3' }
  })

  // Create renters
  const renter1 = await prisma.renter.create({
    data: {
      fullName: 'Abebe Kebede',
      phone: '+251911234567',
      nationalId: 'ABC123456',
      roomId: room1.id,
      moveInYear: 2016,
      moveInMonth: 0, // Meskerem
      moveInDay: 1,
    }
  })

  const renter2 = await prisma.renter.create({
    data: {
      fullName: 'Tigist Haile',
      phone: '+251912345678',
      nationalId: 'DEF789012',
      roomId: room2.id,
      moveInYear: 2016,
      moveInMonth: 3, // Tahsas
      moveInDay: 15,
    }
  })

  const renter3 = await prisma.renter.create({
    data: {
      fullName: 'Dawit Bekele',
      phone: '+251913456789',
      nationalId: 'GHI345678',
      roomId: room3.id,
      moveInYear: 2017,
      moveInMonth: 1, // Tikimt
      moveInDay: 10,
    }
  })

  // Create some rent payments
  const years = [2016, 2017, 2018, 2019, 2020]
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // Ethiopian months

  // Room 1 payments (some paid)
  for (const year of years) {
    for (const month of months) {
      if (year === 2016 && month <= 5) {
        await prisma.rentPayment.create({
          data: {
            roomId: room1.id,
            renterId: renter1.id,
            year,
            monthIndex: month,
            isPaid: true,
          }
        })
      } else if (year === 2016) {
        await prisma.rentPayment.create({
          data: {
            roomId: room1.id,
            renterId: renter1.id,
            year,
            monthIndex: month,
            isPaid: false,
          }
        })
      }
    }
  }

  // Room 2 payments (some paid)
  for (const year of years) {
    for (const month of months) {
      if (year === 2016 && month >= 3 && month <= 8) {
        await prisma.rentPayment.create({
          data: {
            roomId: room2.id,
            renterId: renter2.id,
            year,
            monthIndex: month,
            isPaid: true,
          }
        })
      } else if (year === 2016 && month >= 3) {
        await prisma.rentPayment.create({
          data: {
            roomId: room2.id,
            renterId: renter2.id,
            year,
            monthIndex: month,
            isPaid: false,
          }
        })
      }
    }
  }

  // Room 3 payments (some paid)
  for (const year of years) {
    for (const month of months) {
      if (year === 2017 && month >= 1 && month <= 6) {
        await prisma.rentPayment.create({
          data: {
            roomId: room3.id,
            renterId: renter3.id,
            year,
            monthIndex: month,
            isPaid: true,
          }
        })
      } else if (year === 2017 && month >= 1) {
        await prisma.rentPayment.create({
          data: {
            roomId: room3.id,
            renterId: renter3.id,
            year,
            monthIndex: month,
            isPaid: false,
          }
        })
      }
    }
  }

  console.log('Seeding finished.')
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
