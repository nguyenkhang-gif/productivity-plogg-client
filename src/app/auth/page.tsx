"use client";

import { AuthScreen } from "@/components/auth/AuthScreen";
import { useSignUpWithJwt } from "@/core/hooks/auth/useSignUpWithJwt";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { Suspense } from "react";

const PageContent = () => {

  const querys = useSearchParams();

  const { signUpWithJwt } = useSignUpWithJwt();

  const router = useRouter();
  useEffect(() => {
    const token = querys.get("jwt");
    const handleLoginWithJwt = async (token: string) => {
      await signUpWithJwt(token, {
        onError: () => {},
        onSuccess: () => {},
      });
      router.replace("/");
    };
    if (token) handleLoginWithJwt(token);
  }, [router, signUpWithJwt, querys]);

  return <AuthScreen />;
};

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PageContent />
  </Suspense>
);

export default Page;
