import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "@radix-ui/react-separator";
import { useLoginWithPasswordEmail } from "@/core/hooks/auth/use-sign-in-with-passwod-email";
import axiosInstance from "@/core/lib/axiosInstance";

export const SignUpCard = () => {
  const {  isPending,signUp } = useLoginWithPasswordEmail();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage(null); // Clear error message on input change
  };

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      console.log("submit this",formData);
      
      // const res = await axiosInstance.post("/auth/refresh-token");
      // console.log(res);

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
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
      </CardHeader>
      <CardDescription>Create an account with your details</CardDescription>
      <CardContent className="space-y-5 px-0 pb-0">
        <form className="space-y-2.5" onSubmit={handleSubmitForm}>
          <Input
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Full Name"
            type="text"
            required
          />
          <Input
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Username"
            type="text"
            required
          />
          <Input
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            type="email"
            required
          />
          <Input
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            type="password"
            required
          />
          <Input
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Password"
            type="password"
            required
          />
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === "male"}
                onChange={handleInputChange}
              />
              <span>Male</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === "female"}
                onChange={handleInputChange}
              />
              <span>Female</span>
            </label>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}


          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Sign Up"}
          </Button>
        </form>
        <Separator />
      </CardContent>
    </Card>
  );
};
