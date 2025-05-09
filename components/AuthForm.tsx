"use client"

import { useEffect } from "react"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AuthForm() {

    const router = useRouter()

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN") {
                console.log("Signed in - redirecting to home")
                router.push("/")
            }
        })

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [router])

    return (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={[]}
        />
    )
}
