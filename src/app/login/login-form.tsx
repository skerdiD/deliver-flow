"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { routes } from "@/config/routes";
import {
  loginSchema,
  type LoginValues,
} from "@/features/auth/auth-validation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return routes.home;
  }

  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authError, setAuthError] = useState(() => {
    const error = searchParams.get("error");

    if (error === "profile_missing") {
      return "Your account exists, but the profile is not ready yet. Please try again or ask the project owner to check your account.";
    }

    if (error === "role_invalid") {
      return "Your account role could not be verified. Ask the project owner to review your access.";
    }

    if (error === "client_missing") {
      return "Your account is not connected to an active client invite yet. Open your invite link or ask your project owner for a new invite.";
    }

    return "";
  });

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setIsLoading(true);
    setAuthError("");

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setAuthError("Email or password is incorrect.");
      setIsLoading(false);
      return;
    }

    router.replace(getSafeNextPath(searchParams.get("next")));
    router.refresh();
  }

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {authError ? (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-11 w-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="border-t border-slate-200 px-5 py-4 sm:px-6">
        <p className="w-full text-center text-sm leading-6 text-slate-600">
          Need access? Ask your project owner for an invite.
        </p>
      </CardFooter>
    </Card>
  );
}
