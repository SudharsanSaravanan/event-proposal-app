import { db } from '@/app/firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());

        // Validate query parameters
        const { name } = SearchQuerySchema.parse(queryParams);

        const q = query(
            collection(db, 'Auth'),
            where('name', '>=', name),
            where('name', '<=', name + '\uf8ff')
        );

        const snapshot = await getDocs(q);
        const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(users);
    } catch (error) {
        if (error.name === 'ZodError') {
            return NextResponse.json(
                {
                    error: 'Invalid search parameters',
                    details: error.errors,
                },
                { status: 400 }
            );
        }
        console.error('Error searching users:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
