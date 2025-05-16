'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, deleteDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut, getAuth } from 'firebase/auth';
import { auth, db } from '@/app/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    UserIcon,
    ClipboardCheckIcon,
    UsersIcon,
    ChevronRightIcon,
    Trash2Icon,
    LogOutIcon,
    XIcon,
    Loader2,
} from 'lucide-react';
import { Combobox } from '@/components/ui/combo-box';
import { Input } from '@/components/ui/input';

const departments = [
    { value: 'CSE', label: 'CSE' },
    { value: 'ECE', label: 'ECE' },
    { value: 'EEE', label: 'EEE' },
    { value: 'MECH', label: 'MECH' },
    { value: 'CIVIL', label: 'CIVIL' },
];

const AdminPanel = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('signup');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication when the component mounts
    useEffect(() => {
        const checkAuth = async () => {
            const unsubscribe = auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        // Check if user is an admin
                        const userRef = doc(db, 'Auth', user.uid);
                        const userSnap = await getDoc(userRef);

                        if (!userSnap.exists()) {
                            router.push('/login');
                            return;
                        }

                        const userData = userSnap.data();
                        if (userData.role?.toLowerCase() !== 'admin') {
                            // Not an admin, redirect to login
                            router.push('/login');
                            return;
                        }

                        setIsAuthenticated(true);
                        setLoading(false);
                    } catch (error) {
                        console.error('Error checking admin status:', error);
                        router.push('/login');
                    }
                } else {
                    // No user is logged in, redirect to login
                    router.push('/login');
                }
            });

            return () => unsubscribe();
        };

        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // If still loading or not authenticated, show loading screen
    if (loading || !isAuthenticated) {
        return (
            <div className='flex justify-center items-center h-screen bg-gray-900'>
                <Loader2 className='h-12 w-12 animate-spin text-blue-400' />
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-900 text-white p-4 md:p-6'>
            <div className='max-w-6xl mx-auto'>
                {/* Header with Logout */}
                <div className='flex justify-between items-center mb-6'>
                    <h1 className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent'>
                        Admin Panel
                    </h1>
                    <Button
                        onClick={() => setShowLogoutConfirm(true)}
                        variant='outline'
                        className='bg-transparent text-white border border-gray-600 hover:bg-white hover:text-gray-900 hover:border-gray-400'
                    >
                        <LogOutIcon className='h-4 w-4 mr-2' />
                        Logout
                    </Button>
                </div>

                {/* Tab Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className='mb-6'>
                    <TabsList className='grid w-full grid-cols-2 bg-gray-800 h-12'>
                        <TabsTrigger
                            value='signup'
                            className='text-white data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500'
                        >
                            <UserIcon className='h-4 w-4 mr-2' />
                            Create User
                        </TabsTrigger>
                        <TabsTrigger
                            value='view'
                            className='text-white data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500'
                        >
                            <UsersIcon className='h-4 w-4 mr-2' />
                            View Users
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Main Content */}
                <Card className='bg-gray-800 border border-gray-700'>
                    <CardContent className='p-0'>
                        {activeTab === 'signup' ? (
                            <SignUpForm setUsers={setUsers} />
                        ) : (
                            <ViewUsers
                                users={users}
                                setUsers={setUsers}
                                loading={loading}
                                setLoading={setLoading}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Logout Confirmation Dialog */}
            {showLogoutConfirm && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
                    <Card className='bg-gray-800 border border-gray-700 max-w-md w-full'>
                        <CardHeader>
                            <CardTitle className='text-white'>Confirm Logout</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='text-gray-400 mb-6'>Are you sure you want to logout?</p>
                            <div className='flex justify-end space-x-3'>
                                <Button
                                    variant='outline'
                                    className='border border-gray-600 hover:bg-gray-700'
                                    onClick={() => setShowLogoutConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className='bg-red-600 hover:bg-red-500'
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

const SignUpForm = ({ setUsers }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('User');
    const [department, setDepartment] = useState(''); // For single department selection
    const [selectedDepartments, setSelectedDepartments] = useState([]); // For multiple department selection
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let newPassword = '';
        for (let i = 0; i < 10; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setGeneratedPassword(newPassword);
        setPassword(newPassword);
        setConfirmPassword(newPassword);
    };

    const handleSignUp = async () => {
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (
            !name ||
            !email ||
            !role ||
            (role === 'User' && !department) ||
            (role === 'Reviewer' && selectedDepartments.length === 0)
        ) {
            setError('All fields are required!');
            setIsSubmitting(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            setIsSubmitting(false);
            return;
        }

        try {
            // Use our server API to create the user instead of direct Firebase Authentication
            const departmentData = role === 'Reviewer' ? selectedDepartments : department;
            const dbRole = role === 'User' ? 'user' : 'reviewer';

            const response = await fetch('/api/createUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    role: dbRole,
                    department: departmentData,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create user');
            }

            const result = await response.json();

            // Use display-friendly names in UI updates
            const displayRole = role === 'User' ? 'Proposer' : 'Reviewer';

            // Update the users state
            setUsers((prevUsers) => [
                ...prevUsers,
                {
                    id: result.uid,
                    name,
                    email,
                    department: departmentData,
                    role: dbRole,
                    displayRole,
                    initialPassword: password,
                },
            ]);

            // Reset form
            setName('');
            setEmail('');
            setDepartment('');
            setSelectedDepartments([]);
            setPassword('');
            setConfirmPassword('');
            setGeneratedPassword('');

            setSuccess('User created successfully!');
        } catch (e) {
            setError(e.message);
            console.error('Signup Error:', e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDepartmentSelect = (value) => {
        if (role === 'Reviewer') {
            if (!selectedDepartments.includes(value)) {
                setSelectedDepartments([...selectedDepartments, value]);
            }
        } else {
            setDepartment(value);
        }
    };

    const removeDepartment = (dept) => {
        setSelectedDepartments(selectedDepartments.filter((d) => d !== dept));
    };

    // Filter out already selected departments for the combobox
    const availableDepartments = departments.filter(
        (dept) => !selectedDepartments.includes(dept.value)
    );

    return (
        <div className='p-6'>
            <CardHeader>
                <CardTitle className='text-white'>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className='bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4'>
                        {error}
                    </div>
                )}
                {success && (
                    <div className='bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4'>
                        {success}
                    </div>
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-4'>
                        <div>
                            <label className='block text-sm font-medium mb-1 text-gray-300'>
                                Full Name
                            </label>
                            <Input
                                type='text'
                                className='w-full bg-gray-700 border-gray-600 text-white'
                                placeholder='Enter full name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium mb-1 text-gray-300'>
                                Email
                            </label>
                            <Input
                                type='email'
                                className='w-full bg-gray-700 border-gray-600 text-white'
                                placeholder='Enter email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-300'>
                                Role
                            </label>
                            <div className='flex space-x-4'>
                                <label className='flex items-center space-x-2'>
                                    <input
                                        type='radio'
                                        name='role'
                                        value='User'
                                        checked={role === 'User'}
                                        onChange={() => setRole('User')}
                                        className='h-4 w-4 text-green-500 focus:ring-green-500 bg-gray-700 border-gray-600'
                                    />
                                    <span className='text-gray-300'>Proposer</span>
                                </label>
                                <label className='flex items-center space-x-2'>
                                    <input
                                        type='radio'
                                        name='role'
                                        value='Reviewer'
                                        checked={role === 'Reviewer'}
                                        onChange={() => setRole('Reviewer')}
                                        className='h-4 w-4 text-green-500 focus:ring-green-500 bg-gray-700 border-gray-600'
                                    />
                                    <span className='text-gray-300'>Reviewer</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <div>
                            <label className='block text-sm font-medium mb-2 text-gray-300'>
                                {role === 'Reviewer' ? 'Departments' : 'Department'}
                            </label>
                            {role === 'Reviewer' ? (
                                <div className='space-y-3'>
                                    {/* Display selected departments with remove buttons */}
                                    {selectedDepartments.length > 0 && (
                                        <div className='flex flex-wrap gap-2 mb-3'>
                                            {selectedDepartments.map((dept) => (
                                                <div
                                                    key={dept}
                                                    className='flex items-center bg-green-500/20 text-green-500 rounded-full px-3 py-1'
                                                >
                                                    <span className='mr-1'>{dept}</span>
                                                    <button
                                                        onClick={() => removeDepartment(dept)}
                                                        className='text-green-400 hover:text-white'
                                                    >
                                                        <XIcon className='h-3 w-3' />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Combobox for selecting departments */}
                                    <Combobox
                                        options={availableDepartments}
                                        selected=''
                                        setSelected={handleDepartmentSelect}
                                        className='w-full'
                                        placeholder='Select departments...'
                                    />
                                </div>
                            ) : (
                                <Combobox
                                    options={departments}
                                    selected={department}
                                    setSelected={setDepartment}
                                    className='w-full'
                                />
                            )}
                        </div>

                        <div>
                            <label className='block text-sm font-medium mb-1 text-gray-300'>
                                Password
                            </label>
                            <div className='flex space-x-2'>
                                <Input
                                    type='text'
                                    className='w-full bg-gray-700 border-gray-600 text-white'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='Password will be auto-generated'
                                    readOnly
                                />
                                <Button
                                    className='bg-green-600 hover:bg-green-500'
                                    onClick={generatePassword}
                                >
                                    Generate
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium mb-1 text-gray-300'>
                                Confirm Password
                            </label>
                            <Input
                                type='text'
                                className='w-full bg-gray-700 border-gray-600 text-white'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder='Confirm password'
                            />
                        </div>
                    </div>
                </div>

                <Button
                    className='mt-6 w-full bg-green-600 hover:bg-green-500 h-11 flex items-center justify-center'
                    onClick={handleSignUp}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Creating...
                        </>
                    ) : (
                        'Create User'
                    )}
                </Button>
            </CardContent>
        </div>
    );
};

const ViewUsers = ({ users, setUsers, loading, setLoading }) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [filter, setFilter] = useState('all');
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false); // Separate loading state for this component

    useEffect(() => {
        const fetchUsers = async () => {
            setUsersLoading(true); // Use local loading state instead
            try {
                const querySnapshot = await getDocs(collection(db, 'Auth'));
                const usersData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsers(usersData);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setUsersLoading(false); // Always set loading to false when done
            }
        };

        fetchUsers();
    }, []); // Remove dependencies to prevent re-fetching issues

    const handleDelete = async () => {
        if (!userToDelete) return;

        setDeleteError('');
        setDeleteSuccess('');
        setIsDeleting(true);

        try {
            // First make a call to our API route to delete the user from Firebase Auth
            const response = await fetch('/api/deleteUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid: userToDelete.id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete user from authentication');
            }

            // Then delete the user from Firestore
            await deleteDoc(doc(db, 'Auth', userToDelete.id));

            // Update the UI
            setUsers(users.filter((user) => user.id !== userToDelete.id));
            setDeleteSuccess('User successfully deleted from database and authentication.');

            // Close the dialog after a delay
            setTimeout(() => {
                setDeleteDialogOpen(false);
                setDeleteSuccess('');
            }, 1500);
        } catch (error) {
            console.error('Error deleting user:', error);
            setDeleteError(error.message || 'Failed to delete user. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Helper function to get display role
    const getDisplayRole = (role) => {
        if (!role) return 'Unknown';
        const lowerRole = role.toLowerCase();
        if (lowerRole === 'user') return 'Proposer';
        if (lowerRole === 'admin') return 'Admin';
        if (lowerRole === 'reviewer') return 'Reviewer';
        // Handle inconsistent casing
        if (lowerRole === 'proposer') return 'Proposer';
        return role; // Default fallback
    };

    const filteredUsers = users.filter((user) => {
        const lowerRole = user.role?.toLowerCase() || '';
        if (filter === 'all') return true;
        if (filter === 'proposers') return lowerRole === 'user' || lowerRole === 'proposer';
        if (filter === 'reviewers') return lowerRole === 'reviewer';
        return true;
    });

    return (
        <div className='p-6'>
            <CardHeader>
                <CardTitle className='text-white'>Manage Users</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={filter} onValueChange={setFilter} className='mb-6'>
                    <TabsList className='grid w-full grid-cols-3 bg-gray-800 h-12'>
                        <TabsTrigger
                            value='all'
                            className='text-white data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500'
                        >
                            All Users
                        </TabsTrigger>
                        <TabsTrigger
                            value='proposers'
                            className='text-white data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500'
                        >
                            Proposers
                        </TabsTrigger>
                        <TabsTrigger
                            value='reviewers'
                            className='text-white data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500'
                        >
                            Reviewers
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {usersLoading ? (
                    <div className='flex justify-center items-center h-64'>
                        <Loader2 className='h-8 w-8 animate-spin text-blue-400' />
                        <span className='ml-2 text-gray-400'>Loading users...</span>
                    </div>
                ) : (
                    <div className='bg-gray-800 rounded-lg border border-gray-700 overflow-hidden'>
                        <div className='overflow-x-auto'>
                            <table className='min-w-full divide-y divide-gray-700'>
                                <thead className='bg-gray-700'>
                                    <tr>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                                            Name
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                                            Email
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                                            Role
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                                            Department(s)
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                                            Initial Password
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='bg-gray-800 divide-y divide-gray-700'>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td className='px-6 py-4 whitespace-nowrap text-gray-300'>
                                                    {user.name}
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap text-gray-300'>
                                                    {user.email}
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap'>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ${
                                                            user.role?.toLowerCase() === 'user' ||
                                                            user.role?.toLowerCase() === 'proposer'
                                                                ? 'bg-green-500/10 text-green-500'
                                                                : user.role?.toLowerCase() ===
                                                                    'admin'
                                                                  ? 'bg-purple-500/10 text-purple-500'
                                                                  : 'bg-amber-500/10 text-amber-500'
                                                        }`}
                                                    >
                                                        {getDisplayRole(user.role)}
                                                    </span>
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap text-gray-300'>
                                                    {Array.isArray(user.department)
                                                        ? user.department.join(', ')
                                                        : user.department}
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap text-gray-300'>
                                                    {user.initialPassword || 'N/A'}
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap'>
                                                    {user.role?.toLowerCase() === 'admin' ? (
                                                        <span className='text-xs text-gray-500 italic'>
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            variant='destructive'
                                                            size='sm'
                                                            onClick={() => {
                                                                setUserToDelete(user);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2Icon className='h-4 w-4 mr-1' />
                                                            Delete
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className='px-6 py-4 text-center text-gray-400'
                                            >
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </CardContent>

            {deleteDialogOpen && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
                    <Card className='bg-gray-800 border border-gray-700 max-w-md w-full'>
                        <CardHeader>
                            <CardTitle className='text-white'>Are you sure?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='text-gray-400 mb-6'>
                                This action cannot be undone. This will permanently delete the user
                                account from both the database and authentication system.
                            </p>

                            {deleteError && (
                                <div className='bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4'>
                                    {deleteError}
                                </div>
                            )}
                            {deleteSuccess && (
                                <div className='bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4'>
                                    {deleteSuccess}
                                </div>
                            )}

                            <div className='flex justify-end space-x-3'>
                                <Button
                                    variant='outline'
                                    className='border border-gray-600 hover:bg-gray-700'
                                    onClick={() => {
                                        setDeleteDialogOpen(false);
                                        setDeleteError('');
                                        setDeleteSuccess('');
                                    }}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant='destructive'
                                    onClick={handleDelete}
                                    disabled={isDeleting || !!deleteSuccess}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
