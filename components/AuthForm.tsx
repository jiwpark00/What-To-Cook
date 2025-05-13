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
        <>
            <div className="mb-4 text-sm text-yellow-300 text-center">
                ⚠️ At this point, new signups are disabled.
            </div>

            <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                theme="dark"
                providers={[]}
                view="sign_in"
            />
            <style jsx global>{`
        /* Hide Sign Up tab and link */
        [data-testid="auth-sign-up"],
        a[href="#auth-sign-up"] {
          display: none !important;
        }

        /* Hide Forgot Password link */
        a[href="#auth-forgot-password"],
        [data-testid="auth-forgot-password"] {
          display: none !important;
        }

        /* Hide Sign In tab (if already on it, for simplicity) */
        a[href="#auth-sign-in"] {
          display: none !important;
        }
      `}</style>
        </>
    )
}
