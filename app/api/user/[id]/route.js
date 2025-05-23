import { db } from '@/app/firebase/firebase';
import { CreateUserSchema, UpdateUserSchema, UserParamsSchema } from '@/schemas/user.schema';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(_, { params }) {
    try {
        const validatedParams = UserParamsSchema.parse(await params);
        const docRef = doc(db, 'Auth', validatedParams.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
        if (error.name === 'ZodError') {
            return NextResponse.json(
                {
                    error: 'Invalid parameters',
                    details: error.errors,
                },
                { status: 400 }
            );
        }
        console.error('Error getting user:', error);
        return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
    }
}

export async function DELETE(_, { params }) {
    try {
        const validatedParams = UserParamsSchema.parse(await params);
        await deleteDoc(doc(db, 'Auth', validatedParams.id));
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error.name === 'ZodError') {
            return NextResponse.json(
                {
                    error: 'Invalid parameters',
                    details: error.errors,
                },
                { status: 400 }
            );
        }
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const validatedParams = UserParamsSchema.parse(await params);

        const body = await request.json();
        const validatedUpdates = UpdateUserSchema.parse(body);

        const userRef = doc(db, 'Auth', validatedParams.id);
        await updateDoc(userRef, validatedUpdates);

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error.name === 'ZodError') {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: error.errors,
                },
                { status: 400 }
            );
        }
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const validatedData = CreateUserSchema.parse(body);
        const { name, email, userId, role, department = null } = validatedData;

        if (!name || !email || !userId || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const userData = {
            name,
            email,
            role,
            createdAt: serverTimestamp(),
        };

        if (department !== null) {
            if (role === 'Reviewer') {
                userData.department = Array.isArray(department)
                    ? department
                    : [department].filter(Boolean);
            } else {
                userData.department = typeof department === 'string' ? department : '';
            }
        }

        await setDoc(doc(db, 'Auth', userId), userData);

        return NextResponse.json({ success: true, message: 'User saved to Firestore' });
    } catch (error) {
        if (error.name === 'ZodError') {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: error.errors,
                },
                { status: 400 }
            );
        }
        console.error('Error saving user:', error);
        return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
    }
}
