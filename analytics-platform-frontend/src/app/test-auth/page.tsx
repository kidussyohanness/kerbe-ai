"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  const handleTestSignIn = async () => {
    const result = await signIn("google", { 
      callbackUrl: "/dashboard",
      redirect: false 
    });
    console.log("Sign in result:", result);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Status:</p>
            <p className="text-gray-600">{status}</p>
          </div>
          
          {session ? (
            <div>
              <p className="font-semibold">User Info:</p>
              <p>Name: {session.user?.name}</p>
              <p>Email: {session.user?.email}</p>
              <p>ID: {(session.user as any)?.id}</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">Not authenticated</p>
              <button 
                onClick={handleTestSignIn}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Sign In
              </button>
            </div>
          )}
          
          <div>
            <p className="font-semibold">Actions:</p>
            <div className="space-x-2">
              <a 
                href="/dashboard" 
                className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Go to Dashboard
              </a>
              <a 
                href="/signin" 
                className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Go to Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
