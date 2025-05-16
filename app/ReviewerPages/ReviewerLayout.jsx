'use client';

import { useState } from 'react';
import ReviewerDashboardContent from './reviewerdashboard';
import ReviewerProposalViewContent from './reviewerviewproposal';

export default function ReviewerLayout() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [filterStatus, setFilterStatus] = useState('pending');

    const handleNavigate = (view, status = null) => {
        setCurrentView(view);
        if (status) {
            setFilterStatus(status);
        } else if (view === 'view-proposals') {
            setFilterStatus('pending');
        } else if (view === 'reviewed-proposals') {
            setFilterStatus('all');
        }
    };

    const renderContent = () => {
        switch (currentView) {
            case 'view-proposals':
            case 'reviewed-proposals':
                return (
                    <ReviewerProposalViewContent
                        onBack={() => setCurrentView('dashboard')}
                        filterStatus={filterStatus}
                    />
                );
            case 'dashboard':
            default:
                return <ReviewerDashboardContent onNavigate={handleNavigate} />;
        }
    };

    return <div className='min-h-screen bg-gray-900'>{renderContent()}</div>;
}
