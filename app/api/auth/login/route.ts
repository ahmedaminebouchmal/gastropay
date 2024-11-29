import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/models/user';
import connectDB from '@/lib/db';
import { cookies } from 'next/headers';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    await connectDB();
    console.log('Connected to DB');
    
    const { email, password } = await req.json() as LoginRequest;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).exec();
    console.log('User found:', !!user);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Create the response first
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      }
    });

    // Then set the cookie
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    console.log('Login successful, token set in cookies');
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
