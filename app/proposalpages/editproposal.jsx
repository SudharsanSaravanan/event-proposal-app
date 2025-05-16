'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    getDocs,
    serverTimestamp,
    orderBy,
} from 'firebase/firestore';
import { AlertCircle } from 'lucide-react';
import { db } from '../firebase/config';
import { useRouter } from 'next/navigation';

export default function EditProposalContent({ proposalId, onBack }) {
    const router = useRouter();
    const [proposal, setProposal] = useState({
        title: '',
        description: '',
        objectives: '',
        outcomes: '',
        participantEngagement: '',
        duration: '',
        registrationFee: '',
        isIndividual: true,
        groupDetails: {
            maxGroupMembers: 4,
            feeType: 'perhead',
        },
        maxSeats: '',
        isEvent: false,
        isTechnical: true,
        preferredDays: {
            day1: '',
            day2: '',
            day3: '',
        },
        estimatedBudget: '',
        potentialFundingSource: '',
        resourcePersonDetails: '',
        externalResources: '',
        additionalRequirements: 'nil',
        targetAudience: '',
        proposerEmail: '',
        status: '',
        version: 1,
        proposerId: '',
        createdAt: null,
        updatedAt: null,
        comments: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Authentication check
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                setProposal((prev) => ({
                    ...prev,
                    proposerEmail: user.email || '',
                    proposerId: user.uid,
                }));
                setError(null);
            } else {
                setUserId(null);
                setError('You must be logged in to edit proposals');
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Fetch proposal data
    useEffect(() => {
        if (!userId || !proposalId) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                const proposalRef = doc(db, 'Proposals', proposalId);
                const proposalSnap = await getDoc(proposalRef);

                if (!proposalSnap.exists()) {
                    setError('Proposal not found');
                    setLoading(false);
                    return;
                }

                const proposalThread = proposalSnap.data();

                // Check authorization
                if (proposalThread.proposerId !== userId) {
                    setError('You are not authorized to edit this proposal');
                    setLoading(false);
                    return;
                }

                // Check if proposal status allows editing
                if (
                    proposalThread.status &&
                    proposalThread.status.toLowerCase() !== 'pending' &&
                    proposalThread.status.toLowerCase() !== 'reviewed'
                ) {
                    setError(
                        `This proposal cannot be edited because it's in ${proposalThread.status} status`
                    );
                    setIsAuthorized(false);
                    setLoading(false);
                    return;
                }

                setIsAuthorized(true);
                setProposal({
                    ...proposalThread,
                    id: proposalId,
                    additionalRequirements: proposalThread.additionalRequirements || 'nil',
                    targetAudience: proposalThread.targetAudience || '',
                    proposerEmail: proposalThread.proposerEmail || '',
                    groupDetails: proposalThread.isIndividual
                        ? undefined
                        : proposalThread.groupDetails || {
                              maxGroupMembers: 4,
                              feeType: 'perhead',
                          },
                    comments: proposalThread.comments || [], // Include comments from fetched data
                });

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load proposal data. Please try again.');
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, proposalId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setProposal((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value,
                },
            }));
        } else {
            setProposal((prev) => ({
                ...prev,
                [name]:
                    type === 'checkbox'
                        ? checked
                        : value === ''
                          ? value
                          : type === 'number'
                            ? Number(value)
                            : value,
            }));
        }
    };

    const handleIndividualToggle = (isIndividual) => {
        if (!isIndividual && proposal.groupDetails === undefined) {
            setProposal((prev) => ({
                ...prev,
                isIndividual,
                groupDetails: {
                    maxGroupMembers: 4,
                    feeType: 'perhead',
                },
            }));
        } else {
            setProposal((prev) => ({
                ...prev,
                isIndividual,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthorized) {
            setError('You are not authorized to update this proposal');
            return;
        }

        // Validate group details if in group mode
        if (
            !proposal.isIndividual &&
            (!proposal.groupDetails?.maxGroupMembers || !proposal.groupDetails?.feeType)
        ) {
            setError('Please complete all group details');
            return;
        }

        try {
            setLoading(true);
            const proposalRef = doc(db, 'Proposals', proposalId);

            // Get current proposal data before making changes
            const currentProposalSnap = await getDoc(proposalRef);
            const currentproposalThread = currentProposalSnap.data();

            // Check if this is the first edit (version 1 with no history)
            const historyQuery = query(
                collection(db, 'Proposals', proposalId, 'History'),
                orderBy('version', 'desc')
            );
            const historySnapshot = await getDocs(historyQuery);
            const isFirstEdit =
                currentproposalThread.version === 1 &&
                historySnapshot.empty &&
                (currentproposalThread.status === 'reviewed' ||
                    currentproposalThread.status === 'Reviewed');

            // Determine if we're creating a new version (only when status is "reviewed")
            const isCreatingNewVersion = currentproposalThread.status?.toLowerCase() === 'reviewed';

            let newVersion = currentproposalThread.version || 1;

            // If first edit or creating new version, archive current version
            if (isFirstEdit || isCreatingNewVersion) {
                if (isCreatingNewVersion) {
                    newVersion = currentproposalThread.version + 1;
                }

                // Archive the current version to history before updating
                const historyData = {
                    proposalThread: {
                        ...currentproposalThread,
                        additionalRequirements:
                            currentproposalThread.additionalRequirements || 'nil',
                        targetAudience: currentproposalThread.targetAudience || '',
                        // Include comments in history
                        comments: currentproposalThread.comments || [],
                    },
                    updatedAt: serverTimestamp(),
                    version: currentproposalThread.version,
                    remarks: isFirstEdit
                        ? 'Initial version archived'
                        : `Version ${currentproposalThread.version} archived when creating version ${newVersion}`,
                    archivedBy: userId,
                };

                const historyCollectionRef = collection(db, 'Proposals', proposalId, 'History');
                await addDoc(historyCollectionRef, historyData);
            }

            // Prepare updated proposal data - always set status to pending after edit
            const updatedProposal = {
                ...proposal,
                status: 'pending',
                version: newVersion,
                updatedAt: serverTimestamp(),
                createdAt: currentproposalThread.createdAt || serverTimestamp(),
                additionalRequirements: proposal.additionalRequirements || 'nil',
                targetAudience: proposal.targetAudience || '',
                proposerEmail: proposal.proposerEmail || '',
                // Clear comments array for new version
                comments: [],
            };

            // Remove groupDetails if switching to individual
            if (proposal.isIndividual) {
                updatedProposal.groupDetails = null; // Set to null to remove from Firestore
            }

            // Remove the id field before saving
            const { id, ...proposalWithoutId } = updatedProposal;

            // Update the proposal document
            await updateDoc(proposalRef, proposalWithoutId);

            setSuccess(
                isCreatingNewVersion
                    ? `Proposal updated successfully! v${newVersion}`
                    : `Proposal updated successfully!`
            );

            // Update local state
            setProposal((prev) => ({
                ...prev,
                ...updatedProposal,
            }));

            // Redirect back after delay
            setTimeout(() => {
                if (onBack) onBack();
            }, 2000);
        } catch (err) {
            console.error('Error updating proposal:', err);
            setError('Failed to update proposal: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center h-full'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400'></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex flex-col justify-center items-center h-full p-6'>
                <div className='bg-red-900/50 text-red-200 p-6 rounded-lg flex items-start gap-4 max-w-2xl'>
                    <AlertCircle className='h-6 w-6 flex-shrink-0 mt-0.5' />
                    <div>
                        <h3 className='font-semibold text-white mb-2'>Error</h3>
                        <p>{error}</p>
                        <button
                            onClick={onBack}
                            className='mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition'
                        >
                            Return to Proposals
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className='flex flex-col justify-center items-center h-full p-6'>
                <div className='bg-yellow-900/50 text-yellow-200 p-6 rounded-lg flex items-start gap-4 max-w-2xl'>
                    <AlertCircle className='h-6 w-6 flex-shrink-0 mt-0.5' />
                    <div>
                        <h3 className='font-semibold text-white mb-2'>Not Authorized</h3>
                        <p>
                            You cannot edit this proposal because it's not in pending status or you
                            are not the owner.
                        </p>
                        <button
                            onClick={onBack}
                            className='mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition'
                        >
                            Return to Proposals
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className='pb-10 pr-6'>
            <div className='flex justify-between items-center mb-6'>
                <br></br>
                <h1 className='text-2xl font-bold text-white'>Edit Proposal</h1>
                <div className='flex items-center gap-4 pr-5'>
                    <span
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${getStatusColor(proposal.status)} text-white rounded-full`}
                    >
                        {proposal.status || 'Pending'}
                    </span>
                    <span className='px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-700 text-white rounded-full'>
                        v{proposal.version || 1}
                    </span>
                </div>
            </div>

            {success && (
                <div className='mb-6 bg-green-900/50 border border-green-800 p-4 rounded-md text-green-200'>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-6 text-white'>
                {/* Basic Information Section */}
                <div className='p-6 bg-gray-800 rounded-lg shadow-md'>
                    <h2 className='text-xl font-semibold mb-4 text-blue-400'>Basic Information</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Title *</label>
                            <input
                                type='text'
                                name='title'
                                value={proposal.title || ''}
                                onChange={handleChange}
                                className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                                required
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium mb-1'>Duration *</label>
                            <input
                                type='text'
                                name='duration'
                                value={proposal.duration || ''}
                                onChange={handleChange}
                                placeholder='e.g. 3 hours'
                                className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                                required
                            />
                        </div>
                    </div>

                    <div className='mt-4'>
                        <label className='block text-sm font-medium mb-1'>Description *</label>
                        <textarea
                            name='description'
                            value={proposal.description || ''}
                            onChange={handleChange}
                            rows='3'
                            className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                            required
                        ></textarea>
                    </div>

                    <div className='mt-4'>
                        <label className='block text-sm font-medium mb-1'>Target Audience *</label>
                        <input
                            type='text'
                            name='targetAudience'
                            value={proposal.targetAudience || ''}
                            onChange={handleChange}
                            placeholder='Describe the target audience'
                            className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                            required
                        />
                    </div>
                </div>

                {/* Resource Person Details Section */}
                <div className='p-6 bg-gray-800 rounded-lg shadow-md'>
                    <h2 className='text-xl font-semibold mb-4 text-blue-400'>
                        Resource Person Information
                    </h2>

                    <div className='grid grid-cols-1 gap-6'>
                        <div>
                            <label className='block text-sm font-medium mb-1'>
                                Resource Person Details *
                            </label>
                            <input
                                type='text'
                                name='resourcePersonDetails'
                                value={proposal.resourcePersonDetails || ''}
                                onChange={handleChange}
                                placeholder='Name, Organization, Email'
                                className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                                required
                            />
                            <p className='text-xs text-gray-400 mt-1'>
                                Example: John Doe, Google, john.doe@google.com
                            </p>
                        </div>

                        <div>
                            <label className='block text-sm font-medium mb-1'>
                                External Resources Required *
                            </label>
                            <input
                                type='text'
                                name='externalResources'
                                value={proposal.externalResources || ''}
                                onChange={handleChange}
                                placeholder='Projector, Specific software, etc.'
                                className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                                required
                            />
                            <p className='text-xs text-gray-400 mt-1'>
                                List any equipment, software, or resources needed
                            </p>
                        </div>
                    </div>
                </div>

                {/* Objectives and Outcomes Section */}
                <div className='p-6 bg-gray-800 rounded-lg shadow-md'>
                    <h2 className='text-xl font-semibold mb-4 text-blue-400'>
                        Objectives and Outcomes
                    </h2>

                    <div className='mb-4'>
                        <label className='block text-sm font-medium mb-1'>Objectives *</label>
                        <textarea
                            name='objectives'
                            value={proposal.objectives || ''}
                            onChange={handleChange}
                            rows='3'
                            className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                            placeholder='Enter the objectives of your proposal'
                            required
                        ></textarea>
                        <p className='text-xs text-gray-400 mt-1'>
                            Separate multiple objectives with commas or line breaks
                        </p>
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-1'>
                            Expected Outcomes *
                        </label>
                        <textarea
                            name='outcomes'
                            value={proposal.outcomes || ''}
                            onChange={handleChange}
                            rows='3'
                            className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                            placeholder='Enter the expected outcomes of your proposal'
                            required
                        ></textarea>
                        <p className='text-xs text-gray-400 mt-1'>
                            Separate multiple outcomes with commas or line breaks
                        </p>
                    </div>

                    <div className='mt-4'>
                        <label className='block text-sm font-medium mb-1'>
                            Participant Engagement Plan *
                        </label>
                        <textarea
                            name='participantEngagement'
                            value={proposal.participantEngagement || ''}
                            onChange={handleChange}
                            rows='2'
                            className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                            placeholder='Group activities, Q&A sessions, etc.'
                            required
                        ></textarea>
                    </div>
                </div>

                {/* Registration and Participation Section */}
                <div className='p-6 bg-gray-800 rounded-lg shadow-md'>
                    <h2 className='text-xl font-semibold mb-4 text-blue-400'>
                        Registration and Participation
                    </h2>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='block text-sm font-medium mb-1'>
                                Registration Fee (₹) *
                            </label>
                            <input
                                type='number'
                                name='registrationFee'
                                value={proposal.registrationFee || ''}
                                onChange={handleChange}
                                min='0'
                                className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                                required
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium mb-1'>
                                Maximum Seats *
                            </label>
                            <input
                                type='number'
                                name='maxSeats'
                                value={proposal.maxSeats || ''}
                                onChange={handleChange}
                                min='1'
                                className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                                required
                            />
                        </div>
                    </div>

                    <div className='mt-4'>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                            <div className='flex-1'>
                                <label className='inline-flex items-center w-full'>
                                    <input
                                        type='radio'
                                        checked={proposal.isIndividual === true}
                                        onChange={() => handleIndividualToggle(true)}
                                        className='form-radio'
                                    />
                                    <span className='ml-2'>Individual Registration</span>
                                </label>
                            </div>
                            <div className='flex-1'>
                                <label className='inline-flex items-center w-full'>
                                    <input
                                        type='radio'
                                        checked={proposal.isIndividual === false}
                                        onChange={() => handleIndividualToggle(false)}
                                        className='form-radio'
                                    />
                                    <span className='ml-2'>Group Registration</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {!proposal.isIndividual && (
                        <div className='mt-4 bg-gray-700 p-4 rounded-md'>
                            <h3 className='text-md font-semibold mb-3'>Group Details</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium mb-1'>
                                        Max Group Members *
                                    </label>
                                    <input
                                        type='number'
                                        name='groupDetails.maxGroupMembers'
                                        value={proposal.groupDetails?.maxGroupMembers || 4}
                                        onChange={handleChange}
                                        min='2'
                                        max='10'
                                        className='w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white'
                                        required={!proposal.isIndividual}
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium mb-1'>
                                        Fee Type *
                                    </label>
                                    <select
                                        name='groupDetails.feeType'
                                        value={proposal.groupDetails?.feeType || 'perhead'}
                                        onChange={handleChange}
                                        className='w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white'
                                        required={!proposal.isIndividual}
                                    >
                                        <option value='perhead'>Per Head</option>
                                        <option value='pergroup'>Per Group</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Type of Event Section */}
                <div className='p-6 bg-gray-800 rounded-lg shadow-md'>
                    <h2 className='text-xl font-semibold mb-4 text-blue-400'>Type of Event</h2>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='block text-sm font-medium mb-2'>Event Type *</label>
                            <div className='flex items-center space-x-4'>
                                <label className='inline-flex items-center'>
                                    <input
                                        type='radio'
                                        name='isEvent'
                                        checked={proposal.isEvent === true}
                                        onChange={() =>
                                            setProposal((prev) => ({ ...prev, isEvent: true }))
                                        }
                                        className='form-radio'
                                    />
                                    <span className='ml-2'>Event</span>
                                </label>
                                <label className='inline-flex items-center'>
                                    <input
                                        type='radio'
                                        name='isEvent'
                                        checked={proposal.isEvent === false}
                                        onChange={() =>
                                            setProposal((prev) => ({ ...prev, isEvent: false }))
                                        }
                                        className='form-radio'
                                    />
                                    <span className='ml-2'>Workshop</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium mb-2'>
                                Technical Category *
                            </label>
                            <div className='flex items-center space-x-4'>
                                <label className='inline-flex items-center'>
                                    <input
                                        type='radio'
                                        name='isTechnical'
                                        checked={proposal.isTechnical === true}
                                        onChange={() =>
                                            setProposal((prev) => ({ ...prev, isTechnical: true }))
                                        }
                                        className='form-radio'
                                    />
                                    <span className='ml-2'>Technical</span>
                                </label>
                                <label className='inline-flex items-center'>
                                    <input
                                        type='radio'
                                        name='isTechnical'
                                        checked={proposal.isTechnical === false}
                                        onChange={() =>
                                            setProposal((prev) => ({ ...prev, isTechnical: false }))
                                        }
                                        className='form-radio'
                                    />
                                    <span className='ml-2'>Non-Technical</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scheduling Section */}
                <div className='p-6 bg-gray-800 rounded-lg shadow-md'>
                    <h2 className='text-xl font-semibold mb-4 text-blue-400'>Preferred Schedule</h2>
                    <p className='text-sm text-gray-400 mb-4'>
                        Please provide your preferred time slots for each day of the event
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div>
                            <label className='block text-sm font-medium mb-1'>Day 1</label>
                            <input
                                type='text'
                                name='preferredDays.day1'
                                value={proposal.preferredDays?.day1 || ''}
                                onChange={handleChange}
                                placeholder='e.g. 10:00 AM - 1:00 PM'
                                className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium mb-1'>Day 2</label>
                            <input
                                type='text'
                                name='preferredDays.day2'
                                value={proposal.preferredDays?.day2 || ''}
                                onChange={handleChange}
                                placeholder='e.g. 2:00 PM - 5:00 PM'
                                className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium mb-1'>Day 3</label>
                            <input
                                type='text'
                                name='preferredDays.day3'
                                value={proposal.preferredDays?.day3 || ''}
                                onChange={handleChange}
                                placeholder='e.g. 11:00 AM - 2:00 PM'
                                className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                            />
                        </div>
                    </div>
                    <p className='text-sm text-gray-400 mt-2'>
                        At least one preferred time slot is required
                    </p>
                </div>

                {/* Budget Section */}
                <div className='p-6 bg-gray-800 rounded-lg shadow-md'>
                    <h2 className='text-xl font-semibold mb-4 text-blue-400'>Budget and Funding</h2>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='block text-sm font-medium mb-1'>
                                Estimated Budget (₹) *
                            </label>
                            <input
                                type='number'
                                name='estimatedBudget'
                                value={proposal.estimatedBudget || ''}
                                onChange={handleChange}
                                min='0'
                                className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                                required
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium mb-1'>
                                Potential Funding Source *
                            </label>
                            <input
                                type='text'
                                name='potentialFundingSource'
                                value={proposal.potentialFundingSource || ''}
                                onChange={handleChange}
                                placeholder='e.g. Tech Sponsors, Department'
                                className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                                required
                            />
                        </div>
                    </div>

                    <div className='mt-4'>
                        <label className='block text-sm font-medium mb-1'>
                            Additional Requirements
                        </label>
                        <textarea
                            name='additionalRequirements'
                            value={proposal.additionalRequirements || 'nil'}
                            onChange={handleChange}
                            rows='3'
                            placeholder='Enter any additional requirements'
                            className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white'
                        ></textarea>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex justify-end space-x-4 pr-5'>
                    <button
                        type='button'
                        className='px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-md font-medium transition-colors'
                        onClick={onBack}
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        className='px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors'
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Proposal'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function getStatusColor(status) {
    if (!status) return 'bg-yellow-600';
    switch (status.toLowerCase()) {
        case 'approved':
            return 'bg-green-600';
        case 'rejected':
            return 'bg-red-600';
        case 'pending':
            return 'bg-yellow-600';
        case 'reviewed':
            return 'bg-blue-600';
        default:
            return 'bg-gray-600';
    }
}
