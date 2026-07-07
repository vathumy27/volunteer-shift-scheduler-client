"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">403 — Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have permission to view this page. Admin and organizer
            areas are restricted to those roles only.
          </p>
          <Button asChild className="w-full">
            <Link href="/volunteers/dashboard">Go to Volunteer Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
