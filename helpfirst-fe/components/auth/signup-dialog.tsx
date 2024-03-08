import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import GoogleLogo from "./google-logo";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useGoogleLogin } from "@react-oauth/google";
import useAuthStore from "@/store/useAuthStore";
import { useToast } from "@/components/ui/use-toast";
import { Dispatch, SetStateAction } from "react";
import { AuthType } from "./auth";
import axios from "axios";

interface SignupDialogProps {
  setAuthType: Dispatch<SetStateAction<string>>;
}

interface SignupForm {
  email: string;
  name: string;
  password: string;
}

const SignupSchema = Yup.object().shape({
  email: Yup.string().email("email is not valid").required("email is required"),
  name: Yup.string().required("name is required"),
  password: Yup.string()
    .min(8, "password should have at least 8 character length")
    .matches(/[a-z]/, "password must include lowercase characters")
    .matches(/[A-Z]/, "password must include uppercase characters")
    .matches(/[0-9]/, "password must include a number")
    .required("password is required"),
});

export function SignupDialog({ setAuthType }: SignupDialogProps) {
  const { setAccessToken, setUser } = useAuthStore();
  const { toast } = useToast();

  const signupWithCredentialHandler = async (
    values: SignupForm,
    { setSubmitting }: FormikHelpers<SignupForm>,
  ) => {
    setSubmitting(true);
    try {
      const {
        data: {
          accessToken,
          message,
          user: { id, avatar, email, name },
        },
      } = await axios.post("/api/auth/signup", values);
      setUser({ name: name, id: id, email: email, image: avatar });
      setAccessToken(accessToken);
      toast({
        title: "Login Success",
        description: message,
        variant: "default",
      });
      document.getElementById("close-login-popup")?.click();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error,
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  const signupWithGoogleHandler = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      try {
        const {
          data: {
            accessToken,
            user: { id, avatar, email, name },
          },
        } = await axios.post("/api/auth/google", {
          token: access_token,
        });
        setUser({ name: name, id: id, email: email, image: avatar });
        setAccessToken(accessToken);
        toast({
          title: "Signup Success",
          description: "Registration success",
          variant: "default",
        });
        document.getElementById("close-login-popup")?.click();
      } catch (err: any) {
        toast({
          title: "Error",
          description: err?.response?.data?.error,
          variant: "destructive",
        });
      }
    },
    onError: (errorResponse) => {
      toast({
        title: "Error",
        description: errorResponse.error_description,
        variant: "destructive",
      });
    },
    flow: "implicit",
  });

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <div className="mt-5 flex flex-col space-y-2 text-center">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Register your account
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill the form bellow to regiter your account
          </DialogDescription>
        </div>
      </DialogHeader>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="grid gap-6">
          <Formik
            initialValues={{
              email: "",
              name: "",
              password: "",
            }}
            onSubmit={signupWithCredentialHandler}
            validationSchema={SignupSchema}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <label
                      className="sr-only text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <Field
                      name="email"
                      id="email"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="name@example.com"
                      type="email"
                    />
                    <div className="px-4 text-xs text-red-500">
                      <ErrorMessage name="email" />
                    </div>
                  </div>
                  <div className="grid gap-1">
                    <label
                      className="sr-only text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <Field
                      name="name"
                      id="name"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="name"
                      type="text"
                    />
                    <div className="px-4 text-xs text-red-500">
                      <ErrorMessage name="name" />
                    </div>
                  </div>
                  <div className="grid gap-1">
                    <label
                      className="sr-only text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <Field
                      name="password"
                      id="password"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="password"
                      type="password"
                    />
                    <div className="px-4 text-xs text-red-500">
                      <ErrorMessage name="password" />
                    </div>
                  </div>
                  <Button
                    disabled={isSubmitting}
                    className="disable:cursor-not-allowed inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <div
                          className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                          role="status"
                        />
                        <span>Loading...</span>
                      </>
                    ) : (
                      "Sign In with Email"
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            variant="outline"
            onClick={() => signupWithGoogleHandler()}
          >
            <GoogleLogo className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>
      </div>
      <DialogFooter>
        <div className="w-full px-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <span
            className="cursor-pointer underline underline-offset-4 hover:text-primary"
            onClick={() => {
              setAuthType(AuthType.SIGNIN);
            }}
          >
            Signin
          </span>
        </div>
      </DialogFooter>
      <DialogClose id="close-login-popup" className="hidden" />
    </DialogContent>
  );
}
