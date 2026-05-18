"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, User, Lock } from "lucide-react";

import { useLoginWithPasswordEmail } from "@/core/hooks/auth/use-sign-in-with-passwod-email";

export const SignInCard = () => {
  const router = useRouter();
  const { login } = useLoginWithPasswordEmail();

  // State
  const [identifier, setIdentifier] = useState(""); // Chứa cả username hoặc email
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Lưu ý: Tên hàm login từ hook có thể vẫn giữ là login(email, password) 
    // nhưng ta truyền identifier vào tham số đầu tiên.
    login(identifier, password, {
      onError: () => {
        setErrorMessage("Thông tin đăng nhập không chính xác");
        setIsLoading(false);
      },
      onSuccess: () => {
        setIsLoading(false);
        router.replace("/posts");
      },
    });
  };

  return (
    <div className="glass-card rounded-2xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Chào mừng trở lại</h1>
        <p className="text-white/60 text-sm">
          Đăng nhập để tiếp tục hành trình của bạn
        </p>
      </div>

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmitForm}>
        {/* Identifier Input (Username or Email) */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            disabled={isLoading}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Tên đăng nhập hoặc Email"
            type="text" // Chuyển từ email sang text để nhận được cả username
            required
            className="w-full h-12 pl-12 pr-4 rounded-xl auth-input text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            disabled={isLoading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            type={showPassword ? "text" : "password"}
            required
            className="w-full h-12 pl-12 pr-12 rounded-xl auth-input text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-in fade-in zoom-in duration-200">
            <p className="text-red-400 text-sm text-center">{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-12 rounded-xl gradient-btn text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <span className="flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đăng Nhập"
            )}
          </span>
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/40 text-xs uppercase tracking-wider">Hoặc</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Social Login */}
      <div className="flex gap-3">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
          className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`}
          className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </a>
      </div>
    </div>
  );
};