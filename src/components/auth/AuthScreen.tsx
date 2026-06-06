"use client";

import React, { useState } from "react";
import { SignInCard } from "./SignInCard";
import { SignUpCard } from "./SignUpCard";

export const AuthScreen = () => {
  const [signState, setSignState] = useState<"signin" | "signup">("signin");

  const toggleSignState = () => {
    setSignState((prevState) => (prevState === "signin" ? "signup" : "signin"));
  };

  return (
    <div className="min-h-screen w-full auth-background flex items-center justify-center p-4">
      {/* Animated floating orbs */}
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
      <div className="floating-orb floating-orb-3" />
      
      {/* Auth card container */}
      <div className="w-full max-w-md z-10 auth-card-animate">
        {signState === "signin" ? <SignInCard /> : <SignUpCard />}
        
        <div className="text-center mt-6">
          <button 
            onClick={toggleSignState} 
            className="auth-toggle-btn text-sm font-medium px-4 py-2"
          >
            {signState === "signin" 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};
