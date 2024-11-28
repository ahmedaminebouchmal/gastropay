import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/lib/models/Client';
import type { Client as ClientType } from '@/types/client';

export async function GET(): Promise<NextResponse> {
  try {
    console.log('Attempting to connect to MongoDB...');
    await dbConnect();
    console.log('Successfully connected to MongoDB');
    
    const clients = await Client.find({}).sort({ createdAt: -1 }) as ClientType[];
    console.log(`Found ${clients.length} clients`);
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error in GET /api/clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log('POST /api/clients - Starting client creation process');
    
    console.log('Attempting to connect to MongoDB...');
    await dbConnect();
    console.log('Successfully connected to MongoDB');
    
    const data = await request.json();
    console.log('Received client data:', data);
    
    console.log('Validating client data...');
    if (!data.fullName || !data.email || !data.phoneNumber || !data.address) {
      console.error('Missing required fields in client data');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log('Creating new client in MongoDB...');
    const client = await Client.create({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      company: data.company,
    }) as ClientType;
    
    console.log('Successfully created client:', client);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/clients:', error);
    
    // Check for specific MongoDB errors
    if (error.code === 11000) {
      console.error('Duplicate key error - email already exists');
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create client', details: error.message },
      { status: 500 }
    );
  }
}
