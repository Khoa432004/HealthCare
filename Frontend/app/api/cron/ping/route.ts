import { NextResponse } from 'next/server'

export async function GET() {
  const backendUrl = 'https://healthcare-spdk.onrender.com'
  
  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Cron-KeepAlive',
      },
      next: { revalidate: 0 } // Disable fetch caching in Next.js
    })
    
    return NextResponse.json({
      success: true,
      status: response.status,
      message: 'Keep alive ping sent successfully to Render backend'
    })
  } catch (error: any) {
    console.error('Keep-alive ping failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
