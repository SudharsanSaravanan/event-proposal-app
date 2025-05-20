'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/app/firebase/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleResetPassword = async () => {
        if (!email) {
            setError('Email is required!');
            return;
        }

        // Check if email ends with amrita.edu
        if (!email.endsWith('amrita.edu')) {
            setError('Please use an Amrita email address');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
            setEmail('');
        } catch (e) {
            console.error('Password Reset Error:', e);
            if (e.code === 'auth/user-not-found') {
                setError('No account exists with this email address.');
            } else if (e.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError('Failed to send reset email. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900'>
            <Card className='w-96 bg-gray-800 text-white border-0 shadow-xl'>
                <CardContent className='p-8'>
                    <h1 className='text-2xl font-semibold text-center mb-2'>Reset Password</h1>
                    <p className='text-gray-400 text-center mb-6'>
                        Enter your Amrita email address and we'll send you instructions to reset
                        your password.
                    </p>

                    {error && (
                        <Alert className='mb-4 bg-red-900 border-red-800 text-white'>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className='mb-4 bg-green-800 border-green-700 text-white'>
                            <AlertDescription>
                                Password reset email sent! Check your inbox for further
                                instructions.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className='mb-6'>
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
                            disabled={isLoading || success}
                        />
                    </div>

                    <Button
                        onClick={handleResetPassword}
                        className='w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2 mb-4'
                        disabled={isLoading || success}
                    >
                        {isLoading ? 'Sending...' : 'Reset Password'}
                    </Button>

                    <Button
                        onClick={() => router.push('/login')}
                        className='w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2'
                    >
                        Back to Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
