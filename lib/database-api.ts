import { Room, Renter, RentPayment, EthiopianDate } from '@/lib/mockData'

// Convert database models to our existing types
export const dbToRoom = (room: any, renters: any[] = [], rentPayments: any[] = []): Room => ({
  id: room.id,
  name: room.name,
  renters: renters.map(dbToRenter),
  rentPayments: rentPayments.map(dbToRentPayment),
})

export const dbToRenter = (renter: any): Renter => ({
  id: renter.id,
  fullName: renter.fullName,
  phone: renter.phone,
  nationalId: renter.nationalId,
  roomId: renter.roomId,
  moveIn: {
    year: renter.moveInYear,
    monthIndex: renter.moveInMonth,
    day: renter.moveInDay,
  },
  moveOut: renter.moveOutYear
    ? {
        year: renter.moveOutYear,
        monthIndex: renter.moveOutMonth!,
        day: renter.moveOutDay!,
      }
    : undefined,
  photoUrl: renter.photoUrl,
})

export const dbToRentPayment = (payment: any): RentPayment => ({
  id: payment.id,
  roomId: payment.roomId,
  renterId: payment.renterId,
  year: payment.year,
  monthIndex: payment.monthIndex,
  isPaid: payment.isPaid,
})

// Database operations using API routes
export async function getRooms(): Promise<Room[]> {
  const response = await fetch('/api/rooms')
  if (!response.ok) {
    throw new Error('Failed to fetch rooms')
  }
  const rooms = await response.json()
  
  return rooms.map((room: any) =>
    dbToRoom(room, room.renters, room.rentPayments)
  )
}

export async function createRoom(name: string): Promise<Room> {
  const response = await fetch('/api/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create room')
  }
  
  const room = await response.json()
  return dbToRoom(room, room.renters, room.rentPayments)
}

export async function createRenter(data: {
  fullName: string
  phone: string
  nationalId: string
  roomId: string
  moveIn: EthiopianDate
  photoUrl?: string
}): Promise<Renter> {
  const response = await fetch('/api/renters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName: data.fullName,
      phone: data.phone,
      nationalId: data.nationalId,
      roomId: data.roomId,
      moveInYear: data.moveIn.year,
      moveInMonth: data.moveIn.monthIndex,
      moveInDay: data.moveIn.day,
      photoUrl: data.photoUrl,
    }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create renter')
  }
  
  const renter = await response.json()
  return dbToRenter(renter)
}

export async function updateRenter(
  id: string,
  data: {
    fullName?: string
    phone?: string
    nationalId?: string
    moveIn?: EthiopianDate
    photoUrl?: string
  }
): Promise<Renter> {
  const response = await fetch(`/api/renters/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...(data.fullName && { fullName: data.fullName }),
      ...(data.phone && { phone: data.phone }),
      ...(data.nationalId && { nationalId: data.nationalId }),
      ...(data.moveIn && {
        moveInYear: data.moveIn.year,
        moveInMonth: data.moveIn.monthIndex,
        moveInDay: data.moveIn.day,
      }),
      ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
    }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update renter')
  }
  
  const renter = await response.json()
  return dbToRenter(renter)
}

export async function deleteRenter(id: string): Promise<void> {
  const response = await fetch(`/api/renters/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete renter')
  }
}

export async function updateRentPayment(
  roomId: string,
  year: number,
  monthIndex: number,
  isPaid: boolean,
  renterId?: string
): Promise<RentPayment> {
  const response = await fetch('/api/payments', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      roomId,
      year,
      monthIndex,
      isPaid,
      renterId,
    }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update payment')
  }
  
  const payment = await response.json()
  return dbToRentPayment(payment)
}

export async function deleteRoom(id: string): Promise<void> {
  const response = await fetch(`/api/rooms/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete room')
  }
}
