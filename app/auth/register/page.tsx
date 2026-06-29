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
  role: z
    .string()
    .min(1, "Role is required."),
})

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "volunteer",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await register(data.email, data.password, data.role)
      toast.success("Account registered successfully! Please sign in.")
      router.push("/auth/login")
    } catch (error: any) {
      console.error("Registration error:", error)
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.errors?.[0] ||
        "Failed to register. Please try again."
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
            <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
            <CardDescription>
              Enter details below to create your account and get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                        autoComplete="new-password"
                        className="w-full"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Role selection field - limited to student/lecturer */}
                <Controller
                  name="role"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                      <select
                        id={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                        className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1.5 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-zinc-900 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                      >
                        <option value="volunteer">volunteer</option>
                        <option value="organizer">organizer</option>
                      </select>
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
            <Button type="submit" form="register-form" className="w-full font-semibold">
              Sign Up
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary font-medium underline hover:text-primary/95">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </GuestRoute>
  )
}