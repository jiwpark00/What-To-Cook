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
            <div className="mb-4 text-sm text-blue-300 text-center p-3 bg-blue-900/20 rounded">
                ℹ️ Only Gmail, Yahoo, Outlook and other major email providers are accepted
            </div>

            <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                theme="dark"
                providers={[]}
                view="sign_in"
            />

            <style jsx global>{`
                /* Hide only Forgot Password link */
                a[href="#auth-forgot-password"],
                [data-testid="auth-forgot-password"] {
                    display: none !important;
                }
            `}</style>
        </>
    )
}