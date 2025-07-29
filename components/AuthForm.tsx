"use client"

import { useEffect, useState } from "react"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AuthForm() {
    const router = useRouter()
    const [captchaText, setCaptchaText] = useState("")
    const [captchaInput, setCaptchaInput] = useState("")
    const [captchaVerified, setCaptchaVerified] = useState(false)
    const [captchaError, setCaptchaError] = useState("")

    // Generate random CAPTCHA text
    const generateCaptcha = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        let result = ""
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setCaptchaText(result)
        setCaptchaInput("")
        setCaptchaVerified(false)
        setCaptchaError("")
    }

    // Verify CAPTCHA
    const verifyCaptcha = () => {
        if (captchaInput.toUpperCase() === captchaText) {
            setCaptchaVerified(true)
            setCaptchaError("")
        } else {
            setCaptchaError("CAPTCHA verification failed. Please try again.")
            generateCaptcha()
        }
    }

    useEffect(() => {
        generateCaptcha()
    }, [])

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
            <div className="mb-6 text-sm text-purple-300 text-center p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Only Gmail, Yahoo, Outlook and other major email providers are accepted
            </div>

            {/* CAPTCHA Section */}
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                    Security Verification
                </label>
                
                <div className="flex items-center gap-4 mb-3">
                    <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-3 min-w-[120px] text-center">
                        <div 
                            className="text-xl font-mono font-bold text-white tracking-wider select-none"
                            style={{
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                transform: 'skew(-5deg)',
                                letterSpacing: '3px'
                            }}
                        >
                            {captchaText}
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={generateCaptcha}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Generate new CAPTCHA"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        placeholder="Enter the characters above"
                        className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={captchaVerified}
                    />
                    
                    {!captchaVerified && (
                        <button
                            type="button"
                            onClick={verifyCaptcha}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                            Verify
                        </button>
                    )}
                    
                    {captchaVerified && (
                        <div className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Verified
                        </div>
                    )}
                </div>
                
                {captchaError && (
                    <p className="text-red-400 text-sm mt-2">{captchaError}</p>
                )}
            </div>

            {/* Auth Form - Only show when CAPTCHA is verified */}
            <div className={`transition-opacity duration-300 ${!captchaVerified ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <Auth
                    supabaseClient={supabase}
                    appearance={{
                        theme: ThemeSupa,
                        variables: {
                            default: {
                                colors: {
                                    brand: '#8b5cf6',
                                    brandAccent: '#7c3aed',
                                    brandButtonText: 'white',
                                    defaultButtonBackground: '#374151',
                                    defaultButtonBackgroundHover: '#4b5563',
                                    defaultButtonBorder: '#6b7280',
                                    defaultButtonText: 'white',
                                    dividerBackground: '#4b5563',
                                    inputBackground: '#374151',
                                    inputBorder: '#6b7280',
                                    inputBorderHover: '#8b5cf6',
                                    inputBorderFocus: '#8b5cf6',
                                    inputText: 'white',
                                    inputLabelText: '#d1d5db',
                                    inputPlaceholder: '#9ca3af',
                                    messageText: '#f3f4f6',
                                    messageTextDanger: '#fca5a5',
                                    anchorTextColor: '#a78bfa',
                                    anchorTextHoverColor: '#8b5cf6'
                                },
                                space: {
                                    spaceSmall: '4px',
                                    spaceMedium: '8px',
                                    spaceLarge: '16px',
                                    buttonPadding: '12px 16px',
                                    inputPadding: '12px 16px'
                                },
                                radii: {
                                    borderRadiusButton: '8px',
                                    inputBorderRadius: '8px'
                                }
                            }
                        }
                    }}
                    theme="dark"
                    providers={[]}
                    view="sign_in"
                />
            </div>
            
            {!captchaVerified && (
                <div className="text-center mt-4 text-sm text-gray-400">
                    Please complete the security verification above to continue
                </div>
            )}

            <style jsx global>{`
                /* Hide only Forgot Password link */
                a[href="#auth-forgot-password"],
                [data-testid="auth-forgot-password"] {
                    display: none !important;
                }
                
                /* Additional styling for better integration */
                .supabase-auth-ui_ui {
                    background: transparent !important;
                }
                
                .supabase-auth-ui_ui button[type="submit"] {
                    background: linear-gradient(to right, #8b5cf6, #7c3aed) !important;
                    border: none !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }
                
                .supabase-auth-ui_ui button[type="submit"]:hover {
                    opacity: 0.9 !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3) !important;
                }
                
                .supabase-auth-ui_ui input {
                    transition: all 0.2s ease !important;
                }
                
                .supabase-auth-ui_ui input:focus {
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3) !important;
                }
            `}</style>
        </>
    )
}