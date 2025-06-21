"use client"

import { useEffect, useState } from "react"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// List of legitimate email providers
const LEGITIMATE_EMAIL_PROVIDERS = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
    'aol.com', 'protonmail.com', 'zoho.com', 'mail.com', 'yandex.com',
    'live.com', 'msn.com', 'comcast.net', 'verizon.net', 'att.net',
    'sbcglobal.net', 'charter.net', 'cox.net', 'earthlink.net',
    'fastmail.com', 'tutanota.com', 'gmx.com', 'web.de', 'mail.ru'
]

// Disposable email providers to block
const DISPOSABLE_EMAIL_PROVIDERS = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'throwaway.email', 'temp-mail.org', 'getnada.com', 'sharklasers.com',
    'yopmail.com', 'maildrop.cc', 'trashmail.com', 'emailondeck.com'
]

function validateEmail(email) {
    if (!email) return { isValid: false, error: 'Email is required' }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Please enter a valid email address' }
    }

    const domain = email.toLowerCase().split('@')[1]

    if (DISPOSABLE_EMAIL_PROVIDERS.includes(domain)) {
        return {
            isValid: false,
            error: 'Temporary email addresses are not allowed. Please use Gmail, Yahoo, Outlook, etc.'
        }
    }

    if (!LEGITIMATE_EMAIL_PROVIDERS.includes(domain)) {
        return {
            isValid: false,
            error: `We only accept emails from major providers. "${domain}" is not supported.`
        }
    }

    return { isValid: true, error: null }
}

export default function AuthForm() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [isValidating, setIsValidating] = useState(false)

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN") {
                router.push("/")
            }
        })
        return () => listener.subscription.unsubscribe()
    }, [router])

    // Intercept form submissions to validate email
    useEffect(() => {
        const handleFormSubmit = (e) => {
            const form = e.target.closest('form')
            if (!form) return

            const emailInput = form.querySelector('input[type="email"]')
            if (!emailInput) return

            const emailValue = emailInput.value
            const validation = validateEmail(emailValue)

            if (!validation.isValid) {
                e.preventDefault()
                e.stopPropagation()
                setError(validation.error)
                return false
            }

            setError('')
        }

        // Listen for form submissions on the Auth component
        document.addEventListener('submit', handleFormSubmit, true)
        return () => document.removeEventListener('submit', handleFormSubmit, true)
    }, [])

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="mb-4 text-sm text-blue-300 text-center p-3 bg-blue-900/20 rounded">
                ℹ️ Only Gmail, Yahoo, Outlook and other major email providers are accepted
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <Auth
                supabaseClient={supabase}
                appearance={{
                    theme: ThemeSupa,
                    variables: {
                        default: {
                            colors: {
                                brand: '#3b82f6',
                                brandAccent: '#1d4ed8',
                            }
                        }
                    }
                }}
                theme="dark"
                providers={[]}
                showLinks={true}
                magicLink={false}
            />

            <style jsx global>{`
    /* Hide only Forgot Password link */
    a[href="#auth-forgot-password"],
    [data-testid="auth-forgot-password"] {
        display: none !important;
    }
`}</style>
        </div>
    )
}