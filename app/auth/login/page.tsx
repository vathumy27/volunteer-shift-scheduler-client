"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/providers/auth-provider"
import { GuestRoute } from "@/components/auth-guard"

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
})

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const response = await login(data.email, data.password)
      toast.success("Logged in successfully!")
      
      // Redirect based on role
      if (response.user?.role === "admin" || response.user?.role === "lecturer") {
        router.push("/admin/dashboard")
      } else {
        router.push("/students/dashboard")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.errors?.[0] ||
        "Failed to log in. Please try again."
      toast.error(errorMsg)
    }
  }

  return (
    <GuestRoute>
      <div className="flex min-h-svh flex-col items-center justify-center p-6 bg-linear-to-b from-background to-zinc-50/50 dark:to-zinc-950/20">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
        <Card className="w-full sm:max-w-md shadow-lg border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="">
                {/* Email field */}
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="name@example.com"
                        autoComplete="email"
                        className="w-full"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Password field */}
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="password"
                        aria-invalid={fieldState.invalid}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" form="login-form" className="w-full font-semibold">
              Sign In
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-primary font-medium underline hover:text-primary/95">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </GuestRoute>
  )
}