import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { language } = await request.json()
    
    if (!language || (language !== 'en' && language !== 'am')) {
      return NextResponse.json(
        { error: 'Invalid language. Must be "en" or "am"' },
        { status: 400 }
      )
    }
    
    // Get the first connected user's Telegram ID
    const TOKEN_FILE = join(process.cwd(), 'telegram-tokens.json')
    const LANG_FILE = join(process.cwd(), 'telegram-languages.json')
    
    if (existsSync(TOKEN_FILE)) {
      const tokenData = readFileSync(TOKEN_FILE, 'utf-8')
      const tokens = new Map(JSON.parse(tokenData))
      
      // Find first connected user
      for (const [token, userId] of tokens.entries()) {
        if (userId !== 'pending') {
          // Load existing languages
          let languages = new Map()
          if (existsSync(LANG_FILE)) {
            const langData = readFileSync(LANG_FILE, 'utf-8')
            languages = new Map(JSON.parse(langData))
          }
          
          // Update language preference
          languages.set(userId as string, language)
          writeFileSync(LANG_FILE, JSON.stringify(Array.from(languages.entries())))
          
          return NextResponse.json({
            success: true,
            message: `Language updated to ${language === 'en' ? 'English' : 'አማርኛ'}`
          })
        }
      }
    }
    
    return NextResponse.json(
      { error: 'No connected user found' },
      { status: 404 }
    )
    
  } catch (error) {
    console.error('Error updating language:', error)
    return NextResponse.json(
      { error: 'Failed to update language' },
      { status: 500 }
    )
  }
}
