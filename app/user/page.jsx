'use client';

import { useState, useEffect } from 'react';
import { FileText, FilePlus, Menu, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardContent from '../proposalpages/dashboard';
import ViewProposalsContent from '../proposalpages/viewproposals';
import AddProposalContent from '../proposalpages/addproposal';
import ProposalTrackingContent from '../proposalpages/proposaltracking';
import EditProposalContent from '../proposalpages/editproposal';
import { auth, db } from '@/app/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function UserPage() {
    const [activeView, setActiveView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedProposalId, setSelectedProposalId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/login');
                return;
            }

            try {
                // Check Firestore for user role
                const userRef = doc(db, 'Auth', user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    router.push('/login');
                    return;
                }

                const userData = userSnap.data();
                const userRole = userData.role?.toLowerCase();

                // Only allow users with 'user' role (case-insensitive check)
                if (userRole !== 'user') {
                    router.push('/login');
                    return;
                }

                setIsAuthenticated(true);
            } catch (error) {
                console.error('Authentication error:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleEditProposal = (proposalId) => {
        setSelectedProposalId(proposalId);
        setActiveView('edit-proposal');
    };

    const handleTrackProposal = (proposalId) => {
        setSelectedProposalId(proposalId);
        setActiveView('track-proposal');
    };

    const handleLogout = () => {
        auth.signOut()
            .then(() => {
                router.push('/');
            })
            .catch((error) => {
                console.error('Logout error:', error);
            });
    };

    const handleNavigate = (view) => {
        setActiveView(view);
        if (isMobile) setSidebarOpen(false);
    };

    const renderContent = () => {
        switch (activeView) {
            case 'view-proposals':
                return (
                    <ViewProposalsContent
                        onEditProposal={handleEditProposal}
                        onTrackProposal={handleTrackProposal}
                    />
                );
            case 'add-proposal':
                return (
                    <div className='h-full max-h-full overflow-y-auto'>
                        <AddProposalContent />
                    </div>
                );
            case 'track-proposal':
                return (
                    <div className='h-full max-h-full overflow-y-auto'>
                        <ProposalTrackingContent
                            proposalId={selectedProposalId}
                            onBack={() => setActiveView('view-proposals')}
                        />
                    </div>
                );
            case 'edit-proposal':
                return (
                    <div className='h-full max-h-full overflow-y-auto'>
                        <EditProposalContent
                            proposalId={selectedProposalId}
                            onBack={() => setActiveView('view-proposals')}
                        />
                    </div>
                );
            default:
                return <DashboardContent onNavigate={handleNavigate} />;
        }
    };

    if (loading || !isAuthenticated) {
        return (
            <div className='flex justify-center items-center h-screen bg-gray-900'>
                <Loader2 className='h-12 w-12 animate-spin text-blue-400' />
            </div>
        );
    }

    return (
        <div className='flex h-screen w-screen bg-gray-900 overflow-hidden'>
            {/* Mobile Menu Button (only shows on mobile) */}
            {isMobile && !sidebarOpen && (
                <button
                    onClick={toggleSidebar}
                    className='fixed z-50 top-4 left-4 p-2 rounded-md bg-gray-800 text-white'
                    aria-label='Open menu'
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Sidebar */}
            <div
                className={`bg-gray-800 shadow-md transition-all duration-300 ${
                    sidebarOpen
                        ? isMobile
                            ? 'fixed z-40 w-64 h-[calc(100%-1rem)] top-2 left-2 rounded-lg'
                            : 'w-64'
                        : isMobile
                          ? 'hidden'
                          : 'w-20'
                } flex-shrink-0 h-full flex flex-col`}
            >
                {isMobile && (
                    <div className='absolute top-2 right-2 p-1'>
                        <button
                            onClick={toggleSidebar}
                            className='p-1 rounded-md text-white hover:bg-gray-600'
                            aria-label='Close menu'
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                <div className='p-4 flex items-center justify-between border-b border-gray-700'>
                    {sidebarOpen && (
                        <h2 className='text-lg font-semibold text-white'>User Dashboard</h2>
                    )}
                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className='p-1 rounded-md text-white hover:bg-gray-600'
                            aria-label='Toggle sidebar'
                        >
                            <Menu size={20} />
                        </button>
                    )}
                </div>

                <div className='flex-1 flex flex-col justify-between'>
                    <nav className='p-4 space-y-1'>
                        <button
                            onClick={() => {
                                setActiveView('view-proposals');
                                if (isMobile) setSidebarOpen(false);
                            }}
                            className={`flex items-center w-full p-2 rounded-md ${
                                activeView === 'view-proposals'
                                    ? 'bg-gray-600 text-white'
                                    : 'hover:bg-gray-600 text-gray-300'
                            } transition-colors`}
                        >
                            <FileText size={18} className='flex-shrink-0' />
                            {sidebarOpen && <span className='ml-3'>View Proposals</span>}
                        </button>

                        <button
                            onClick={() => {
                                setActiveView('add-proposal');
                                if (isMobile) setSidebarOpen(false);
                            }}
                            className={`flex items-center w-full p-2 rounded-md ${
                                activeView === 'add-proposal'
                                    ? 'bg-gray-600 text-white'
                                    : 'hover:bg-gray-600 text-gray-300'
                            } transition-colors`}
                        >
                            <FilePlus size={18} className='flex-shrink-0' />
                            {sidebarOpen && <span className='ml-3'>Add Proposal</span>}
                        </button>
                    </nav>

                    {/* Logout button at the bottom */}
                    <div className='p-4 border-t border-gray-700'>
                        <button
                            onClick={() => {
                                handleLogout();
                                if (isMobile) setSidebarOpen(false);
                            }}
                            className='flex items-center w-full p-2 rounded-md hover:bg-gray-600 text-red-500 transition-colors'
                        >
                            <LogOut size={18} className='flex-shrink-0 text-red-500' />
                            {sidebarOpen && <span className='ml-3'>Logout</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='flex-1 flex flex-col h-full overflow-hidden'>
                <div className='flex-1 p-6 h-full overflow-hidden'>{renderContent()}</div>
            </div>

            {/* Overlay for mobile (only shows when sidebar is open on mobile) */}
            {isMobile && sidebarOpen && (
                <div
                    className='fixed inset-0 bg-black bg-opacity-50 z-30'
                    onClick={toggleSidebar}
                />
            )}
        </div>
    );
}
