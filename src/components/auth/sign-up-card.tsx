"use client";

import { useState, useMemo } from "react";
import { useLoginWithPasswordEmail } from "@/core/hooks/auth/use-sign-in-with-passwod-email";
import { Eye, EyeOff, Loader2, Mail, Lock, User, AtSign } from "lucide-react";

export const SignUpCard = () => {
  const { isPending, signUp } = useLoginWithPasswordEmail();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage(null);
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const { password } = formData;
    if (!password) return null;
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 1) return "weak";
    if (score <= 2) return "medium";
    return "strong";
  }, [formData.password]);

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return;
    }

    try {
      await signUp(
        formData.fullName,
        formData.username,
        formData.email,
        formData.password,
        formData.password,
        formData.gender
      );
    } catch (error) {
      setErrorMessage("Failed to sign up. Please try again.");
      console.error("Sign up failed:", error);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
        <p className="text-white/60 text-sm">
          Start your productivity journey today
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmitForm}>
        {/* Full Name */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Full Name"
            type="text"
            required
            disabled={isPending}
            className="w-full h-12 pl-12 pr-4 rounded-xl auth-input text-sm"
          />
        </div>

        {/* Username */}
        <div className="relative">
          <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Username"
            type="text"
            required
            disabled={isPending}
            className="w-full h-12 pl-12 pr-4 rounded-xl auth-input text-sm"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email address"
            type="email"
            required
            disabled={isPending}
            className="w-full h-12 pl-12 pr-4 rounded-xl auth-input text-sm"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isPending}
              className="w-full h-12 pl-12 pr-12 rounded-xl auth-input text-sm"
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrength === "weak"
                      ? "w-1/3 bg-red-500"
                      : passwordStrength === "medium"
                      ? "w-2/3 bg-yellow-500"
                      : "w-full bg-green-500"
                  }`}
                />
              </div>
              <span
                className={`text-xs ${
                  passwordStrength === "weak"
                    ? "text-red-400"
                    : passwordStrength === "medium"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {passwordStrength}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            required
            disabled={isPending}
            className="w-full h-12 pl-12 pr-12 rounded-xl auth-input text-sm"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Gender Selection */}
        <div className="flex items-center gap-6 py-2">
          <span className="text-white/50 text-sm">Gender:</span>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === "male"}
              onChange={handleInputChange}
              className="custom-radio"
            />
            <span className="text-white/70 text-sm group-hover:text-white transition-colors">
              Male
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === "female"}
              onChange={handleInputChange}
              className="custom-radio"
            />
            <span className="text-white/70 text-sm group-hover:text-white transition-colors">
              Female
            </span>
          </label>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm text-center">{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-12 rounded-xl gradient-btn text-sm mt-2"
          disabled={isPending}
        >
          <span className="flex items-center justify-center gap-2">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </span>
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-5">
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
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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

      {/* Terms */}
      <p className="text-white/40 text-xs text-center mt-4">
        By signing up, you agree to our{" "}
        <button type="button" className="text-white/60 hover:text-white underline">
          Terms of Service
        </button>{" "}
        and{" "}
        <button type="button" className="text-white/60 hover:text-white underline">
          Privacy Policy
        </button>
      </p>
    </div>
  );
};
