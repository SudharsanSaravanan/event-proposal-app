'use client';

import { useState, useEffect } from 'react';
import { auth, db, getReviewerProposals } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ClipboardList, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReviewerDashboardContent({ onNavigate }) {
    const [loading, setLoading] = useState(true);
    const [reviewer, setReviewer] = useState(null);
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        departments: [],
    });
    const [refreshing, setRefreshing] = useState(false);
    const [navigating, setNavigating] = useState(false);
    const router = useRouter();

    const loadReviewerData = async (user) => {
        try {
            setLoading(true);

            // First check if we already have reviewer data in session storage
            const authStr = sessionStorage.getItem('auth');
            const role = sessionStorage.getItem('role');

            // If we have auth data in session storage and proper role, use it
            if (authStr && role && role === 'Reviewer') {
                try {
                    const authData = JSON.parse(authStr);

                    if (authData.authenticated && authData.departments) {
                        setReviewer({
                            uid: user.uid,
                            email: user.email,
                            displayName: authData.name || user.displayName || 'Reviewer',
                            departments: authData.departments || [],
                        });

                        // Load proposals statistics using the departments from session
                        await loadProposalsStatistics(authData.departments);
                        setError(null);
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing auth data from session storage:', e);
                }
            }

            // If no valid session data, fall back to Firestore
            const userRef = doc(db, 'Auth', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                setError('User document not found in database.');
                return;
            }

            const userData = userSnap.data();

            // Check if user is a reviewer (case-insensitive)
            if (!userData.role || userData.role.toLowerCase() !== 'reviewer') {
                setError('You do not have reviewer privileges. Please contact administrator.');
                return;
            }

            // Process departments (handle different formats)
            let departments = [];
            if (userData.department) {
                if (Array.isArray(userData.department)) {
                    departments = userData.department;
                } else if (typeof userData.department === 'object') {
                    departments = Object.values(userData.department);
                } else if (typeof userData.department === 'string') {
                    departments = [userData.department];
                }
            }

            // Store standardized data in session storage
            const authData = {
                authenticated: true,
                name: userData.name || 'Reviewer',
                role: 'Reviewer', // Standardized to capital R
                departments: departments,
            };

            sessionStorage.setItem('auth', JSON.stringify(authData));
            sessionStorage.setItem('user', 'true');
            sessionStorage.setItem('role', 'Reviewer');
            sessionStorage.setItem('name', userData.name || '');
            sessionStorage.setItem('departments', JSON.stringify(departments));

            setReviewer({
                uid: user.uid,
                email: user.email,
                displayName: userData.name || user.displayName || 'Reviewer',
                departments: departments,
                ...userData,
            });

            // Load proposals statistics
            await loadProposalsStatistics(departments);
            setError(null);
        } catch (err) {
            console.error('Error setting up reviewer:', err);
            setError('An error occurred while loading reviewer information.');
        } finally {
            setLoading(false);
        }
    };

    const loadProposalsStatistics = async (departments) => {
        try {
            setRefreshing(true);

            if (!departments || departments.length === 0) {
                console.warn('No departments assigned to reviewer');
                setStatistics((prev) => ({
                    ...prev,
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                    departments,
                }));
                return;
            }

            const proposals = await getReviewerProposals(departments);

            setStatistics({
                pending: proposals.filter((p) => p.status?.toLowerCase() === 'pending' || !p.status)
                    .length,
                approved: proposals.filter((p) => p.status?.toLowerCase() === 'approved').length,
                rejected: proposals.filter((p) => p.status?.toLowerCase() === 'rejected').length,
                departments,
            });
        } catch (error) {
            console.error('Error loading proposals:', error);
            setError('Failed to load proposal statistics. Please try again.');
        } finally {
            setRefreshing(false);
        }
    };

    const handleNavigation = (route) => {
        setNavigating(true);
        setTimeout(() => {
            onNavigate && onNavigate(route);
        }, 0);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await loadReviewerData(user);
            } else {
                setReviewer(null);
                setError('Please log in to access the reviewer dashboard.');
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (navigating) {
        return (
            <div className='h-screen flex items-center justify-center bg-gray-900'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400'></div>
            </div>
        );
    }

    return (
        <div className='h-screen overflow-y-auto bg-gray-900'>
            <div className='max-w-4xl mx-auto p-6'>
                <h1 className='text-3xl font-bold mb-6 text-white text-center'>
                    Proposal Review Dashboard
                </h1>

                {loading ? (
                    <div className='flex justify-center items-center h-40'>
                        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400'></div>
                    </div>
                ) : error ? (
                    <div className='bg-red-900/50 text-red-200 p-6 rounded-lg mb-8'>
                        <h2 className='text-xl font-semibold mb-2'>Error</h2>
                        <p>{error}</p>
                        {!reviewer && (
                            <button
                                className='mt-4 bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-md'
                                onClick={() => router.push('/login')}
                            >
                                Go to Login
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Welcome Message */}
                        <div className='bg-gray-800 p-6 rounded-lg shadow-lg mb-8'>
                            <div className='flex justify-between items-start'>
                                <div>
                                    <h2 className='text-xl font-semibold text-white mb-2'>
                                        Welcome, {reviewer?.displayName || 'Reviewer'}!
                                    </h2>
                                    <p className='text-gray-300 mb-4'>
                                        You can review proposals for the following departments:
                                    </p>

                                    <div className='flex flex-wrap gap-2 mt-2'>
                                        {statistics.departments?.map((dept, index) => (
                                            <span
                                                key={index}
                                                className='bg-blue-900/60 text-blue-200 px-3 py-1 rounded-full text-sm'
                                            >
                                                {dept}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                            <div
                                className='bg-blue-900/30 p-6 rounded-lg border border-blue-700 relative cursor-pointer hover:bg-blue-800 transition-all duration-300'
                                onClick={() => handleNavigation('view-proposals')}
                            >
                                <div className='flex justify-between items-start'>
                                    <h3 className='text-blue-300 text-lg font-medium mb-2'>
                                        Review Pending Proposals
                                    </h3>
                                    <div className='bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center'>
                                        <ClipboardList size={18} className='text-white' />
                                    </div>
                                </div>
                                <p className='text-gray-300 text-sm'>
                                    {statistics.pending} proposals awaiting your review
                                </p>
                                <p className='text-blue-400 text-sm mt-4'>Click here to view →</p>
                            </div>

                            <div
                                className='bg-purple-900/30 p-6 rounded-lg border border-purple-700 relative cursor-pointer hover:bg-purple-800 transition-all duration-300'
                                onClick={() => handleNavigation('reviewed-proposals')}
                            >
                                <div className='flex justify-between items-start'>
                                    <h3 className='text-purple-300 text-lg font-medium mb-2'>
                                        View Reviewed Proposals
                                    </h3>
                                    <div className='bg-purple-700 rounded-full w-8 h-8 flex items-center justify-center'>
                                        <FileText size={18} className='text-white' />
                                    </div>
                                </div>
                                <p className='text-gray-300 text-sm'>
                                    {statistics.approved + statistics.rejected} proposals reviewed
                                </p>
                                <p className='text-purple-400 text-sm mt-4'>Click here to view →</p>
                            </div>
                        </div>

                        {/* Stats Overview */}
                        <div className='bg-gray-800 p-6 rounded-lg shadow-lg mb-8'>
                            <div className='flex justify-between items-center mb-4'>
                                <h2 className='text-xl font-semibold text-white'>
                                    Review Status Overview
                                </h2>
                                <span className='text-sm text-gray-400'>
                                    Last updated: {new Date().toLocaleTimeString()}
                                </span>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                <div className='bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition'>
                                    <div className='flex items-center mb-2'>
                                        <Clock size={20} className='text-yellow-400 mr-2' />
                                        <h3 className='text-gray-200 font-medium'>
                                            Pending Review
                                        </h3>
                                    </div>
                                    <p className='text-2xl font-bold text-yellow-400'>
                                        {statistics.pending}
                                    </p>
                                    <p className='text-xs text-gray-400 mt-1'>
                                        Across {statistics.departments.length} department(s)
                                    </p>
                                </div>

                                <div className='bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition'>
                                    <div className='flex items-center mb-2'>
                                        <CheckCircle size={20} className='text-green-400 mr-2' />
                                        <h3 className='text-gray-200 font-medium'>Approved</h3>
                                    </div>
                                    <p className='text-2xl font-bold text-green-400'>
                                        {statistics.approved}
                                    </p>
                                    <p className='text-xs text-gray-400 mt-1'>
                                        {statistics.approved === 0
                                            ? 'No approvals yet'
                                            : 'Your approved proposals'}
                                    </p>
                                </div>

                                <div className='bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition'>
                                    <div className='flex items-center mb-2'>
                                        <XCircle size={20} className='text-red-400 mr-2' />
                                        <h3 className='text-gray-200 font-medium'>Rejected</h3>
                                    </div>
                                    <p className='text-2xl font-bold text-red-400'>
                                        {statistics.rejected}
                                    </p>
                                    <p className='text-xs text-gray-400 mt-1'>
                                        {statistics.rejected === 0
                                            ? 'No rejections yet'
                                            : 'Proposals not approved'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Review Guidelines */}
                        <div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
                            <h2 className='text-xl font-semibold text-white mb-4'>
                                Review Guidelines
                            </h2>
                            <ul className='text-gray-300 space-y-3'>
                                <li className='flex items-start'>
                                    <span className='text-blue-400 mr-2'>•</span>
                                    Carefully evaluate objectives and expected outcomes
                                </li>
                                <li className='flex items-start'>
                                    <span className='text-blue-400 mr-2'>•</span>
                                    Check resource requirements for feasibility
                                </li>
                                <li className='flex items-start'>
                                    <span className='text-blue-400 mr-2'>•</span>
                                    Verify alignment with department priorities
                                </li>
                                <li className='flex items-start'>
                                    <span className='text-blue-400 mr-2'>•</span>
                                    Provide constructive feedback for rejected or revision requests
                                </li>
                                <li className='flex items-start'>
                                    <span className='text-blue-400 mr-2'>•</span>
                                    Review budget details and funding requirements
                                </li>
                            </ul>
                        </div>
                    </>
                )}
                <div className='h-16'></div>
            </div>
        </div>
    );
}
