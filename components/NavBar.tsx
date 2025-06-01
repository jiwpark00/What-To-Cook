"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/", label: "Home" },
    { href: "/recent", label: "Recent" },
];

export default function NavBar() {
    const pathname = usePathname();

    return (
        <nav className="mb-6 flex gap-4 border-b pb-2">
            {links.map(({ href, label }) => (
                <Link
                    key={href}
                    href={href}
                    className={`rounded-md px-3 py-1 transition
                        ${pathname === href
                            ? "bg-gray-900 text-white"
                            : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                >
                    {label}
                </Link>
            ))}
        </nav>
    );
}