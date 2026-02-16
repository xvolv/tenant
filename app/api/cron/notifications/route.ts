import { NextRequest, NextResponse } from 'next/server'
import { checkRentNotifications } from '@/lib/notificationService'

// Security: You should add authentication for this endpoint
// For production, use a cron secret or API key
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔄 Running rent notification check...')
    
    const results = await checkRentNotifications()
    
    console.log(`✅ Notification check completed: ${results.sent} sent, ${results.failed} failed`)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })
    
  } catch (error) {
    console.error('❌ Cron job failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Also allow GET for manual testing (remove in production)
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Manual rent notification check...')
    
    const results = await checkRentNotifications()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })
    
  } catch (error) {
    console.error('❌ Manual check failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
