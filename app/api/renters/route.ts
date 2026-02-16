import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const {
      fullName,
      phone,
      nationalId,
      roomId,
      moveInYear,
      moveInMonth,
      moveInDay,
      photoUrl
    } = await request.json()
    
    if (!fullName || !phone || !nationalId || !roomId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const renter = await prisma.renter.create({
      data: {
        fullName,
        phone,
        nationalId,
        roomId,
        moveInYear,
        moveInMonth,
        moveInDay,
        photoUrl,
      },
      include: {
        room: true,
      }
    })
    
    return NextResponse.json(renter)
  } catch (error) {
    console.error('Failed to create renter:', error)
    return NextResponse.json(
      { error: 'Failed to create renter' },
      { status: 500 }
    )
  }
}
