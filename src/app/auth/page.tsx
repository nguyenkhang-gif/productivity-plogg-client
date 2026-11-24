"use client";

import { AuthScreen } from "@/components/auth/AuthScreen";
import { useSignUpWithJwt } from "@/core/hooks/auth/useSignUpWithJwt";
import { RETURN_TO_PARAM, sanitizeReturnTo } from "@/core/auth/return-to";
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
      // Cùng đích với rule guest-only của RouteGuard (#8)
      router.replace(sanitizeReturnTo(querys.get(RETURN_TO_PARAM)) ?? "/");
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
