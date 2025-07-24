"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function UserHeader() {
    const [email, setEmail] = useState<string | null>(null)

    useEffect(() => {
        const getSessionUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const user = session?.user
            console.log("Current user:", user)
            setEmail(user?.email || null)
        }

        getSessionUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.reload()
    }

    if (!email) return null

    return (
        <div className="flex items-center justify-between bg-gray-800 p-4 mb-6 rounded-xl border border-gray-700">
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-300">Logged in as <span className="font-medium text-white">{email}</span></span>
            </div>
            <button
                onClick={handleLogout}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Sign out
            </button>
        </div>
    )
}