import Link from "next/link"
import { ArrowRight, CalendarCheck, HeartHandshake, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    title: "Find a Shift",
    description: "Browse open volunteer events and pick a time that works for you.",
    icon: CalendarCheck,
  },
  {
    title: "Track Volunteers",
    description: "Coordinators manage the full volunteer directory in one place.",
    icon: Users,
  },
  {
    title: "Make an Impact",
    description: "Every shift filled helps your community events run smoothly.",
    icon: HeartHandshake,
  },
]

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col bg-linear-to-b from-background to-zinc-50/50 dark:to-zinc-950/20">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-primary to-violet-500 text-primary-foreground shadow-sm shadow-primary/20">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight">Volunteer Shift Scheduler</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">Sign Up</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 pb-16 pt-8 text-center sm:pt-16">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
          Welcome
        </span>
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Organize volunteer shifts without the spreadsheets
        </h1>
        <p className="mt-4 max-w-xl text-balance text-sm text-muted-foreground sm:text-base">
          Coordinators manage events and volunteers from a single dashboard,
          while volunteers browse open shifts and sign up in a few clicks.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="font-semibold">
            <Link href="/auth/register">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-semibold">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid w-full gap-4 text-left sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="shadow-xs">
                <CardContent className="space-y-3 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <p className="mt-12 font-mono text-xs text-muted-foreground">
          Press <kbd className="rounded border bg-muted px-1.5 py-0.5">d</kbd> to toggle dark mode
        </p>
      </main>
    </div>
  )
}