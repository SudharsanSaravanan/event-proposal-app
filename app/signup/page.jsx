"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Combobox } from "@/components/ui/combo-box";

const departments = [
  { value: "CSE", label: "CSE" },
  { value: "ECE", label: "ECE" },
  { value: "EEE", label: "EEE" },
  { value: "MECH", label: "MECH" },
  { value: "CIVIL", label: "CIVIL" },
];

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState(""); // State for department
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    setError("");

    if (!name || !email || !department || !password || !confirmPassword) {
      setError("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      //console.log("Attempting signup with:", email, password);

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      //console.log("User Signed Up:", user);

      // Store additional user data in Firestore
      const userRef = doc(db, "Auth", user.uid);
      await setDoc(userRef, {
        name,
        email,
        department,
        role: "User",
        createdAt: new Date().toISOString(),
      });

      //console.log("User data stored in Firestore");

      // Store user info in session storage
      sessionStorage.setItem("user", true);
      sessionStorage.setItem("name", name);

      // Clear form
      setName("");
      setEmail("");
      setDepartment("");
      setPassword("");
      setConfirmPassword("");

      // Redirect to login page
      router.push("/login");
    } catch (e) {
      setError(e.message);
      console.error("Signup Error:", e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <Card className="w-96 bg-gray-800 text-white border-0 shadow-xl">
        <CardContent className="p-8">
          <img
            alt="profile"
            src="/anokha_logo.png"
            className="h-20 w-20 mx-auto object-cover rounded-full mb-4"
          />
          <h1 className="text-2xl font-semibold text-center mb-5">Sign Up as a Proposer</h1>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <div className="mb-4">
            <label htmlFor="name" className="text-white mb-2 block">Full name</label>
            <Input
              type="text"
              placeholder="Enter your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-4 bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="department" className="text-white mb-2 block">Department</label>
            <Combobox 
              options={departments} 
              selected={department} 
              setSelected={setDepartment} 
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="text-white mb-2 block">Email</label>
            <Input
              type="email"
              placeholder="Enter your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="text-white mb-2 block">Password</label>
            <PasswordInput
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="text-white mb-2 block">Re-enter password</label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <Button
            onClick={handleSignUp}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2"
          >
            Sign Up
          </Button>

          <p className="text-gray-400 text-sm mt-4 text-center">
            Already have an account? <a href="/login" className="text-green-500">Login</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;