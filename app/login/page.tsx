import AuthForm from "@/components/AuthForm"

export default function LoginPage() {
    return (
        <main className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <AuthForm />
        </main>
    )
}