"use client";

import { useState, useEffect } from "react";
import { FileText, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/app/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function UserLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userRef = doc(db, "Auth", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          router.push("/login");
          return;
        }

        const userData = userSnap.data();
        const userRole = userData.role?.toLowerCase();

        if (userRole !== "user") {
          router.push("/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        router.push("/");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-900 overflow-hidden">
      {isMobile && !sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed z-50 top-4 left-4 p-2 rounded-md bg-gray-800 text-white"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}

      <div
        className={`bg-gray-800 shadow-md transition-all duration-300 ${
          sidebarOpen
            ? isMobile
              ? "fixed z-40 w-64 h-[calc(100%-1rem)] top-2 left-2 rounded-lg"
              : "w-64"
            : isMobile
              ? "hidden"
              : "w-20"
        } flex-shrink-0 h-full flex flex-col`}
      >
        {isMobile && (
          <div className="absolute top-2 right-2 p-1">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-white hover:bg-gray-600"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && (
            <h2 className="text-lg font-semibold text-white">User Dashboard</h2>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-white hover:bg-gray-600"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <nav className="p-4 space-y-1">
            <Link
              href="/user"
              onClick={handleLinkClick}
              className={`flex items-center w-full p-2 rounded-md ${
                pathname === "/user"
                  ? "bg-gray-600 text-white"
                  : "hover:bg-gray-600 text-gray-300"
              } transition-colors`}
            >
              <LayoutDashboard size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="ml-3">Dashboard</span>}
            </Link>
            <Link
              href="/user/proposals"
              onClick={handleLinkClick}
              className={`flex items-center w-full p-2 rounded-md ${
                pathname.startsWith("/user/proposals")
                  ? "bg-gray-600 text-white"
                  : "hover:bg-gray-600 text-gray-300"
              } transition-colors`}
            >
              <FileText size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="ml-3">View Proposals</span>}
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-700">
            <button
              onClick={() => {
                handleLogout();
                if (isMobile) setSidebarOpen(false);
              }}
              className="flex items-center w-full p-2 rounded-md hover:bg-gray-600 text-red-500 transition-colors"
            >
              <LogOut size={18} className="flex-shrink-0 text-red-500" />
              {sidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 p-6 h-full overflow-y-auto">{children}</div>
      </main>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
