"use client";
import { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { doc, getDoc } from "firebase/firestore";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Email and Password are required!");
      return;
    }

    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(email, password);
      
      if (result && result.user) {
        console.log("User logged in:", result.user.uid);
        
        // First check if user is a reviewer
        const reviewerRef = doc(db, "Reviewers", result.user.uid);
        const reviewerSnapshot = await getDoc(reviewerRef);
        
        if (reviewerSnapshot.exists()) {
          console.log("User is a reviewer");
          const reviewerData = reviewerSnapshot.data();
          
          // Store reviewer data in session storage
          sessionStorage.setItem("user", true);
          sessionStorage.setItem("name", reviewerData.name || "");
          sessionStorage.setItem("role", "Reviewer");
          
          // Handle department data correctly
          let departments = reviewerData.department;
          // If department is an object with numeric keys, convert to array
          if (departments && typeof departments === 'object' && !Array.isArray(departments)) {
            departments = Object.values(departments);
          }
          console.log("Reviewer departments:", departments);
          sessionStorage.setItem("departments", JSON.stringify(departments || []));
          
          // Redirect to reviewer dashboard
          router.push("/reviewer");
          return;
        }
        
        // If not a reviewer, check regular user role
        const userRef = doc(db, "Auth", result.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userRole = userData.role;
          
          // Store user data in session storage
          sessionStorage.setItem("user", true);
          sessionStorage.setItem("name", userData.name || "");
          sessionStorage.setItem("role", userRole);
          
          // Redirect based on role
          switch (userRole) {
            case "Admin":
              router.push("/admin");
              break;
            case "User":
              router.push("/user");
              break;
            default:
              router.push("/"); // Default home page
          }
        } else {
          // User exists in Auth but not in Firestore
          setError("User profile not found. Please contact support.");
          console.error("User document not found in Firestore");
        }
      } else {
        setError("Invalid email or password!");
      }
    } catch (e) {
      setError("Login failed: " + (e.message || "Unknown error"));
      console.error("Login error:", e);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-semibold text-center mb-5">Login</h1>
          
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          
          <div className="mb-4">
            <label htmlFor="email" className="text-white mb-2 block">Email</label>
            <Input
              type="email"
              id="email"
              placeholder="Enter your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="text-white mb-2 block">Password</label>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          
          <div className="my-3 text-right pr-1">
            <a className="text-green-500 cursor-pointer hover:underline" href="/reset">
              Forgot your Password?
            </a>
          </div>
          
          <Button 
            onClick={handleSignIn} 
            className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2 mt-2"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
          
          <p className="text-gray-400 text-sm mt-4 text-center">
            Don't have an account? <a href="/signup" className="text-green-500">Sign Up</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;