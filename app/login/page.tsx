import AuthForm from "@/components/AuthForm"

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4">
            <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-6 md:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-300">Sign in to access your saved ingredients and recipes</p>
                    </div>
                    <AuthForm />
                </div>
            </div>
        </main>
    )
}