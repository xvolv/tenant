import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    // Check if user is connected to Telegram
    const TOKEN_FILE = join(process.cwd(), 'telegram-tokens.json')
    const LANG_FILE = join(process.cwd(), 'telegram-languages.json')
    
    if (existsSync(TOKEN_FILE)) {
      const tokenData = readFileSync(TOKEN_FILE, 'utf-8')
      const tokens = new Map(JSON.parse(tokenData))
      
      // Find first connected user (not pending)
      for (const [token, userId] of tokens.entries()) {
        if (userId !== 'pending') {
          // Get user's language preference
          let language = 'en'
          if (existsSync(LANG_FILE)) {
            const langData = readFileSync(LANG_FILE, 'utf-8')
            const languages = new Map(JSON.parse(langData))
            const userLang = languages.get(userId as string)
            if (typeof userLang === 'string') {
              language = userLang
            }
          }
          
          return NextResponse.json({
            connected: true,
            telegramUserId: userId,
            language,
            firstName: 'User' // You could enhance this to store actual names
          })
        }
      }
    }
    
    return NextResponse.json({
      connected: false
    })
    
  } catch (error) {
    console.error('Error checking Telegram status:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
