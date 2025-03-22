"use client";
import { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Email and Password are required!");
      return;
    }

    try {
      await signInWithEmailAndPassword(email, password);
      sessionStorage.setItem("user", true);
      sessionStorage.setItem("role", role);
      setEmail("");
      setPassword("");
      router.push("/");
    } catch (e) {
      setError("Invalid email or password!");
      console.error(e);
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
              placeholder="Enter your Amrita Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="text-white mb-2 block">Password</label>
            <Input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="role" className="text-white mb-2 block">Role</label>
            <Select onValueChange={setRole} defaultValue="user">
              <SelectTrigger id="role" className="w-full bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 text-white">
                <SelectItem value="user" className="hover:bg-gray-600">User</SelectItem>
                <SelectItem value="reviewer" className="hover:bg-gray-600">Reviewer</SelectItem>
                <SelectItem value="admin" className="hover:bg-gray-600">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="my-3 text-right pr-1">
            <a className="text-green-500 cursor-pointer hover:underline" href="/reset">
              Forgot your Password?
            </a>
          </div>
          
          <Button 
            onClick={handleSignIn} 
            className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2 mt-2"
          >
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;