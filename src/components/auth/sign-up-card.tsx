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
