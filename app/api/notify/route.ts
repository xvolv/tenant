import { NextRequest, NextResponse } from 'next/server'

// This endpoint will be called by n8n to send notifications
export async function POST(request: NextRequest) {
  try {
    const { ownerId, message, type = 'payment_reminder' } = await request.json()
    
    if (!ownerId || !message) {
      return NextResponse.json(
        { error: 'Owner ID and message are required' },
        { status: 400 }
      )
    }
    
    // In production, get telegram_user_id from database
    // For now, we'll use a mock mapping (you should replace with DB query)
    const telegramUserId = await getTelegramUserId(ownerId)
    
    if (!telegramUserId) {
      return NextResponse.json(
        { error: 'Owner not connected to Telegram' },
        { status: 404 }
      )
    }
    
    // Send message via Telegram
    const result = await sendTelegramMessage(telegramUserId, message)
    
    return NextResponse.json({
      success: true,
      messageId: result.result?.message_id,
      type
    })
    
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// Helper function - in production, query your database
async function getTelegramUserId(ownerId: string): Promise<string | null> {
  // Mock implementation - replace with database query:
  // SELECT telegram_user_id FROM owners WHERE id = ?
  
  // For testing, return a hardcoded user ID
  // You should replace this with actual database logic
  return null // Return null until you implement the database
}

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set')
  
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    })
  })
  
  const data = await response.json()
  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`)
  }
  
  return data
}
