"use client";

import React, { useState } from "react";
import { SignInCard } from "./sign-in-card";
import { SignUpCard } from "./sign-up-card";

export const AuthScreen = () => {
  const [signState, setSignState] = useState<"signin" | "signup">("signin");

  const toggleSignState = () => {
    setSignState((prevState) => (prevState === "signin" ? "signup" : "signin"));
  };

  return (
    <div className="h-full flex items-center justify-center bg-[#5C3B58]">
      <div className="md:h-auto md:w-[420px]">
        {signState === "signin" ? <SignInCard /> : <SignUpCard />}
        
        <div className="text-center mt-4">
          <button 
            onClick={toggleSignState} 
            className="text-white underline"
          >
            {signState === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};
