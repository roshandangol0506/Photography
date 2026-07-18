import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message;
  }
  return fallback;
}

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
});

type CredentialsForm = z.infer<typeof credentialsSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export default function Login() {
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const credentialsForm = useForm<CredentialsForm>({
    resolver: zodResolver(credentialsSchema),
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  const onCredentialsSubmit = async (values: CredentialsForm) => {
    try {
      const result = await login(values.email, values.password);
      if (result.otpRequired) {
        setPendingEmail(result.email ?? values.email);
        toast.info("A verification code has been sent to your email");
      } else {
        toast.success("Welcome back");
        navigate("/admin", { replace: true });
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid credentials"));
    }
  };

  const onOtpSubmit = async (values: OtpForm) => {
    if (!pendingEmail) return;
    try {
      await verifyOtp(pendingEmail, values.otp);
      toast.success("Welcome back");
      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid code"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-lg">
        <h1 className="mb-1 text-2xl font-semibold text-card-foreground">
          Admin Login
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {pendingEmail
            ? "Enter the verification code sent to your email"
            : "Sign in to manage your portfolio"}
        </p>

        {!pendingEmail ? (
          <form
            onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...credentialsForm.register("email")}
              />
              {credentialsForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {credentialsForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...credentialsForm.register("password")}
              />
              {credentialsForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {credentialsForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={credentialsForm.formState.isSubmitting}
            >
              {credentialsForm.formState.isSubmitting
                ? "Signing in..."
                : "Sign in"}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(onOtpSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="otp">Verification code</Label>
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                {...otpForm.register("otp")}
              />
              {otpForm.formState.errors.otp && (
                <p className="text-xs text-destructive">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={otpForm.formState.isSubmitting}
            >
              {otpForm.formState.isSubmitting ? "Verifying..." : "Verify"}
            </Button>
            <button
              type="button"
              onClick={() => setPendingEmail(null)}
              className="w-full text-center text-xs text-muted-foreground hover:underline"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
