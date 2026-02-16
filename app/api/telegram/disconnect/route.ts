import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { ownerId } = await request.json()
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      )
    }
    
    // Remove user from tokens
    const TOKEN_FILE = join(process.cwd(), 'telegram-tokens.json')
    if (existsSync(TOKEN_FILE)) {
      const tokenData = readFileSync(TOKEN_FILE, 'utf-8')
      const tokens = new Map(JSON.parse(tokenData))
      
      // Find and remove the user's token
      for (const [token, userId] of tokens.entries()) {
        if (userId === ownerId || (typeof userId === 'string' && tokens.get(token) === userId)) {
          tokens.delete(token)
          break
        }
      }
      
      writeFileSync(TOKEN_FILE, JSON.stringify(Array.from(tokens.entries())))
    }
    
    // Optionally remove language preference too
    const LANG_FILE = join(process.cwd(), 'telegram-languages.json')
    if (existsSync(LANG_FILE)) {
      const langData = readFileSync(LANG_FILE, 'utf-8')
      const languages = new Map(JSON.parse(langData))
      languages.delete(ownerId)
      writeFileSync(LANG_FILE, JSON.stringify(Array.from(languages.entries())))
    }
    
    return NextResponse.json({
      success: true,
      message: 'Disconnected from Telegram successfully'
    })
    
  } catch (error) {
    console.error('Error disconnecting from Telegram:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
