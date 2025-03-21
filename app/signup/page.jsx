"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignUp = async () => {
    setError(""); // Reset error before new attempt

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(email, password);
      console.log("User Signed Up:", res);
      sessionStorage.setItem("user", true);
      sessionStorage.setItem("name", name);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      router.push("/login"); // Redirect to login after signup
    } catch (e) {
      setError(e.message);
      console.error("Signup Error:", e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-96 bg-gray-800 text-white shadow-xl p-6">
      <img
            alt="name"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSjRzSvbCVFZLM7RRaU8gCuuOioUec38lZkg&s"
            className="h-20 w-20 mx-auto object-cover rounded-full "
      />
        <CardContent>
          <h1 className="text-2xl font-semibold text-center mb-5">Sign Up</h1>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4"
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mb-4"
          />
          
          <Button onClick={handleSignUp} className="w-full bg-indigo-600 hover:bg-indigo-500">
            Sign Up
          </Button>

          <p className="text-gray-400 text-sm mt-4 text-center">
            Already have an account? <a href="/login" className="text-indigo-400">Login</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
