"use client"

import VerifyMail from "@/components/shared/Auth/VerifyMail/VerifyMail"
import { useSearchParams } from "next/navigation"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  
  return (
    <VerifyMail email={email || undefined} />
  )
}
