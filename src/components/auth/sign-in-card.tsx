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
import { useLoginWithPasswordEmail } from "@/hooks/auth/use-sign-in-with-passwod-email";
import { useRouter } from "next/navigation";
export const SignInCard = () => {
  const router = useRouter();
  const { login } = useLoginWithPasswordEmail();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(email, password);
    const res = login(email, password, {
      onError: (error) => {
        setErrorMessage("INvalid user or password")
        console.log(error);
      },
      onSuccess: () => {
        console.log("login success");
        router.replace("/");
      },
    });

    console.log(res, "ress");
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
            disabled={false}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="Email"
            type="username"
            required
          />
          <Input
            disabled={false}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="Password"
            type="password"
            required
          />

          <Button
            type={"submit"}
            className="w-full "
            size="lg"
            disabled={false}
          >
            Continue
          </Button>
        </form>
        <Separator />
        {errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}
      </CardContent>
    </Card>
  );
};
