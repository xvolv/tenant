import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface GlobalSettings {
  language: 'en' | 'am'
}

const SETTINGS_FILE = join(process.cwd(), 'global-settings.json')

// Load existing settings
function loadSettings(): GlobalSettings {
  if (existsSync(SETTINGS_FILE)) {
    const data = readFileSync(SETTINGS_FILE, 'utf-8')
    return JSON.parse(data)
  }
  return { language: 'en' }
}

// Save settings
function saveSettings(settings: GlobalSettings) {
  writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
}

export async function GET() {
  try {
    const settings = loadSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error loading settings:', error)
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { language } = await request.json()
    
    if (!language || (language !== 'en' && language !== 'am')) {
      return NextResponse.json(
        { error: 'Invalid language. Must be "en" or "am"' },
        { status: 400 }
      )
    }
    
    const settings = { language }
    saveSettings(settings)
    
    return NextResponse.json({
      success: true,
      message: `Language updated to ${language === 'en' ? 'English' : 'አማርኛ'}`,
      settings
    })
    
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
