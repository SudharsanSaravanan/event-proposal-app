"use client";
import { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-96 bg-gray-800 text-white">
      <img
            alt="name"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSjRzSvbCVFZLM7RRaU8gCuuOioUec38lZkg&s"
            className="h-20 w-20 mx-auto object-cover rounded-full "
      />
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            type="email"
            placeholder="Enter your Amrita Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />
          <Input 
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          
          <Select onValueChange={setRole}>
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="reviewer">Reviewer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <div className="my-3 text-right pr-1">
            <a className="text-green-600 cursor-pointer hover:underline" onClick={() => router.push("/reset")}>Forgot Password</a>
          </div>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <Button onClick={handleSignIn} className="w-full bg-green-500 hover:bg-green-600">
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
