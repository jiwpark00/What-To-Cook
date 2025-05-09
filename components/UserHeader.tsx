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
        <div className="flex items-center justify-bottom bg-gray-100 p-4 mb-4 rounded">
            <span className="text-sm text-gray-700">Logged in as: <strong>{email}</strong></span>
            <button
                onClick={handleLogout}
                className="text-sm text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-100"
            >
                Log out
            </button>
        </div>
    )
}