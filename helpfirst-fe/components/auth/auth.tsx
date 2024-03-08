import { useState } from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { SigninDialog } from "./signin-dialog";
import { SignupDialog } from "./signup-dialog";
import { Button } from "../ui/button";

export const AuthType = {
  SIGNIN: "signin",
  SIGNUP: "signup",
};

export default function Auth() {
  const [authType, setAuthType] = useState<string>(AuthType.SIGNIN);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" id="dialog-auth-btn">
          {authType === AuthType.SIGNIN ? "Signin" : "Signup"}
        </Button>
      </DialogTrigger>
      {authType === AuthType.SIGNIN ? (
        <SigninDialog setAuthType={setAuthType} />
      ) : (
        <SignupDialog setAuthType={setAuthType} />
      )}
    </Dialog>
  );
}
