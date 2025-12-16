"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useInviteDetails, useAcceptInvite } from "@/hooks/useInvites";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type InviteAcceptancePageProps = {
  token: string;
};

export function InviteAcceptancePage({ token }: InviteAcceptancePageProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const {
    data: inviteDetails,
    isLoading: inviteLoading,
    error: inviteError,
  } = useInviteDetails(token);
  const acceptInvite = useAcceptInvite();

  console.log("token", token);
  console.log("inviteDetails", inviteDetails);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsAuthenticated(!!user);
      setUserEmail(user?.email || null);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // If authenticated and invite details are loaded, try to accept
    if (
      isAuthenticated === true &&
      inviteDetails &&
      !acceptInvite.isPending &&
      !acceptInvite.isSuccess
    ) {
      // Check if email matches
      if (inviteDetails.email && userEmail) {
        if (inviteDetails.email.toLowerCase() !== userEmail.toLowerCase()) {
          // Email mismatch - show error
          return;
        }
      }

      // Accept the invite
      handleAcceptInvite();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    inviteDetails,
    userEmail,
    acceptInvite.isPending,
    acceptInvite.isSuccess,
  ]);

  async function handleAcceptInvite() {
    if (!token) return;

    try {
      await acceptInvite.mutateAsync(token);
      // Redirect to dashboard on success
      router.push(`/dashboard/${inviteDetails?.heap_id}`);
    } catch (error) {
      // Error is handled by the mutation state
      console.error("Failed to accept invite:", error);
    }
  }

  // Loading state
  if (inviteLoading || isAuthenticated === null) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground">
                Loading invite...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state - invite not found or invalid
  if (inviteError || !inviteDetails) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Invalid Invite</CardTitle>
              <CardDescription>
                This invite link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If authenticated, check email match and accept
  if (isAuthenticated) {
    // Check email mismatch
    if (inviteDetails.email && userEmail) {
      if (inviteDetails.email.toLowerCase() !== userEmail.toLowerCase()) {
        return (
          <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
              <Card>
                <CardHeader>
                  <CardTitle>Email Mismatch</CardTitle>
                  <CardDescription>
                    This invite is for {inviteDetails.email}, but you are logged
                    in as {userEmail}. Please log out and sign in with the
                    correct email address.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() =>
                      router.push(`/dashboard/${inviteDetails?.heap_id}`)
                    }
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }
    }

    // Show accepting state or success
    if (acceptInvite.isPending) {
      return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-sm text-muted-foreground">
                  Accepting invite...
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    if (acceptInvite.isSuccess) {
      return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <Card>
              <CardHeader>
                <CardTitle>Invite Accepted!</CardTitle>
                <CardDescription>
                  You have been added to the space. Redirecting...
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      );
    }

    if (acceptInvite.error) {
      return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <Card>
              <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>
                  {acceptInvite.error.message || "Failed to accept invite"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
  }

  // Not authenticated - show login/signup
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>You&apos;ve been invited!</CardTitle>
            <CardDescription>
              {inviteDetails.email
                ? `Sign in or create an account with ${inviteDetails.email} to accept this invite.`
                : "Sign in or create an account to accept this invite."}
            </CardDescription>
          </CardHeader>
        </Card>

        {showSignUp ? (
          <div>
            <SignUpFormWithRedirect token={token} />
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <button
                onClick={() => setShowSignUp(false)}
                className="underline underline-offset-4"
              >
                Login
              </button>
            </div>
          </div>
        ) : (
          <div>
            <LoginFormWithRedirect token={token} />
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setShowSignUp(true)}
                className="underline underline-offset-4"
              >
                Sign up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper components that handle redirect after auth
function LoginFormWithRedirect({ token }: { token: string }) {
  const { data: inviteDetails } = useInviteDetails(token);
  const [email, setEmail] = useState(inviteDetails?.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update email when inviteDetails loads
  useEffect(() => {
    if (inviteDetails?.email) {
      setEmail(inviteDetails.email);
    }
  }, [inviteDetails?.email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Validate email match if invite has an email
    if (inviteDetails?.email) {
      if (inviteDetails.email.toLowerCase() !== email.toLowerCase()) {
        setError(
          `This invite is for ${inviteDetails.email}. Please use that email address.`
        );
        setIsLoading(false);
        return;
      }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Reload page to trigger invite acceptance
      window.location.href = `/invite/${token}`;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!inviteDetails?.email}
              />
              {inviteDetails?.email && (
                <p className="text-xs text-muted-foreground">
                  This invite is for {inviteDetails.email}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SignUpFormWithRedirect({ token }: { token: string }) {
  const { data: inviteDetails } = useInviteDetails(token);
  const [email, setEmail] = useState(inviteDetails?.email || "");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update email when inviteDetails loads
  useEffect(() => {
    if (inviteDetails?.email) {
      setEmail(inviteDetails.email);
    }
  }, [inviteDetails?.email]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate invite token and email match
    if (!inviteDetails) {
      setError("Invalid invite. Please check the invite link.");
      setIsLoading(false);
      return;
    }

    if (inviteDetails.isExpired) {
      setError("This invite has expired.");
      setIsLoading(false);
      return;
    }

    if (inviteDetails.isUsed) {
      setError("This invite has already been used.");
      setIsLoading(false);
      return;
    }

    // Check email match if invite has an email
    if (inviteDetails.email) {
      if (inviteDetails.email.toLowerCase() !== email.toLowerCase()) {
        setError(
          `This invite is for ${inviteDetails.email}. Please use that email address.`
        );
        setIsLoading(false);
        return;
      }
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/invite/${token}`,
        },
      });
      if (error) throw error;
      // After signup, redirect to invite page
      window.location.href = `/invite/${token}`;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSignUp}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!inviteDetails?.email}
              />
              {inviteDetails?.email && (
                <p className="text-xs text-muted-foreground">
                  This invite is for {inviteDetails.email}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="repeat-password">Repeat Password</Label>
              <Input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating an account..." : "Sign up"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
