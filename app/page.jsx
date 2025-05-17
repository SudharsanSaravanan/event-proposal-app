'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CalendarIcon,
    ClipboardCheckIcon,
    UserIcon,
    UsersIcon,
    FileTextIcon,
    CheckCircleIcon,
    ChevronRightIcon,
} from 'lucide-react';

const HomePage = () => {
    const router = useRouter();

    return (
        <div className='min-h-screen bg-gray-900 text-white'>
            {/* Header */}
            <header className='py-4 bg-gray-800 border-b border-gray-700 sticky top-0 z-50'>
                <div className='container mx-auto px-4 flex justify-between items-center'>
                    <div className='flex items-center space-x-2'>
                        <h1 className='text-2xl font-bold bg-gradient-to-r text-white bg-clip-text'>
                            Anokha 2025
                        </h1>
                    </div>
                    <div className='flex space-x-3'>
                        <Button
                            variant='outline'
                            onClick={() => router.push('/signup')}
                            className='bg-transparent text-white border border-gray-600 hover:bg-white hover:border-gray-400 active:bg-gray-700 active:scale-95 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md'
                        >
                            Sign Up
                        </Button>
                        <Button
                            onClick={() => router.push('/login')}
                            className='bg-green-600 hover:bg-green-500 transition-colors duration-200 border border-green-600 hover:border-green-500'
                        >
                            Login
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className='relative py-15 bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden'>
                <div className='absolute inset-0 opacity-10'>
                    <div className="absolute inset-0 bg-[url('/grid.svg')]"></div>
                </div>
                <div className='container mx-auto px-4 text-center relative z-10'>
                    <h2 className='text-4xl md:text-6xl font-bold mb-6 leading-tight'>
                        <span className='bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent'>
                            Event Proposal
                        </span>{' '}
                        Management System
                    </h2>
                    <p className='text-xl text-gray-300 max-w-3xl mx-auto mb-10'>
                        Streamline the process of proposing, reviewing, and managing events for
                        Anokha 2025 with our intuitive platform.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className='py-20 bg-gray-900'>
                <div className='container mx-auto px-4'>
                    <div className='text-center mb-16'>
                        <h2 className='text-3xl font-bold mb-4'>How It Works</h2>
                        <p className='text-gray-400 max-w-2xl mx-auto'>
                            Our platform is designed to cater to all roles involved in the event
                            management process
                        </p>
                    </div>
                    <div className='grid md:grid-cols-3 gap-8'>
                        <Card className='bg-gray-800 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:-translate-y-2'>
                            <CardHeader>
                                <div className='w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4'>
                                    <UserIcon className='h-6 w-6 text-blue-500' />
                                </div>
                                <CardTitle className='text-white'>For Proposers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-gray-300 mb-6'>
                                    Submit event proposals, track approval status, and manage event
                                    details all in one place.
                                </p>
                                <Button
                                    variant='link'
                                    className='group text-blue-500 p-0 hover:no-underline inline-flex items-center'
                                    onClick={() => router.push('/signup')}
                                >
                                    <span className='group-hover:text-blue-400 transition-colors'>
                                        Get started
                                    </span>
                                    <ChevronRightIcon className='ml-1 h-4 w-4 group-hover:text-blue-400 group-hover:translate-x-1 transition-all relative top-[1px]' />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className='bg-gray-800 border border-gray-700 hover:border-amber-500 transition-all duration-300 hover:-translate-y-2'>
                            <CardHeader>
                                <div className='w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4'>
                                    <ClipboardCheckIcon className='h-6 w-6 text-amber-500' />
                                </div>
                                <CardTitle className='text-white'>For Reviewers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-gray-300 mb-6'>
                                    Efficiently review proposals, provide feedback, and track
                                    changes requested from event organizers.
                                </p>
                                <Button
                                    variant='link'
                                    className='group text-amber-500 p-0 hover:no-underline inline-flex items-center'
                                    onClick={() => router.push('/login')}
                                >
                                    <span className='group-hover:text-amber-400 transition-colors'>
                                        Review access
                                    </span>
                                    <ChevronRightIcon className='ml-1 h-4 w-4 relative top-[1.5px] group-hover:text-amber-400 group-hover:translate-x-1 transition-all' />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className='bg-gray-800 border border-gray-700 hover:border-green-500 transition-all duration-300 hover:-translate-y-2'>
                            <CardHeader>
                                <div className='w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4'>
                                    <UsersIcon className='h-6 w-6 text-green-500' />
                                </div>
                                <CardTitle className='text-white'>For Admins</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-gray-300 mb-6'>
                                    Oversee all proposals, manage users, generate reports, and
                                    ensure smooth event coordination.
                                </p>
                                <Button
                                    variant='link'
                                    className='group text-green-500 p-0 hover:no-underline inline-flex items-center'
                                    onClick={() => router.push('/login')}
                                >
                                    <span className='group-hover:text-green-400 transition-colors duration-200'>
                                        Admin portal
                                    </span>
                                    <ChevronRightIcon className='ml-2 h-4 w-4 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-200 relative top-[1px]' />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* User Roles Tab Section */}
            <section className='py-20 bg-gray-800'>
                <div className='container mx-auto px-4'>
                    <div className='text-center mb-16'>
                        <h2 className='text-3xl font-bold mb-4'>Choose Your Role</h2>
                        <p className='text-gray-400 max-w-2xl mx-auto'>
                            Select your role to see tailored features and get started
                        </p>
                    </div>
                    <Tabs defaultValue='proposer' className='max-w-4xl mx-auto'>
                        <TabsList className='grid w-full grid-cols-3 bg-gray-700 h-14'>
                            <TabsTrigger
                                value='proposer'
                                className='text-white data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500 h-12'
                            >
                                <UserIcon className='w-4 h-4 mr-2' />
                                Proposer
                            </TabsTrigger>
                            <TabsTrigger
                                value='reviewer'
                                className='text-white data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 h-12'
                            >
                                <ClipboardCheckIcon className='w-4 h-4 mr-2' />
                                Reviewer
                            </TabsTrigger>
                            <TabsTrigger
                                value='admin'
                                className='text-white data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500 h-12'
                            >
                                <UsersIcon className='w-4 h-4 mr-2' />
                                Admin
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value='proposer' className='mt-8'>
                            <Card className='bg-gray-800 border border-gray-700'>
                                <CardContent className='p-8'>
                                    <div className='space-y-6'>
                                        <div className='flex items-start space-x-4'>
                                            <div className='flex-shrink-0'>
                                                <div className='w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center'>
                                                    <FileTextIcon className='h-5 w-5 text-green-500' />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className='text-white font-medium text-lg'>
                                                    Submit Proposals
                                                </h4>
                                                <p className='text-gray-400'>
                                                    Create and submit detailed event proposals for
                                                    review with our intuitive form interface.
                                                </p>
                                            </div>
                                        </div>
                                        <div className='flex items-start space-x-4'>
                                            <div className='flex-shrink-0'>
                                                <div className='w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center'>
                                                    <CalendarIcon className='h-5 w-5 text-green-500' />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className='text-white font-medium text-lg'>
                                                    Manage Events
                                                </h4>
                                                <p className='text-gray-400'>
                                                    Track event status in real-time, update details,
                                                    and view reviewer feedback.
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => router.push('/signup')}
                                            className='w-full bg-green-600 hover:bg-green-500 mt-6 h-12 text-lg'
                                        >
                                            Get Started as Proposer
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value='reviewer' className='mt-8'>
                            <Card className='bg-gray-800 border border-gray-700'>
                                <CardContent className='p-8'>
                                    <div className='space-y-6'>
                                        <div className='flex items-start space-x-4'>
                                            <div className='flex-shrink-0'>
                                                <div className='w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center'>
                                                    <ClipboardCheckIcon className='h-5 w-5 text-amber-500' />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className='text-white font-medium text-lg'>
                                                    Review Proposals
                                                </h4>
                                                <p className='text-gray-400'>
                                                    Evaluate event proposals with our scoring system
                                                    and provide constructive feedback.
                                                </p>
                                            </div>
                                        </div>
                                        <div className='flex items-start space-x-4'>
                                            <div className='flex-shrink-0'>
                                                <div className='w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center'>
                                                    <CheckCircleIcon className='h-5 w-5 text-amber-500' />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className='text-white font-medium text-lg'>
                                                    Approval Workflow
                                                </h4>
                                                <p className='text-gray-400'>
                                                    Approve, request changes, or reject proposals
                                                    with detailed comments and tracking.
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => router.push('/login')}
                                            className='w-full bg-amber-600 hover:bg-amber-500 mt-6 h-12 text-lg'
                                        >
                                            Access Reviewer Dashboard
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value='admin' className='mt-8'>
                            <Card className='bg-gray-800 border border-gray-700'>
                                <CardContent className='p-8'>
                                    <div className='space-y-6'>
                                        <div className='flex items-start space-x-4'>
                                            <div className='flex-shrink-0'>
                                                <div className='w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center'>
                                                    <UsersIcon className='h-5 w-5 text-blue-500' />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className='text-white font-medium text-lg'>
                                                    User Management
                                                </h4>
                                                <p className='text-gray-400'>
                                                    Add, edit, and manage all system users and their
                                                    roles with granular permissions.
                                                </p>
                                            </div>
                                        </div>
                                        <div className='flex items-start space-x-4'>
                                            <div className='flex-shrink-0'>
                                                <div className='w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center'>
                                                    <FileTextIcon className='h-5 w-5 text-blue-500' />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className='text-white font-medium text-lg'>
                                                    Oversight & Reporting
                                                </h4>
                                                <p className='text-gray-400'>
                                                    Access comprehensive dashboards, generate
                                                    reports, and configure system settings.
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => router.push('/login')}
                                            className='w-full bg-blue-600 hover:bg-blue-500 mt-6 h-12 text-lg'
                                        >
                                            Access Admin Portal
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* Footer */}
            <footer className='py-9 bg-gray-800 border-t border-gray-700'>
                <div className='container mx-auto px-4'>
                    <div className='flex flex-col md:flex-row justify-between items-center'>
                        <div className='flex items-center mb-6 md:mb-0'>
                            <div className='w-2 h-2 bg-green-500 rounded-full mr-3 self-center mt-1'></div>
                            <span className='text-xl font-semibold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent'>
                                Anokha 2025
                            </span>
                        </div>
                        <div className='text-gray-400 text-sm'>
                            &copy; {new Date().getFullYear()} Anokha 2025. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
