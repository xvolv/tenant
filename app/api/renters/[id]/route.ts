import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {
      fullName,
      phone,
      nationalId,
      moveInYear,
      moveInMonth,
      moveInDay,
      photoUrl
    } = await request.json()
    
    const renter = await prisma.renter.update({
      where: { id: params.id },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(nationalId && { nationalId }),
        ...(moveInYear !== undefined && { moveInYear }),
        ...(moveInMonth !== undefined && { moveInMonth }),
        ...(moveInDay !== undefined && { moveInDay }),
        ...(photoUrl !== undefined && { photoUrl }),
      },
      include: {
        room: true,
      }
    })
    
    return NextResponse.json(renter)
  } catch (error) {
    console.error('Failed to update renter:', error)
    return NextResponse.json(
      { error: 'Failed to update renter' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.renter.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete renter:', error)
    return NextResponse.json(
      { error: 'Failed to delete renter' },
      { status: 500 }
    )
  }
}
