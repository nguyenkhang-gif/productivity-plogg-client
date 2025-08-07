"use client";

import { AuthScreen } from "@/components/auth/auth-screen";
import { useSignUpWithJwt } from "@/hooks/auth/use-sign-up-with-jwt";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Suspense } from "react";

const PageContent = () => {
  const count = useSelector((state: RootState) => state.counter.count);

  const querys = useSearchParams();

  const { signUpWithJwt } = useSignUpWithJwt();

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
        },
      });
      router.replace("/");
    };
    if (token) handleLoginWithJwt(token);
  }, [router, signUpWithJwt, querys]);

  useEffect(()=>{},[])

  return <AuthScreen />;
};

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PageContent />
  </Suspense>
);

export default Page;
