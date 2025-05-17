'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/app/firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ReviewerLayout from '@/app/ReviewerPages/ReviewerLayout';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ReviewerPage() {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [authError, setAuthError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                console.log('No user found, redirecting to login');
                router.push('/login');
                return;
            }

            try {
                console.log('User authenticated:', user.uid);

                // Check Firestore for user data
                const userRef = doc(db, 'Auth', user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    throw new Error('User document not found in Firestore');
                }

                const firestoreData = userSnap.data();
                console.log('User data from Firestore:', firestoreData);

                // Normalize role checking (case-insensitive and trimmed)
                const userRole = firestoreData.role?.toString().toLowerCase().trim();
                if (userRole !== 'reviewer') {
                    // Sign out the user since they don't have proper permissions
                    await signOut(auth);
                    throw new Error('Access denied: User does not have reviewer privileges');
                }

                // Process departments - ensure it's always an array
                let userDepartments = [];
                if (firestoreData.department) {
                    userDepartments = Array.isArray(firestoreData.department)
                        ? firestoreData.department
                        : typeof firestoreData.department === 'object'
                          ? Object.values(firestoreData.department)
                          : [firestoreData.department.toString()];
                }

                // Prepare user data object
                const authData = {
                    uid: user.uid,
                    authenticated: true,
                    name: firestoreData.name || user.displayName || 'Reviewer',
                    role: 'Reviewer', // Standardized role name
                    departments: userDepartments,
                    email: firestoreData.email || user.email || '',
                };

                // Update session storage
                sessionStorage.setItem('auth', JSON.stringify(authData));
                sessionStorage.setItem('user', 'true');
                sessionStorage.setItem('role', 'Reviewer');
                sessionStorage.setItem('name', authData.name);
                sessionStorage.setItem('departments', JSON.stringify(userDepartments));
                sessionStorage.setItem('email', authData.email);

                setIsAuthenticated(true);
                setUserData(authData);
                setAuthError(null);
            } catch (error) {
                console.error('Authentication error:', error);
                setAuthError(error.message);

                // Clear session data
                sessionStorage.removeItem('auth');
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('role');
                sessionStorage.removeItem('name');
                sessionStorage.removeItem('departments');
                sessionStorage.removeItem('email');

                // Don't redirect immediately - let the error UI show
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className='flex justify-center items-center h-screen bg-gray-900'>
                <Loader2 className='h-12 w-12 animate-spin text-blue-400' />
            </div>
        );
    }

    if (authError) {
        return (
            <div className='flex justify-center items-center h-screen bg-gray-900'>
                <div className='bg-red-900/50 text-red-200 p-6 rounded-lg max-w-md flex flex-col items-center gap-4'>
                    <AlertCircle className='h-12 w-12' />
                    <div className='text-center'>
                        <h2 className='font-semibold text-xl mb-2'>Access Denied</h2>
                        <p className='mb-4'>{authError}</p>
                        <button
                            onClick={() => {
                                signOut(auth).then(() => router.push('/login'));
                            }}
                            className='px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white'
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !userData) {
        return (
            <div className='flex justify-center items-center h-screen bg-gray-900'>
                <div className='bg-red-900/50 text-red-200 p-6 rounded-lg max-w-md flex items-start gap-4'>
                    <AlertCircle className='h-6 w-6 flex-shrink-0 mt-0.5' />
                    <div>
                        <h2 className='font-semibold text-xl mb-2'>Authentication Error</h2>
                        <p>Please try logging in again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return <ReviewerLayout userData={userData} />;
}
