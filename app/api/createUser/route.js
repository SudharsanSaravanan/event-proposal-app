// app/api/createUser/route.js
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if it hasn't been initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL,
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export async function POST(request) {
  try {
    const { email, password, name, role, department } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    // Create the user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Create the user document in Firestore
    const db = admin.firestore();
    await db.collection('Auth').doc(userRecord.uid).set({
      name,
      email,
      department,
      role,
      createdAt: new Date().toISOString(),
      initialPassword: password
    });

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      uid: userRecord.uid
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}