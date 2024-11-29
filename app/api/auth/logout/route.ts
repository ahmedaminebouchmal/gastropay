import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Create response object
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear the token cookie using the cookies() API
    cookies().delete('token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
