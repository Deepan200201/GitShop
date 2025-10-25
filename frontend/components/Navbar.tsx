"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { Button, buttonVariants } from "@/components/ui/button";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();

    return (
        <nav className="bg-card border-b border-border shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div onClick={() => router.push('/')} className="cursor-pointer font-bold text-xl flex items-center gap-2">
                    <span className="text-primary">Git</span>Shop
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    {user && user.role === 'consumer' && (
                        <Link href="/cart" className="text-sm font-medium hover:text-blue-600">Cart</Link>
                    )}
                    {user && (user.role === 'seller' || user.role === 'admin') && (
                        <Link href="/dashboard" className="text-sm font-medium hover:text-blue-600">Dashboard</Link>
                    )}

                    {!user ? (
                        <div className="flex gap-2">
                            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                                Login
                            </Link>
                            <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                                Sign Up
                            </Link>
                        </div>
                    ) : null} {/* Removed the else part here */}

                    {user && user.role === "seller" && (
                        <>
                            <Link href="/dashboard/orders" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Merchant Orders
                            </Link>
                        </>
                    )}
                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                                {user.full_name || user.email}
                            </Link>
                            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </nav>
    );
}
