"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import ReviewerLayout from "@/app/ReviewerPages/ReviewerLayout";
import { Loader2, AlertCircle } from "lucide-react";

export default function ReviewerPage() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("No user found, redirecting to login");
        router.push("/login");
        return;
      }

      try {
        console.log("User authenticated:", user.uid);
        
        // First check session storage for values from the login page
        const isUser = sessionStorage.getItem("user");
        const role = sessionStorage.getItem("role");
        const name = sessionStorage.getItem("name");
        let departments = [];
        
        try {
          const departmentsStr = sessionStorage.getItem("departments");
          if (departmentsStr) {
            departments = JSON.parse(departmentsStr);
          }
        } catch (e) {
          console.error("Error parsing departments:", e);
        }
        
        console.log("Session storage - user:", isUser);
        console.log("Session storage - role:", role);
        console.log("Session storage - departments:", departments);
        
        // Check if user is already authenticated via session storage
        if (isUser === "true" && role && role.toLowerCase() === "reviewer") {
          console.log("User authenticated via session storage");
          
          // Create userData object from session storage
          const authData = {
            authenticated: true,
            name: name || "Reviewer",
            role: "Reviewer", // Standardized to capital R
            departments: departments || []
          };
          
          // Set the auth object in session storage (for compatibility)
          sessionStorage.setItem("auth", JSON.stringify(authData));
          
          setIsAuthenticated(true);
          setUserData(authData);
          setLoading(false);
          return;
        }
        
        // Fallback to Firestore check if session storage doesn't have valid data
        console.log("Checking Firestore for user data");
        const userRef = doc(db, "Auth", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          throw new Error("User document not found");
        }
        
        const firestoreData = userSnap.data();
        console.log("[ReviewerPage] User data from Firestore:", firestoreData);
        console.log("[ReviewerPage] User role from Firestore:", firestoreData.role);
        
        // Check role case-insensitively
        if (firestoreData.role.toLowerCase() !== "reviewer") {
          throw new Error("User is not a reviewer");
        }

        // Process departments properly
        let userDepartments = firestoreData.department || [];
        if (!Array.isArray(userDepartments)) {
          userDepartments = typeof userDepartments === 'object' 
            ? Object.values(userDepartments) 
            : [userDepartments];
        }
        
        // Prepare session data with standardized role
        const authSession = {
          authenticated: true,
          name: firestoreData.name || "Reviewer",
          role: "Reviewer", // Standardized to capital R
          departments: userDepartments
        };

        // Set both auth formats in session storage for compatibility
        sessionStorage.setItem("auth", JSON.stringify(authSession));
        sessionStorage.setItem("user", "true");
        sessionStorage.setItem("role", "Reviewer");
        sessionStorage.setItem("name", firestoreData.name || "");
        sessionStorage.setItem("departments", JSON.stringify(userDepartments));
        
        setIsAuthenticated(true);
        setUserData(authSession);
      } catch (error) {
        console.error("Authentication error:", error);
        sessionStorage.removeItem("auth");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Rest of your component remains exactly the same...
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="bg-red-900/50 text-red-200 p-6 rounded-lg max-w-md flex items-start gap-4">
          <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-xl mb-2">Access Denied</h2>
            <p>Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return <ReviewerLayout userData={userData} />;
}