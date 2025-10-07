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
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";

export const SignInCard = () => {
  const router = useRouter();
  const { login } = useLoginWithPasswordEmail();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    login(email, password, {
      onError: (error) => {
        setErrorMessage("Invalid user or password");
        console.log(error);
        setIsLoading(false);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSuccess: (data: any) => {
        console.log("login success");
        router.replace("/");
        setIsLoading(false);
        dispatch({ type: "user/updateUser", payload: data?.user ?? {} });
      },
    });
  };

  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
      </CardHeader>
      <CardDescription>Use email and password to login</CardDescription>
      <CardContent className="space-y-5 px-0 pb-0">
        <form className="space-y-2.5" onSubmit={handleSubmitForm}>
          <Input
            disabled={isLoading}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="Email"
            type="text"
            required
          />
          <div className="relative">
            <Input
              disabled={isLoading}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
        <Separator />
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      </CardContent>
    </Card>
  );
};
