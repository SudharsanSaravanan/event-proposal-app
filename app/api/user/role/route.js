import { db } from '@/app/firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    if (!role) {
        return NextResponse.json({ error: 'Missing role parameter' }, { status: 400 });
    }

    try {
        const q = query(collection(db, 'Auth'), where('role', '==', role));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json(users);
    } catch (error) {
        if (error.name === 'ZodError') {
            return NextResponse.json(
                {
                    error: 'Invalid query parameters',
                    details: error.errors,
                },
                { status: 400 }
            );
        }
        console.error('Error fetching users by role:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
