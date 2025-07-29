"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/", label: "Home" },
    { href: "/recent", label: "Recent" },
    { href: "/recipes", label: "Recipes" },
];

export default function NavBar() {
    const pathname = usePathname();

    return (
        <nav className="mb-8 flex gap-4 items-center px-6 py-3 bg-gray-900 backdrop-blur-md">
            {links.map(({ href, label }) => (
                <Link
                    key={href}
                    href={href}
                    className={`rounded-md px-4 py-2 font-medium transition-all duration-200 text-base focus:outline-none border border-transparent
                        ${pathname === href
                            ? "text-white border-white"
                            : "text-gray-200 hover:border-white hover:text-white"}`}
                >
                    {label}
                </Link>
            ))}
        </nav>
    );
}