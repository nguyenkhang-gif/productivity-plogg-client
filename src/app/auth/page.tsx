"use client";
import { AuthScreen } from "@/components/auth/auth-screen";
import { useSignUpWithJwt } from "@/hooks/auth/use-sign-up-with-jwt";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";

const Page = () => {
  const count = useSelector((state: RootState) => state.counter.count);
  console.log("count pls", count);

  const querys = useSearchParams();

  const { signUpWithJwt } = useSignUpWithJwt();
  // if (token) {
  //   handleLoginWithJwt(token);
  // }

  const router = useRouter();
  useEffect(() => {
    const token = querys.get("jwt");
    const handleLoginWithJwt = async (token: string) => {
      await signUpWithJwt(token, {
        onError: (error) => {
          console.log(error);
        },
        onSuccess: (data) => {
          console.log(data, "data");
          // querys.delete("jwt");
        },
      });
      router.replace("/");
    };
    if (token) handleLoginWithJwt(token);
  }, [router, signUpWithJwt, querys]);

  return <AuthScreen />;
};

export default Page;
