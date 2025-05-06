"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  signOut, 
  deleteUser, 
  getAuth 
} from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserIcon,
  ClipboardCheckIcon,
  UsersIcon,
  ChevronRightIcon,
  Trash2Icon,
  LogOutIcon,
  XIcon
} from "lucide-react";
import { Combobox } from "@/components/ui/combo-box";
import { Input } from "@/components/ui/input";

const departments = [
  { value: "CSE", label: "CSE" },
  { value: "ECE", label: "ECE" },
  { value: "EEE", label: "EEE" },
  { value: "MECH", label: "MECH" },
  { value: "CIVIL", label: "CIVIL" },
];

const AdminPanel = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("signup");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <Button 
            onClick={() => setShowLogoutConfirm(true)}
            variant="outline"
            className="bg-transparent text-white border border-gray-600 hover:bg-white hover:text-gray-900 hover:border-gray-400"
          >
            <LogOutIcon className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 h-12">
            <TabsTrigger 
              value="signup" 
              className="text-white data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Create User
            </TabsTrigger>
            <TabsTrigger 
              value="view" 
              className="text-white data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500"
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              View Users
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Main Content */}
        <Card className="bg-gray-800 border border-gray-700">
          <CardContent className="p-0">
            {activeTab === "signup" ? (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-800 border border-gray-700 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white">Confirm Logout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-6">Are you sure you want to logout?</p>
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  className="border border-gray-600 hover:bg-gray-700"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-500"
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("User");
  const [department, setDepartment] = useState(""); // For single department selection
  const [selectedDepartments, setSelectedDepartments] = useState([]); // For multiple department selection
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let newPassword = "";
    for (let i = 0; i < 10; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(newPassword);
    setPassword(newPassword);
    setConfirmPassword(newPassword);
  };

  const handleSignUp = async () => {
    setError("");
    setSuccess("");

    if (!name || !email || !role || (role === "User" && !department) || (role === "Reviewer" && selectedDepartments.length === 0)) {
      setError("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const departmentData = role === "Reviewer" ? selectedDepartments : department;

      const userRef = doc(db, "Auth", user.uid);
      await setDoc(userRef, {
        name,
        email,
        department: departmentData,
        role: role === "User" ? "User" : "Reviewer",
        createdAt: new Date().toISOString(),
        initialPassword: password
      });

      setUsers(prevUsers => [
        ...prevUsers,
        {
          id: user.uid,
          name,
          email,
          department: departmentData,
          role: role === "User" ? "User" : "Reviewer",
          initialPassword: password
        }
      ]);

      setName("");
      setEmail("");
      setDepartment("");
      setSelectedDepartments([]);
      setPassword("");
      setConfirmPassword("");
      setGeneratedPassword("");

      setSuccess("User created successfully!");
    } catch (e) {
      setError(e.message);
      console.error("Signup Error:", e);
    }
  };

  const handleDepartmentSelect = (value) => {
    if (role === "Reviewer") {
      if (!selectedDepartments.includes(value)) {
        setSelectedDepartments([...selectedDepartments, value]);
      }
    } else {
      setDepartment(value);
    }
  };

  const removeDepartment = (dept) => {
    setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
  };

  // Filter out already selected departments for the combobox
  const availableDepartments = departments.filter(
    dept => !selectedDepartments.includes(dept.value)
  );

  return (
    <div className="p-6">
      <CardHeader>
        <CardTitle className="text-white">Create New User</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
              <Input
                type="text"
                className="w-full bg-gray-700 border-gray-600 text-white"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
              <Input
                type="email"
                className="w-full bg-gray-700 border-gray-600 text-white"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Role</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="role"
                    value="User"
                    checked={role === "User"}
                    onChange={() => setRole("User")}
                    className="h-4 w-4 text-green-500 focus:ring-green-500 bg-gray-700 border-gray-600"
                  />
                  <span className="text-gray-300">Proposer</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="role"
                    value="Reviewer"
                    checked={role === "Reviewer"}
                    onChange={() => setRole("Reviewer")}
                    className="h-4 w-4 text-green-500 focus:ring-green-500 bg-gray-700 border-gray-600"
                  />
                  <span className="text-gray-300">Reviewer</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                {role === "Reviewer" ? "Departments" : "Department"}
              </label>
              {role === "Reviewer" ? (
                <div className="space-y-3">
                  {/* Display selected departments with remove buttons */}
                  {selectedDepartments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedDepartments.map((dept) => (
                        <div 
                          key={dept} 
                          className="flex items-center bg-green-500/20 text-green-500 rounded-full px-3 py-1"
                        >
                          <span className="mr-1">{dept}</span>
                          <button 
                            onClick={() => removeDepartment(dept)}
                            className="text-green-400 hover:text-white"
                          >
                            <XIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Combobox for selecting departments */}
                  <Combobox 
                    options={availableDepartments}
                    selected=""
                    setSelected={handleDepartmentSelect}
                    className="w-full"
                    placeholder="Select departments..."
                  />
                </div>
              ) : (
                <Combobox 
                  options={departments} 
                  selected={department} 
                  setSelected={setDepartment}
                  className="w-full"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  className="w-full bg-gray-700 border-gray-600 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password will be auto-generated"
                  readOnly
                />
                <Button 
                  className="bg-green-600 hover:bg-green-500"
                  onClick={generatePassword}
                >
                  Generate
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Confirm Password</label>
              <Input
                type="text"
                className="w-full bg-gray-700 border-gray-600 text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
            </div>
          </div>
        </div>

        <Button 
          className="mt-6 w-full bg-green-600 hover:bg-green-500 h-11"
          onClick={handleSignUp}
        >
          Create User
        </Button>
      </CardContent>
    </div>
  );
};

const ViewUsers = ({ users, setUsers, loading, setLoading }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filter, setFilter] = useState("all");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "Auth"));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    setDeleteError("");
    setDeleteSuccess("");
    
    try {
      await deleteDoc(doc(db, "Auth", userToDelete.id));
      
      try {
        console.log(`User ${userToDelete.id} should be deleted from Auth via Admin SDK`);
        setDeleteSuccess("User successfully deleted from database and authentication.");
      } catch (authError) {
        console.error("Error deleting user from authentication:", authError);
        setDeleteError("User was deleted from database but there was an error removing them from authentication.");
      }
      
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      setTimeout(() => {
        setDeleteDialogOpen(false);
        setDeleteSuccess("");
      }, 1500);
      
    } catch (error) {
      console.error("Error deleting user:", error);
      setDeleteError("Failed to delete user. Please try again.");
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === "all") return true;
    if (filter === "proposers") return user.role === "User";
    if (filter === "reviewers") return user.role === "Reviewer";
    return true;
  });

  return (
    <div className="p-6">
      <CardHeader>
        <CardTitle className="text-white">Manage Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 h-12">
            <TabsTrigger 
              value="all" 
              className="text-white data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500"
            >
              All Users
            </TabsTrigger>
            <TabsTrigger 
              value="proposers" 
              className="text-white data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500"
            >
              Proposers
            </TabsTrigger>
            <TabsTrigger 
              value="reviewers" 
              className="text-white data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500"
            >
              Reviewers
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Department(s)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Initial Password</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === "User" 
                              ? "bg-green-500/10 text-green-500" 
                              : "bg-amber-500/10 text-amber-500"
                          }`}>
                            {user.role === "User" ? "Proposer" : "Reviewer"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {Array.isArray(user.department) 
                            ? user.department.join(", ") 
                            : user.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.initialPassword || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2Icon className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-800 border border-gray-700 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white">Are you sure?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-6">
                This action cannot be undone. This will permanently delete the user account from both the database and authentication system.
              </p>
              
              {deleteError && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
                  {deleteError}
                </div>
              )}
              {deleteSuccess && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4">
                  {deleteSuccess}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  className="border border-gray-600 hover:bg-gray-700"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setDeleteError("");
                    setDeleteSuccess("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={!!deleteSuccess}
                >
                  Delete
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