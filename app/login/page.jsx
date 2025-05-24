'use client';
import { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/firebase';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { doc, getDoc } from 'firebase/firestore';
import apiRequest from '@/utils/apiRequest';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();

    const handleSignIn = async () => {
        if (!email || !password) {
            setError('Email and Password are required!');
            return;
        }

        // Check if email ends with amrita.edu
        if (!email.endsWith('amrita.edu')) {
            setError('Please use an Amrita email address');
            return;
        }

        try {
            setLoading(true);
            const result = await signInWithEmailAndPassword(email, password);

            if (result && result.user) {
                // Find user in Auth collection
                const data = await apiRequest(`/api/user/${result.user.uid}`, {
                    method: 'GET',
                });

                if (data !== null) {
                    const userData = data;

                    // Get role and normalize to lowercase for case-insensitive comparison
                    const userRole = userData.role || '';
                    const normalizedRole = userRole.toLowerCase();

                    // Store user data in session storage (standardizing 'Reviewer' with capital R)
                    sessionStorage.setItem('user', 'true');
                    sessionStorage.setItem('name', userData.name || '');

                    // Standardize role for reviewer to match expectations in reviewer page
                    const standardizedRole = normalizedRole === 'reviewer' ? 'Reviewer' : userRole;
                    sessionStorage.setItem('role', standardizedRole);

                    // Handle reviewer role specifically (case-insensitive)
                    if (normalizedRole === 'reviewer') {
                        // Handle department data correctly for reviewers
                        let departments = userData.department;
                        // Ensure departments is always treated as an array
                        if (
                            departments &&
                            typeof departments === 'object' &&
                            !Array.isArray(departments)
                        ) {
                            departments = Object.values(departments);
                        }
                        sessionStorage.setItem('departments', JSON.stringify(departments || []));

                        // Also set the auth object that reviewer page is looking for
                        const authSession = {
                            authenticated: true,
                            name: userData.name || 'Reviewer',
                            role: 'Reviewer', // Standardized to capital R
                            departments: Array.isArray(departments) ? departments : [],
                        };
                        sessionStorage.setItem('auth', JSON.stringify(authSession));

                        // Redirect to reviewer page
                        router.push('/reviewer');
                        return;
                    }

                    // Redirect based on role for non-reviewers (case-insensitive)
                    switch (normalizedRole) {
                        case 'admin':
                            router.push('/admin');
                            break;
                        case 'user':
                            router.push('/user');
                            break;
                        default:
                            router.push('/'); // Default home page
                    }
                } else {
                    // User exists in Auth but not in Firestore
                    setError('User profile not found. Please contact support.');
                    console.error('User document not found in Firestore');
                }
            } else {
                setError('Invalid email or password!');
            }
        } catch (e) {
            setError('Login failed: ' + (e.message || 'Unknown error'));
            console.error('Login error:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900'>
            <Card className='w-96 bg-gray-800 text-white border-0 shadow-xl'>
                <CardContent className='p-8'>
                    <img
                        alt='profile'
                        src='/anokha_logo.png'
                        className='h-20 w-20 mx-auto object-cover rounded-full mb-4'
                    />
                    <h1 className='text-2xl font-semibold text-center mb-5'>Login</h1>

                    {error && <p className='text-red-500 text-sm mb-3'>{error}</p>}

                    <div className='mb-4'>
                        <label htmlFor='email' className='text-white mb-2 block'>
                            Email
                        </label>
                        <Input
                            type='email'
                            id='email'
                            placeholder='Enter your Amrita Email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='bg-gray-800 border-gray-600 text-white'
                        />
                    </div>

                    <div className='mb-4'>
                        <label htmlFor='password' className='text-white mb-2 block'>
                            Password
                        </label>
                        <PasswordInput
                            id='password'
                            placeholder='Enter your password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='bg-gray-800 border-gray-600 text-white'
                        />
                    </div>

                    <div className='my-3 text-right pr-1'>
                        <a className='text-green-500 cursor-pointer hover:underline' href='/reset'>
                            Forgot your Password?
                        </a>
                    </div>

                    <Button
                        onClick={handleSignIn}
                        className='w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2 mt-2'
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>

                    <p className='text-gray-400 text-sm mt-4 text-center'>
                        Don't have an account?{' '}
                        <a href='/signup' className='text-green-500'>
                            Sign Up
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default SignIn;
