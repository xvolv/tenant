import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const {
      roomId,
      year,
      monthIndex,
      isPaid,
      renterId
    } = await request.json()
    
    if (!roomId || year === undefined || monthIndex === undefined || isPaid === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const payment = await prisma.rentPayment.upsert({
      where: {
        roomId_year_monthIndex: {
          roomId,
          year,
          monthIndex,
        },
      },
      update: {
        isPaid,
        renterId,
      },
      create: {
        roomId,
        year,
        monthIndex,
        isPaid,
        renterId,
      },
    })
    
    return NextResponse.json(payment)
  } catch (error) {
    console.error('Failed to update payment:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}
